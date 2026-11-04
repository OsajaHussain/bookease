const express = require('express');
const pool = require('../config/db');
const { getFreeSlots } = require('../utils/slots');

const router = express.Router();

router.get('/business/:slug', async (req, res) => {
  const [b] = await pool.query(
    `SELECT id, name, slug, business_type, phone, address, city FROM businesses
     WHERE slug = ? AND status IN ('trial','active')`,
    [req.params.slug]
  );
  if (!b[0]) return res.status(404).json({ error: 'Business nahi mila' });

  const [services] = await pool.query(
    'SELECT id, name, description, duration_min, price FROM services WHERE business_id = ? AND is_active = 1',
    [b[0].id]
  );
  const [staff] = await pool.query(
    `SELECT s.id, s.name, s.title, GROUP_CONCAT(ss.service_id) AS service_ids
     FROM staff s LEFT JOIN staff_services ss ON ss.staff_id = s.id
     WHERE s.business_id = ? AND s.is_active = 1 GROUP BY s.id`,
    [b[0].id]
  );
  res.json({ business: b[0], services, staff });
});

router.get('/slots', async (req, res) => {
  const { staff_id, service_id, date } = req.query;
  if (!staff_id || !service_id || !date) {
    return res.status(400).json({ error: 'staff_id, service_id aur date do' });
  }
  const r = await getFreeSlots(pool, staff_id, service_id, date);
  if (r.error) return res.status(400).json({ error: r.error });
  res.json({ date, duration_min: r.service.duration_min, price: r.service.price, slots: r.slots });
});
router.get('/businesses', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, slug, business_type, city FROM businesses
     WHERE status IN ('trial','active') ORDER BY id DESC`
  );
  res.json(rows);
});
module.exports = router;