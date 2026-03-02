import { createClient } from "@supabase/supabase-js";
import { MAX_REGISTRATIONS } from "./validation.js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { count, error } = await supabase
            .from("registrations")
            .select("*", { count: "exact", head: true });

        if (error) throw error;

        return res.status(200).json({
            count: count || 0,
            limit: MAX_REGISTRATIONS,
            left: Math.max(0, MAX_REGISTRATIONS - (count || 0))
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
