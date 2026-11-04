const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const TYPES = ['gym', 'salon', 'clinic'];

function makeToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, business_id: user.business_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function makeSlug(name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return base + '-' + crypto.randomBytes(2).toString('hex');
}

// 1) Business owner: business + owner account ek saath
router.post('/register-business', async (req, res) => {
  const { business_name, business_type, city, phone, full_name, mobile, password } = req.body;

  if (!business_name || !full_name || !mobile || !password) {
    return res.status(400).json({ error: 'Sab zaroori fields bharo' });
  }
  if (!TYPES.includes(business_type)) {
    return res.status(400).json({ error: 'business_type gym, salon ya clinic hona chahiye' });
  }
  if (String(mobile).length < 10 || String(password).length < 6) {
    return res.status(400).json({ error: 'Mobile 10+ digit aur password 6+ character ka ho' });
  }

  const conn = await pool.getConnection();
  try {
    const [exists] = await conn.query('SELECT id FROM users WHERE mobile = ?', [mobile]);
    if (exists.length) return res.status(409).json({ error: 'Ye mobile number pehle se registered hai' });

    await conn.beginTransaction();

    const [b] = await conn.query(
      `INSERT INTO businesses (name, slug, business_type, phone, city, status, trial_ends_at)
       VALUES (?, ?, ?, ?, ?, 'trial', DATE_ADD(NOW(), INTERVAL 14 DAY))`,
      [business_name, makeSlug(business_name), business_type, phone || mobile, city || null]
    );

    const hash = await bcrypt.hash(password, 10);
    const [u] = await conn.query(
      `INSERT INTO users (business_id, full_name, mobile, password_hash, role)
       VALUES (?, ?, ?, ?, 'owner')`,
      [b.insertId, full_name, mobile, hash]
    );

    await conn.commit();

    const user = { id: u.insertId, role: 'owner', business_id: b.insertId };
    res.json({ ok: true, token: makeToken(user), business_id: b.insertId, role: 'owner' });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// 2) Customer signup
router.post('/signup', async (req, res) => {
  const { full_name, mobile, password } = req.body;

  if (!full_name || !mobile || !password) {
    return res.status(400).json({ error: 'Naam, mobile aur password zaroori hain' });
  }
  if (String(mobile).length < 10 || String(password).length < 6) {
    return res.status(400).json({ error: 'Mobile 10+ digit aur password 6+ character ka ho' });
  }

  try {
    const [exists] = await pool.query('SELECT id FROM users WHERE mobile = ?', [mobile]);
    if (exists.length) return res.status(409).json({ error: 'Ye mobile number pehle se registered hai' });

    const hash = await bcrypt.hash(password, 10);
    const [u] = await pool.query(
      `INSERT INTO users (full_name, mobile, password_hash, role) VALUES (?, ?, ?, 'customer')`,
      [full_name, mobile, hash]
    );

    const user = { id: u.insertId, role: 'customer', business_id: null };
    res.json({ ok: true, token: makeToken(user), role: 'customer' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 3) Login (sab ke liye)
router.post('/login', async (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) return res.status(400).json({ error: 'Mobile aur password do' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE mobile = ?', [mobile]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Mobile ya password galat hai' });
    }
    res.json({
      ok: true,
      token: makeToken(user),
      role: user.role,
      full_name: user.full_name,
      business_id: user.business_id,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 4) Main kaun hoon (token check)
router.get('/me', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, full_name, mobile, role, business_id FROM users WHERE id = ?',
    [req.user.id]
  );
  res.json(rows[0] || null);
});

module.exports = router;