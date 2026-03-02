import { supabase } from "./supabaseClient";

// ─── Image Compressor ─────────────────────────────────────────────────────────
async function compressImage(file, maxSizeKB = 400) {
    return new Promise((resolve) => {
        if (!file.type.startsWith("image/") || file.size <= maxSizeKB * 1024) {
            return resolve(file);
        }

        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        img.onload = () => {
            let { width, height } = img;
            const MAX_DIM = 1200;

            if (width > MAX_DIM || height > MAX_DIM) {
                if (width > height) {
                    height = Math.round((height / width) * MAX_DIM);
                    width = MAX_DIM;
                } else {
                    width = Math.round((width / height) * MAX_DIM);
                    height = MAX_DIM;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })),
                "image/jpeg",
                0.75
            );
        };

        img.onerror = () => resolve(file);
        img.src = URL.createObjectURL(file);
    });
}

// ─── Convert File to Base64 ───────────────────────────────────────────────────
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]); // strip "data:...;base64,"
        reader.onerror = () => reject(new Error("File read failed"));
        reader.readAsDataURL(file);
    });
}

// ─── Submit Registration ──────────────────────────────────────────────────────
// ✅ Now calls /api/register (Vercel server) instead of Supabase directly.
// This fixes "Failed to fetch" on Jio/BSNL/mobile networks with DNS issues.
// Flow: Phone → Vercel Server → Supabase (server has no DNS issues)
export async function submitRegistration({
    first_name,
    last_name,
    email,
    phone,
    college,
    category,
    id_proof_file,
}) {
    // STEP 1: Compress image on device before sending
    const compressedFile = await compressImage(id_proof_file);

    // STEP 2: Convert to base64 to send as JSON
    const fileBase64 = await fileToBase64(compressedFile);

    // STEP 3: Send to Vercel API route (not Supabase directly)
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
            fileBase64,
            fileName: id_proof_file.name,
        }),
    });

    if (!res.ok) {
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