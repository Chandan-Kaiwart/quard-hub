import { createClient } from "@supabase/supabase-js";

// ✅ Server-side Supabase client — uses process.env (NO VITE_ prefix)
// This runs on Vercel's servers, not the user's phone.
// So DNS issues on mobile networks (Jio/BSNL) are completely bypassed.
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const {
        first_name,
        last_name,
        email,
        phone,
        college,
        category,
        fileBase64,
        fileName,
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !college || !category || !fileBase64) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // STEP 1: Convert base64 to buffer and upload to Supabase Storage
        const buffer = Buffer.from(fileBase64, "base64");
        const ext = fileName?.split(".").pop() || "jpg";
        const safeEmail = email.replace(/[@.]/g, "_");
        const filePath = `${Date.now()}-${safeEmail}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("id-proofs")
            .upload(filePath, buffer, {
                contentType: "image/jpeg",
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            return res.status(500).json({ error: "Image upload failed: " + uploadError.message });
        }

        // STEP 2: Get public URL
        const { data: urlData } = supabase.storage
            .from("id-proofs")
            .getPublicUrl(filePath);

        // STEP 3: Insert into DB
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

        if (dbError) {
            return res.status(500).json({ error: "Registration failed: " + dbError.message });
        }

        return res.status(200).json(data);

    } catch (err) {
        return res.status(500).json({ error: "Unexpected error: " + err.message });
    }
}