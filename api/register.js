import { createClient } from "@supabase/supabase-js";

// ✅ service_role bypasses RLS — safe only on server side
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Simple in-memory rate limiter ───────────────────────────────────────────
// Resets on every Vercel cold start, but good enough for 40 entry limit
const submissionCount = { count: 0 };
const MAX_REGISTRATIONS = 22;

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
            return res.status(429).json({ error: "Registration is full. Maximum 40 registrations reached." });
        }

        const { first_name, last_name, email, phone, college, category, fileBase64, fileName } = req.body;

        if (!first_name || !last_name || !email || !phone || !college || !category || !fileBase64) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Convert base64 to buffer
        const fileBuffer = Buffer.from(fileBase64, "base64");
        const ext = fileName?.split(".").pop() || "jpg";
        const safeEmail = email.replace(/[@.]/g, "_");
        const filePath = `${Date.now()}-${safeEmail}.${ext}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from("id-proofs")
            .upload(filePath, fileBuffer, {
                contentType: fileName?.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) return res.status(500).json({ error: "Upload failed: " + uploadError.message });

        // Get public URL
        const { data: urlData } = supabase.storage.from("id-proofs").getPublicUrl(filePath);

        // Insert to DB
        const { data, error: dbError } = await supabase
            .from("registrations")
            .insert({ first_name, last_name, email, phone, college, category, id_proof_url: urlData.publicUrl, id_proof_path: filePath })
            .select()
            .single();

        if (dbError) return res.status(500).json({ error: "DB error: " + dbError.message });

        return res.status(200).json(data);

    } catch (e) {
        return res.status(500).json({ error: "Server error: " + e.message });
    }
}