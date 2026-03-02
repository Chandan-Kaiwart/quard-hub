import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import fs from "fs";
import { validateApiPayload } from "./validation";

export const config = {
    api: {
        bodyParser: false,
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
        console.log("--- API DEBUG START ---");
        console.log("FIELDS:", JSON.stringify(fields, null, 2));
        console.log("FILES:", Object.keys(files));

        if (err) {
            console.error("FORM PARSE ERROR:", err);
            return res.status(400).json({ error: "File parsing failed: " + err.message });
        }

        try {
            const {
                first_name,
                last_name,
                email,
                phone,
                college,
                category,
                transaction_id,
            } = fields;

            // Simple validation on fields
            if (!first_name || !email || !transaction_id) {
                console.error("MISSING FIELDS:", { first_name, email, transaction_id });
                return res.status(400).json({ error: "Required fields (Name, Email, Transaction ID) missing." });
            }

            // 🔥 FIX STARTS HERE
            const fileArray = files.college_id;

            if (!fileArray || !fileArray[0]) {
                return res.status(400).json({ error: "File missing." });
            }

            const uploadedFile = fileArray[0];

            if (!uploadedFile.filepath) {
                return res.status(400).json({ error: "Invalid file path." });
            }

            const fileBuffer = fs.readFileSync(uploadedFile.filepath);

            const fileExt = uploadedFile.originalFilename
                ?.split(".")
                .pop();

            const filePath = `registrations/${Date.now()}.${fileExt}`;
            // 🔥 FIX ENDS HERE

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("id-proofs")
                .upload(filePath, fileBuffer, {
                    contentType: uploadedFile.mimetype,
                });

            if (uploadError) {
                return res.status(500).json({ error: uploadError.message });
            }

            const { data: publicUrlData } = supabase.storage
                .from("id-proofs")
                .getPublicUrl(filePath);

            const publicUrl = publicUrlData.publicUrl;

            // Insert into database
            const insertPayload = {
                first_name: Array.isArray(first_name) ? first_name[0] : first_name,
                last_name: Array.isArray(last_name) ? last_name[0] : last_name,
                email: Array.isArray(email) ? email[0] : email,
                phone: Array.isArray(phone) ? phone[0] : phone,
                college: Array.isArray(college) ? college[0] : college,
                category: Array.isArray(category) ? category[0] : category,
                id_proof_url: publicUrl,
                id_proof_path: filePath,
                transaction_id: Array.isArray(transaction_id) ? transaction_id[0] : transaction_id,
            };

            console.log("INSERT PAYLOAD:", JSON.stringify(insertPayload, null, 2));

            const { error: dbError } = await supabase
                .from("registrations")
                .insert(insertPayload);

            if (dbError) {
                console.error("SUPABASE DB ERROR:", dbError);
                return res.status(500).json({ error: "Database error: " + dbError.message });
            }

            console.log("--- API DEBUG SUCCESS ---");

            return res.status(200).json({
                success: true,
                message: "Registration successful",
            });

        } catch (error) {
            return res.status(500).json({
                error: "Server error: " + error.message,
            });
        }
    });
}