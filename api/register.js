import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import fs from "fs";

// ✅ service_role bypasses RLS — safe only on server side
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MAX_REGISTRATIONS = 30;

// ─── Disable Next.js default body parser (required for multipart/form-data) ──
export const config = {
    api: {
        bodyParser: false,
    },
};

// ─── Parse multipart form using formidable ────────────────────────────────────
const parseForm = (req) =>
    new Promise((resolve, reject) => {
        const form = formidable({
            maxFileSize: 4 * 1024 * 1024, // 4MB
            allowEmptyFiles: false,
            filter: ({ mimetype }) =>
                !!mimetype && ["image/jpeg", "image/png", "application/pdf"].includes(mimetype),
        });

        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Check total registrations in DB (persistent — survives cold starts)
        const { count, error: countError } = await supabase
            .from("registrations")
            .select("*", { count: "exact", head: true });

        if (countError) return res.status(500).json({ error: "Could not verify registration limit." });

        if (count >= MAX_REGISTRATIONS) {
            return res.status(429).json({ error: "Registration is full. Maximum 30 registrations reached." });
        }

        // Parse multipart form data
        let fields, files;
        try {
            ({ fields, files } = await parseForm(req));
        } catch (parseErr) {
            return res.status(400).json({ error: "Invalid form data: " + parseErr.message });
        }

        // formidable returns arrays for each field — extract first value
        const first_name = fields.first_name?.[0]?.trim();
        const last_name  = fields.last_name?.[0]?.trim();
        const email      = fields.email?.[0]?.trim().toLowerCase();
        const phone      = fields.phone?.[0]?.trim();
        const college    = fields.college?.[0]?.trim();
        const category   = fields.category?.[0]?.trim();
        const file       = files.college_id?.[0];

        if (!first_name || !last_name || !email || !phone || !college || !category || !file) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Read file from temp path formidable wrote it to
        const fileBuffer = fs.readFileSync(file.filepath);
        const ext        = file.originalFilename?.split(".").pop() || "jpg";
        const safeEmail  = email.replace(/[@.]/g, "_");
        const filePath   = `${Date.now()}-${safeEmail}.${ext}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from("id-proofs")
            .upload(filePath, fileBuffer, {
                contentType: file.mimetype || "application/octet-stream",
                cacheControl: "3600",
                upsert: false,
            });

        // Clean up temp file regardless of upload outcome
        fs.unlink(file.filepath, () => {});

        if (uploadError) return res.status(500).json({ error: "Upload failed: " + uploadError.message });

        // Get public URL
        const { data: urlData } = supabase.storage.from("id-proofs").getPublicUrl(filePath);

        // Insert to DB
        const { data, error: dbError } = await supabase
            .from("registrations")
            .insert({
                first_name,
                last_name,
                email,
                phone,
                college,
                category,
                id_proof_url: urlData.publicUrl,
                id_proof_path: filePath,
            })
            .select()
            .single();

        if (dbError) return res.status(500).json({ error: "DB error: " + dbError.message });

        return res.status(200).json(data);

    } catch (e) {
        return res.status(500).json({ error: "Server error: " + e.message });
    }
}