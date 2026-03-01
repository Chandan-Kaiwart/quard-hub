require('dotenv').config();
const express = require('express');
const multer = require('multer');
const supabase = require('./Db');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

// GET all registrations
app.get('/registrations', async (req, res) => {
  const { data, error } = await supabase
    .from('registration')
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET single registration by email
app.get('/registrations/:email', async (req, res) => {
  const { data, error } = await supabase
    .from('registration')
    .select('*')
    .eq('email', req.params.email)
    .single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

// POST create registration
app.post('/registrations', upload.single('id_proof'), async (req, res) => {
  const { first_name, last_name, email, phone, college, category } = req.body;

  if (!first_name || !last_name || !email || !phone || !college || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  let id_proof_url = null;

  // Image upload to Supabase Storage
  if (req.file) {
    const fileName = `${Date.now()}_${req.file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from('id-proofs')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) return res.status(500).json({ error: uploadError.message });

    const { data: urlData } = supabase.storage
      .from('id-proofs')
      .getPublicUrl(fileName);

    id_proof_url = urlData.publicUrl;
  }

  const { error } = await supabase
    .from('registration')
    .insert([{ first_name, last_name, email, phone: parseInt(phone), college, category, id_proof_url }]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: 'Registration created successfully' });
});

// PUT update registration
app.put('/registrations/:email', upload.single('id_proof'), async (req, res) => {
  const { first_name, last_name, phone, college, category } = req.body;
  const updates = {};

  if (first_name) updates.first_name = first_name;
  if (last_name) updates.last_name = last_name;
  if (phone) updates.phone = parseInt(phone);
  if (college) updates.college = college;
  if (category) updates.category = category;

  if (req.file) {
    const fileName = `${Date.now()}_${req.file.originalname}`;
    await supabase.storage
      .from('id-proofs')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

    const { data: urlData } = supabase.storage
      .from('id-proofs')
      .getPublicUrl(fileName);

    updates.id_proof_url = urlData.publicUrl;
  }

  const { error } = await supabase
    .from('registration')
    .update(updates)
    .eq('email', req.params.email);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Updated successfully' });
});

// DELETE registration
app.delete('/registrations/:email', async (req, res) => {
  const { error } = await supabase
    .from('registration')
    .delete()
    .eq('email', req.params.email);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Deleted successfully' });
});

module.exports = app;