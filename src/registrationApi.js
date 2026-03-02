import { supabase } from "./supabaseClient";
import { validateUploadFile, validateStoragePath, sanitize } from "./components/validation.js";

// ─── Submit Registration ──────────────────────────────────────────────────────
export async function submitRegistration({
    first_name,
    last_name,
    email,
    phone,
    college,
    category,
    id_proof_file,
}) {
    // Step 1: Validate file before uploading
    const fileCheck = validateUploadFile(id_proof_file);
    if (!fileCheck.valid) throw new Error(fileCheck.error);

    // Upload file directly to Supabase Storage from the client.
    // This completely bypasses the serverless function payload limit.
    const ext = id_proof_file.name.split(".").pop();
    const safeEmail = email.replace(/[@.]/g, "_");
    const filePath = `${Date.now()}-${safeEmail}.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from("id-proofs")
        .upload(filePath, id_proof_file, {
            contentType: id_proof_file.type,
            cacheControl: "3600",
            upsert: false,
        });

    if (uploadError) throw new Error("File upload failed: " + uploadError.message);

    // Step 2: Get the public URL of the uploaded file
    const { data: urlData } = supabase.storage
        .from("id-proofs")
        .getPublicUrl(filePath);

    // Step 3: Send only text fields + file URL to the API (tiny payload, no file)
    const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            first_name,
            last_name,
            email,
            phone,
            college,
            category,
            id_proof_url: urlData.publicUrl,
            id_proof_path: filePath,
        }),
    });

    if (!res.ok) {
        // If DB insert fails, clean up the uploaded file
        await supabase.storage.from("id-proofs").remove([filePath]);
        const err = await res.json();
        throw new Error(err.error || "Registration failed");
    }

    return res.json();
}

// ─── Get All Registrations ────────────────────────────────────────────────────
export async function getRegistrations({ category, page = 1, limit = 20 } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from("registrations")
        .select("id, first_name, last_name, email, phone, college, category, created_at", {
            count: "exact",
        })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (category) query = query.eq("category", category);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return { data, total: count, page, limit };
}

// ─── Get Single Registration ──────────────────────────────────────────────────
export async function getRegistrationById(id) {
    const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw new Error("Not found");
    return data;
}

// ─── Delete Registration ──────────────────────────────────────────────────────
export async function deleteRegistration(id) {
    const { data, error: fetchError } = await supabase
        .from("registrations")
        .select("id_proof_path")
        .eq("id", id)
        .single();

    if (fetchError) throw new Error("Registration not found");

    const [, dbResult] = await Promise.all([
        supabase.storage.from("id-proofs").remove([data.id_proof_path]),
        supabase.from("registrations").delete().eq("id", id),
    ]);

    if (dbResult.error) throw new Error(dbResult.error.message);
}