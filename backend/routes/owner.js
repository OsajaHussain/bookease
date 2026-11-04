const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('owner'));

const h = (fn) => (req, res) =>
  fn(req, res).catch((e) => res.status(500).json({ error: e.message }));

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function checkService(body) {
  const name = String(body.name || '').trim();
  const duration = Number(body.duration_min);
  const price = Number(body.price);
  if (!name) return { error: 'Service name is required.' };
  if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
    return { error: 'Duration must be between 5 and 480 minutes.' };
  }
  if (!Number.isInteger(price) || price < 0) {
    return { error: 'Price must be a whole number, 0 or more.' };
  }
  return {
    value: {
      name,
      description: String(body.description || '').trim() || null,
      duration,
      price,
    },
  };
}

async function setStaffServices(staffId, businessId, serviceIds) {
  await pool.query('DELETE FROM staff_services WHERE staff_id = ?', [staffId]);
  if (!Array.isArray(serviceIds) || !serviceIds.length) return;
  const [valid] = await pool.query(
    'SELECT id FROM services WHERE business_id = ? AND is_active = 1 AND id IN (?)',
    [businessId, serviceIds]
  );
  if (valid.length) {
    await pool.query('INSERT IGNORE INTO staff_services (staff_id, service_id) VALUES ?', [
      valid.map((v) => [staffId, v.id]),
    ]);
  }
}

// ---------- SERVICES ----------
router.get('/services', h(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM services WHERE business_id = ? AND is_active = 1 ORDER BY id',
    [req.user.business_id]
  );
  res.json(rows);
}));

router.post('/services', h(async (req, res) => {
  const c = checkService(req.body);
  if (c.error) return res.status(400).json({ error: c.error });
  const v = c.value;
  const [r] = await pool.query(
    'INSERT INTO services (business_id, name, description, duration_min, price) VALUES (?, ?, ?, ?, ?)',
    [req.user.business_id, v.name, v.description, v.duration, v.price]
  );
  res.json({ ok: true, id: r.insertId });
}));

router.put('/services/:id', h(async (req, res) => {
  const c = checkService(req.body);
  if (c.error) return res.status(400).json({ error: c.error });
  const v = c.value;
  const [r] = await pool.query(
    `UPDATE services SET name = ?, description = ?, duration_min = ?, price = ?
     WHERE id = ? AND business_id = ?`,
    [v.name, v.description, v.duration, v.price, req.params.id, req.user.business_id]
  );
  if (!r.affectedRows) return res.status(404).json({ error: 'Service not found.' });
  res.json({ ok: true });
}));

router.delete('/services/:id', h(async (req, res) => {
  await pool.query('UPDATE services SET is_active = 0 WHERE id = ? AND business_id = ?', [
    req.params.id,
    req.user.business_id,
  ]);
  res.json({ ok: true });
}));

// ---------- STAFF ----------
router.get('/staff', h(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.id, s.name, s.title,
            GROUP_CONCAT(ss.service_id) AS service_ids
     FROM staff s
     LEFT JOIN staff_services ss ON ss.staff_id = s.id
     WHERE s.business_id = ? AND s.is_active = 1
     GROUP BY s.id ORDER BY s.id`,
    [req.user.business_id]
  );
  res.json(rows);
}));

router.post('/staff', h(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const title = String(req.body.title || '').trim() || null;
  if (!name) return res.status(400).json({ error: 'Staff name is required.' });

  const [r] = await pool.query('INSERT INTO staff (business_id, name, title) VALUES (?, ?, ?)', [
    req.user.business_id,
    name,
    title,
  ]);
  await setStaffServices(r.insertId, req.user.business_id, req.body.service_ids);
  res.json({ ok: true, id: r.insertId });
}));

router.put('/staff/:id', h(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const title = String(req.body.title || '').trim() || null;
  if (!name) return res.status(400).json({ error: 'Staff name is required.' });

  const [own] = await pool.query(
    'SELECT id FROM staff WHERE id = ? AND business_id = ? AND is_active = 1',
    [req.params.id, req.user.business_id]
  );
  if (!own[0]) return res.status(404).json({ error: 'Staff member not found.' });

  await pool.query('UPDATE staff SET name = ?, title = ? WHERE id = ?', [name, title, req.params.id]);
  await setStaffServices(req.params.id, req.user.business_id, req.body.service_ids);
  res.json({ ok: true });
}));

router.delete('/staff/:id', h(async (req, res) => {
  await pool.query('UPDATE staff SET is_active = 0 WHERE id = ? AND business_id = ?', [
    req.params.id,
    req.user.business_id,
  ]);
  res.json({ ok: true });
}));

// ---------- WORKING HOURS (weekday: 0 = Sunday ... 6 = Saturday) ----------
router.get('/working-hours', h(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT weekday, open_time, close_time, is_off FROM working_hours WHERE business_id = ? AND staff_id IS NULL ORDER BY weekday',
    [req.user.business_id]
  );
  res.json(rows);
}));

router.put('/working-hours', h(async (req, res) => {
  const { hours } = req.body;
  if (!Array.isArray(hours) || hours.length !== 7) {
    return res.status(400).json({ error: 'Please provide hours for all 7 days.' });
  }

  const rows = [];
  for (const x of hours) {
    const wd = Number(x.weekday);
    if (!Number.isInteger(wd) || wd < 0 || wd > 6) {
      return res.status(400).json({ error: 'Invalid weekday.' });
    }
    const off = !!x.is_off;
    const open = String(x.open_time || '09:00').slice(0, 5);
    const close = String(x.close_time || '21:00').slice(0, 5);
    if (!TIME.test(open) || !TIME.test(close)) {
      return res.status(400).json({ error: 'Invalid time format.' });
    }
    if (!off && open >= close) {
      return res.status(400).json({ error: 'Opening time must be before closing time.' });
    }
    rows.push([req.user.business_id, null, wd, open, close, off ? 1 : 0]);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM working_hours WHERE business_id = ? AND staff_id IS NULL', [
      req.user.business_id,
    ]);
    await conn.query(
      'INSERT INTO working_hours (business_id, staff_id, weekday, open_time, close_time, is_off) VALUES ?',
      [rows]
    );
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
}));

module.exports = router;