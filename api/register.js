import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import fs from "fs";
import { validateApiPayload, validateRegistrationLimit, MAX_REGISTRATIONS } from "./validation.js";

export const config = {
    api: {
        bodyParser: false, // Required for formidable
    },
};

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const form = formidable({
        multiples: false,
        keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("FORM PARSE ERROR:", err);
            return res.status(400).json({ error: "File parsing failed: " + err.message });
        }

        try {
            // Helper to get value from formidable fields (which might be arrays)
            const getField = (key) => Array.isArray(fields[key]) ? fields[key][0] : fields[key];

            const first_name = getField("first_name");
            const last_name = getField("last_name");
            const email = getField("email");
            const phone = getField("phone");
            const college = getField("college");
            const category = getField("category");
            const transaction_id = getField("transaction_id");

            // 1. Check Registration Limit FIRST
            const { count, error: countError } = await supabase
                .from("registrations")
                .select("*", { count: "exact", head: true });

            if (countError) throw countError;

            const limitCheck = validateRegistrationLimit(count);
            if (!limitCheck.valid) {
                return res.status(429).json({ error: limitCheck.error });
            }

            // 2. Simple validation
            if (!first_name || !email || !transaction_id) {
                return res.status(400).json({ error: "Required fields (Name, Email, Transaction ID) missing." });
            }

            // 3. Handle File Upload
            const fileArray = files.college_id;
            if (!fileArray || !fileArray[0]) {
                return res.status(400).json({ error: "ID Proof file missing." });
            }

            const uploadedFile = fileArray[0];
            if (!uploadedFile.filepath) {
                return res.status(400).json({ error: "Invalid file path." });
            }

            const fileBuffer = fs.readFileSync(uploadedFile.filepath);
            const fileExt = uploadedFile.originalFilename?.split(".").pop() || "png";
            const filePath = `registrations/${Date.now()}-${email.replace(/@/g, '_')}.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("id-proofs")
                .upload(filePath, fileBuffer, {
                    contentType: uploadedFile.mimetype,
                });

            if (uploadError) {
                return res.status(500).json({ error: "Upload error: " + uploadError.message });
            }

            const { data: publicUrlData } = supabase.storage
                .from("id-proofs")
                .getPublicUrl(filePath);

            const publicUrl = publicUrlData.publicUrl;

            // 4. Insert into database
            const insertPayload = {
                first_name,
                last_name,
                email,
                phone,
                college,
                category,
                id_proof_url: publicUrl,
                id_proof_path: filePath,
                transaction_id,
            };

            const { error: dbError } = await supabase
                .from("registrations")
                .insert(insertPayload);

            if (dbError) {
                console.error("SUPABASE DB ERROR:", dbError);
                // Cleanup uploaded file if DB insert fails
                await supabase.storage.from("id-proofs").remove([filePath]);
                return res.status(500).json({ error: "Database error: " + dbError.message });
            }

            return res.status(200).json({
                success: true,
                message: "Registration successful",
            });

        } catch (error) {
            console.error("SERVER ERROR:", error);
            return res.status(500).json({
                error: "Server error: " + error.message,
            });
        }
    });
}