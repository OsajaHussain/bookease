function toMin(t) {
  const [h, m] = String(t).split(':');
  return Number(h) * 60 + Number(m);
}

function toHHMM(min) {
  return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
}

async function getFreeSlots(db, staffId, serviceId, date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return { error: 'date YYYY-MM-DD format mein do' };
  }

  const [staffRows] = await db.query(
    'SELECT id, business_id, name FROM staff WHERE id = ? AND is_active = 1',
    [staffId]
  );
  const staff = staffRows[0];
  if (!staff) return { error: 'Staff nahi mila' };

  const [svcRows] = await db.query(
    `SELECT s.id, s.name, s.duration_min, s.price
     FROM services s
     JOIN staff_services ss ON ss.service_id = s.id AND ss.staff_id = ?
     WHERE s.id = ? AND s.business_id = ? AND s.is_active = 1`,
    [staffId, serviceId, staff.business_id]
  );
  const service = svcRows[0];
  if (!service) return { error: 'Ye staff ye service nahi deta' };

  const now = new Date();
  const today =
    now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const result = { staff, service, slots: [] };
  if (date < today) return result;

  const weekday = new Date(date + 'T00:00:00').getDay();
  const [hoursRows] = await db.query(
    `SELECT open_time, close_time, is_off FROM working_hours
     WHERE business_id = ? AND weekday = ? AND (staff_id IS NULL OR staff_id = ?)
     ORDER BY staff_id IS NULL LIMIT 1`,
    [staff.business_id, weekday, staffId]
  );
  const hours = hoursRows[0];
  if (!hours || hours.is_off) return result;

  const [hol] = await db.query('SELECT id FROM holidays WHERE business_id = ? AND holiday_date = ?', [
    staff.business_id,
    date,
  ]);
  if (hol.length) return result;

  const [booked] = await db.query(
    `SELECT TIME_FORMAT(start_time, '%H:%i') AS s, TIME_FORMAT(end_time, '%H:%i') AS e
     FROM appointments
     WHERE staff_id = ? AND DATE(start_time) = ?
       AND (status IN ('confirmed','completed')
            OR (status = 'pending' AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)))`,
    [staffId, date]
  );
  const busy = booked.map((b) => [toMin(b.s), toMin(b.e)]);

  const open = toMin(hours.open_time);
  const close = toMin(hours.close_time);
  const dur = service.duration_min;

  for (let t = open; t + dur <= close; t += dur) {
    if (date === today && t <= nowMin) continue;
    const clash = busy.some(([s, e]) => t < e && t + dur > s);
    if (!clash) result.slots.push(toHHMM(t));
  }
  return result;
}

module.exports = { getFreeSlots, toMin, toHHMM };