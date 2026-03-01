require('dotenv').config();
const express = require('express');
const multer = require('multer');
const db = require('./db');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

// GET all registrations
app.get('/registrations', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT first_name, last_name, email, phone, college, category FROM registration'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single registration by email
app.get('/registrations/:email', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT first_name, last_name, email, phone, college, category FROM registration WHERE email = ?',
      [req.params.email]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Registration not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new registration
app.post('/registrations', upload.single('id_proof'), async (req, res) => {
  const { first_name, last_name, email, phone, college, category } = req.body;
  const id_proof = req.file ? req.file.buffer : null;

  if (!first_name || !last_name || !email || !phone || !college || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await db.query(
      'INSERT INTO registration (first_name, last_name, email, phone, college, category, id_proof) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, parseInt(phone), college, category, id_proof]
    );
    res.status(201).json({ message: 'Registration created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a registration
app.put('/registrations/:email', upload.single('id_proof'), async (req, res) => {
  const { first_name, last_name, phone, college, category } = req.body;
  const id_proof = req.file ? req.file.buffer : null;

  const fields = [];
  const values = [];

  if (first_name) { fields.push('first_name = ?'); values.push(first_name); }
  if (last_name) { fields.push('last_name = ?'); values.push(last_name); }
  if (phone) { fields.push('phone = ?'); values.push(parseInt(phone)); }
  if (college) { fields.push('college = ?'); values.push(college); }
  if (category) { fields.push('category = ?'); values.push(category); }
  if (id_proof) { fields.push('id_proof = ?'); values.push(id_proof); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  values.push(req.params.email);
  try {
    const [result] = await db.query(
      `UPDATE registration SET ${fields.join(', ')} WHERE email = ?`, values
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a registration
app.delete('/registrations/:email', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM registration WHERE email = ?', [req.params.email]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));