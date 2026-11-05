import { useEffect, useState } from 'react';
import '../requests.css';
import { api } from '../api.js';
import { Icon } from './Icons.jsx';

const dayLabel = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export default function AppointmentsPanel({ token, onView }) {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/staff/upcoming', { token }).then(setList).catch((e) => setError(e.message));
  }, [token]);

  const groups = {};
  (list || []).forEach((a) => {
    (groups[a.date] = groups[a.date] || []).push(a);
  });
  const days = Object.keys(groups);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {error && <div className="error">{error}</div>}
      {list && days.length === 0 && (
        <div className="empty">No upcoming appointments yet. Confirmed bookings will appear here.</div>
      )}

      {days.map((d) => (
        <div key={d} className="card">
          <h3 className="day-title">{dayLabel(d)}</h3>
          {groups[d].map((a) => (
            <div key={a.id} className="row">
              <div className="grow">
                <b>{a.time}</b> • {a.customer}
                <div className="muted" style={{ fontSize: 13 }}>
                  {a.service} • {a.staff} • {a.mobile}
                </div>
                {a.note_preview && (
                  <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                    “{a.note_preview}{a.note_preview.length >= 120 ? '...' : ''}”
                  </div>
                )}
              </div>
              {a.has_request ? (
                <button className="btn btn-ghost btn-sm" onClick={() => onView(a.id)}>
                  <Icon name="image" size={14} /> {a.has_image ? 'View photo and note' : 'View note'}
                </button>
              ) : null}
              <span className={a.status === 'completed' ? 'pill used' : 'pill ok'}>
                {a.status === 'completed' ? 'Checked in' : 'Upcoming'}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}