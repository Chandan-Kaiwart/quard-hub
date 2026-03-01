import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// ✅ Added
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
    // ✅ Added
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
        return res.status(500).json({ error: 'Missing Supabase environment variables' });
    }

    const email = req.query.email;

    if (req.method === 'GET' && !email) {
        const { data, error } = await supabase.from('registration').select('*');
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    }

    if (req.method === 'GET' && email) {
        const { data, error } = await supabase.from('registration').select('*').eq('email', email).single();
        if (error) return res.status(404).json({ error: 'Not found' });
        return res.json(data);
    }

    if (req.method === 'POST') {
        if (!req.body) return res.status(400).json({ error: 'Request body is missing' }); // ✅ Added
        const { first_name, last_name, email, phone, college, category } = req.body;
        if (!first_name || !last_name || !email || !phone || !college || !category)
            return res.status(400).json({ error: 'All fields are required' });

        let id_proof_url = null;
        if (req.body.id_proof_url) id_proof_url = req.body.id_proof_url;

        const { error } = await supabase.from('registration')
            .insert([{ first_name, last_name, email, phone: parseInt(phone), college, category, id_proof_url }]);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json({ message: 'Registration created successfully' });
    }

    if (req.method === 'PUT' && email) {
        const { first_name, last_name, phone, college, category } = req.body;
        const updates = {};
        if (first_name) updates.first_name = first_name;
        if (last_name) updates.last_name = last_name;
        if (phone) updates.phone = parseInt(phone);
        if (college) updates.college = college;
        if (category) updates.category = category;

        const { error } = await supabase.from('registration').update(updates).eq('email', email);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ message: 'Updated successfully' });
    }

    if (req.method === 'DELETE' && email) {
        const { error } = await supabase.from('registration').delete().eq('email', email);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ message: 'Deleted successfully' });
    }

    res.status(405).json({ error: 'Method not allowed' });
}