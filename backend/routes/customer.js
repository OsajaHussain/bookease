const express = require('express');
const crypto = require('crypto');
const QRCode = require('qrcode');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { getFreeSlots, toMin, toHHMM } = require('../utils/slots');

const router = express.Router();
router.use(requireAuth, requireRole('customer'));

// Booking banao (slot 15 minute ke liye roka jata hai)
router.post('/appointments', async (req, res) => {
  const { staff_id, service_id, date, time } = req.body;
  if (!staff_id || !service_id || !date || !time) {
    return res.status(400).json({ error: 'staff_id, service_id, date aur time do' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('SELECT id FROM staff WHERE id = ? FOR UPDATE', [staff_id]);

    const r = await getFreeSlots(conn, staff_id, service_id, date);
    if (r.error) {
      await conn.rollback();
      return res.status(400).json({ error: r.error });
    }
    if (!r.slots.includes(time)) {
      await conn.rollback();
      return res.status(409).json({ error: 'Ye slot ab khaali nahi hai' });
    }

    const start = toMin(time);
    const end = start + r.service.duration_min;

    const [ins] = await conn.query(
      `INSERT INTO appointments (business_id, customer_id, staff_id, service_id, start_time, end_time, status, amount)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [r.staff.business_id, req.user.id, staff_id, service_id, `${date} ${time}:00`, `${date} ${toHHMM(end)}:00`, r.service.price]
    );

    await conn.commit();
    res.json({ ok: true, appointment_id: ins.insertId, amount: r.service.price, pay_within_min: 15 });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// Test payment: paid ho to booking confirm + QR ticket
router.post('/appointments/:id/pay', async (req, res) => {
  if (process.env.ALLOW_TEST_PAYMENT !== 'true') {
    return res.status(403).json({ error: 'Test payment band hai' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT id, amount FROM appointments
       WHERE id = ? AND customer_id = ? AND status = 'pending'
         AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
       FOR UPDATE`,
      [req.params.id, req.user.id]
    );
    const appt = rows[0];
    if (!appt) {
      await conn.rollback();
      return res.status(404).json({ error: 'Booking nahi mili ya 15 minute guzar gaye, dobara booking karo' });
    }

    await conn.query(
      `INSERT INTO payments (appointment_id, method, amount, status, provider_ref, paid_at)
       VALUES (?, 'test', ?, 'paid', ?, NOW())`,
      [appt.id, appt.amount, 'TEST-' + crypto.randomBytes(4).toString('hex')]
    );
    await conn.query(`UPDATE appointments SET status = 'confirmed' WHERE id = ?`, [appt.id]);

    const token = crypto.randomBytes(24).toString('hex');
    await conn.query('INSERT INTO qr_tickets (appointment_id, token) VALUES (?, ?)', [appt.id, token]);

    await conn.commit();
    res.json({ ok: true, status: 'confirmed', qr_token: token });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// Meri bookings
router.get('/appointments', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.id, DATE_FORMAT(a.start_time, '%Y-%m-%d %H:%i') AS start_time, a.status, a.amount,
            b.name AS business, sv.name AS service, st.name AS staff, q.status AS qr_status
     FROM appointments a
     JOIN businesses b ON b.id = a.business_id
     JOIN services sv ON sv.id = a.service_id
     JOIN staff st ON st.id = a.staff_id
     LEFT JOIN qr_tickets q ON q.appointment_id = a.id
     WHERE a.customer_id = ?
     ORDER BY a.start_time DESC`,
    [req.user.id]
  );
  res.json(rows);
});

// QR ki tasveer
router.get('/appointments/:id/qr', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT q.token, q.status FROM qr_tickets q
     JOIN appointments a ON a.id = q.appointment_id
     WHERE a.id = ? AND a.customer_id = ?`,
    [req.params.id, req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'QR nahi mila' });
  const image = await QRCode.toDataURL(rows[0].token);
  res.json({ status: rows[0].status, token: rows[0].token, image });
});

module.exports = router;