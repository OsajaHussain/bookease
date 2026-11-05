const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('owner', 'staff'));

// QR scan: Approved / Not Approved
router.post('/scan', async (req, res) => {
  const token = String(req.body.token || '').trim();
  if (!token) return res.status(400).json({ error: 'QR token do' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT q.id AS qid, q.status AS qstatus,
              a.id AS aid, a.business_id, a.status AS astatus,
              DATE_FORMAT(a.start_time, '%Y-%m-%d %H:%i') AS start_time,
              (DATE(a.start_time) = CURDATE()) AS is_today,
              u.full_name AS customer, sv.name AS service, st.name AS staff,
              (SELECT COUNT(*) FROM payments p WHERE p.appointment_id = a.id AND p.status = 'paid') AS paid
       FROM qr_tickets q
       JOIN appointments a ON a.id = q.appointment_id
       JOIN users u ON u.id = a.customer_id
       JOIN services sv ON sv.id = a.service_id
       JOIN staff st ON st.id = a.staff_id
       WHERE q.token = ?
       FOR UPDATE`,
      [token]
    );
    const t = rows[0];

    const reject = async (reason) => {
      await conn.rollback();
      return res.json({ approved: false, reason });
    };

    if (!t || t.business_id !== req.user.business_id) {
      return reject('QR nahi mila ya is business ka nahi hai');
    }
    if (t.qstatus === 'used') return reject('Ye QR pehle hi use ho chuka hai');
    if (t.qstatus === 'cancelled' || t.astatus === 'cancelled') return reject('Booking cancel ho chuki hai');
    if (!t.paid) return reject('Payment nahi hui');
    if (!t.is_today) return reject('Ye aaj ki booking nahi hai (booking: ' + t.start_time + ')');

    await conn.query(
      `UPDATE qr_tickets SET status = 'used', used_at = NOW(), scanned_by = ? WHERE id = ?`,
      [req.user.id, t.qid]
    );
    await conn.query(`UPDATE appointments SET status = 'completed' WHERE id = ?`, [t.aid]);

    await conn.commit();
    res.json({
      approved: true,
      customer: t.customer,
      service: t.service,
      staff: t.staff,
      time: t.start_time,
    });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// Aaj ki appointments + kamayi (dashboard ke liye)
router.get('/today', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, DATE_FORMAT(a.start_time, '%H:%i') AS time, a.status, a.amount,
              u.full_name AS customer, u.mobile, sv.name AS service, st.name AS staff,
              (r.appointment_id IS NOT NULL) AS has_request
       FROM appointments a
       JOIN users u ON u.id = a.customer_id
       JOIN services sv ON sv.id = a.service_id
       JOIN staff st ON st.id = a.staff_id
       LEFT JOIN appointment_requests r ON r.appointment_id = a.id
       WHERE a.business_id = ? AND DATE(a.start_time) = CURDATE()
         AND a.status IN ('confirmed', 'completed')
       ORDER BY a.start_time`,
      [req.user.business_id]
    );
    const revenue = rows.reduce((sum, r) => sum + r.amount, 0);
    res.json({ count: rows.length, revenue, appointments: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Aane wali saari confirmed bookings (aaj se aage)
router.get('/upcoming', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id,
              DATE_FORMAT(a.start_time, '%Y-%m-%d') AS date,
              DATE_FORMAT(a.start_time, '%H:%i') AS time,
              a.status, a.amount,
              u.full_name AS customer, u.mobile,
              sv.name AS service, st.name AS staff,
              (r.appointment_id IS NOT NULL) AS has_request,
              (r.image_data IS NOT NULL) AS has_image,
              LEFT(r.description, 120) AS note_preview
       FROM appointments a
       JOIN users u ON u.id = a.customer_id
       JOIN services sv ON sv.id = a.service_id
       JOIN staff st ON st.id = a.staff_id
       LEFT JOIN appointment_requests r ON r.appointment_id = a.id
       WHERE a.business_id = ? AND DATE(a.start_time) >= CURDATE()
         AND a.status IN ('confirmed', 'completed')
       ORDER BY a.start_time
       LIMIT 200`,
      [req.user.business_id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Customer ki request (description + photo), sirf isi business ke liye
router.get('/appointments/:id/request', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, u.full_name AS customer, sv.name AS service,
              DATE_FORMAT(a.start_time, '%Y-%m-%d %H:%i') AS start_time,
              r.description, r.image_data
       FROM appointments a
       JOIN users u ON u.id = a.customer_id
       JOIN services sv ON sv.id = a.service_id
       LEFT JOIN appointment_requests r ON r.appointment_id = a.id
       WHERE a.id = ? AND a.business_id = ?`,
      [req.params.id, req.user.business_id]
    );
    const a = rows[0];
    if (!a) return res.status(404).json({ error: 'Appointment not found.' });
    res.json({
      customer: a.customer,
      service: a.service,
      when: a.start_time,
      description: a.description || '',
      image: a.image_data || '',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;