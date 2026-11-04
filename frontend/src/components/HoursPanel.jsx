import { useEffect, useState } from 'react';
import { api } from '../api.js';

const NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORDER = [1, 2, 3, 4, 5, 6, 0];

const defaults = () =>
  NAMES.map((_, i) => ({ weekday: i, is_off: false, open_time: '09:00', close_time: '21:00' }));

export default function HoursPanel({ token, onChange }) {
  const [rows, setRows] = useState(defaults());
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/owner/working-hours', { token })
      .then((data) => {
        if (!data.length) return;
        const base = defaults();
        data.forEach((d) => {
          base[d.weekday] = {
            weekday: d.weekday,
            is_off: !!d.is_off,
            open_time: String(d.open_time).slice(0, 5),
            close_time: String(d.close_time).slice(0, 5),
          };
        });
        setRows(base);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  function update(day, patch) {
    setSaved(false);
    setRows((r) => r.map((x) => (x.weekday === day ? { ...x, ...patch } : x)));
  }

  async function save() {
    setError('');
    setSaved(false);
    setBusy(true);
    try {
      await api('/owner/working-hours', { method: 'PUT', token, body: { hours: rows } });
      setSaved(true);
      onChange && onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h3 className="card-title">Working hours</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        Customers can only book inside these hours. Turn a day off to close it.
      </p>

      {ORDER.map((d) => {
        const r = rows[d];
        return (
          <div key={d} className="hours-row">
            <b>{NAMES[d]}</b>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input type="checkbox" checked={!r.is_off} onChange={(e) => update(d, { is_off: !e.target.checked })} />
              {r.is_off ? 'Closed' : 'Open'}
            </label>
            <div className="hours-times" style={{ opacity: r.is_off ? 0.35 : 1 }}>
              <input
                className="input"
                type="time"
                style={{ width: 130 }}
                value={r.open_time}
                disabled={r.is_off}
                onChange={(e) => update(d, { open_time: e.target.value })}
              />
              <span className="muted">to</span>
              <input
                className="input"
                type="time"
                style={{ width: 130 }}
                value={r.close_time}
                disabled={r.is_off}
                onChange={(e) => update(d, { close_time: e.target.value })}
              />
            </div>
          </div>
        );
      })}

      {error && <div className="error">{error}</div>}
      {saved && <div className="success">Working hours saved.</div>}

      <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={save} disabled={busy}>
        {busy ? 'Saving...' : 'Save working hours'}
      </button>
    </div>
  );
}