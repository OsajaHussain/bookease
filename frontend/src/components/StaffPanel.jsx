import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { Icon } from './Icons.jsx';

const idsOf = (st) => (st.service_ids || '').split(',').filter(Boolean).map(Number);
const initials = (n) =>
  n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

export default function StaffPanel({ token, onChange }) {
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [picked, setPicked] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api('/owner/staff', { token }).then(setStaff).catch((e) => setError(e.message));
    api('/owner/services', { token }).then(setServices).catch((e) => setError(e.message));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const togglePick = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  async function add(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/owner/staff', {
        method: 'POST',
        token,
        body: { name: name.trim(), title: title.trim(), service_ids: picked },
      });
      setName('');
      setTitle('');
      setPicked([]);
      load();
      onChange && onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleService(st, sid) {
    const cur = idsOf(st);
    const next = cur.includes(sid) ? cur.filter((x) => x !== sid) : [...cur, sid];
    try {
      await api('/owner/staff/' + st.id, {
        method: 'PUT',
        token,
        body: { name: st.name, title: st.title || '', service_ids: next },
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(st) {
    if (!window.confirm(`Remove ${st.name} from your team?`)) return;
    try {
      await api('/owner/staff/' + st.id, { method: 'DELETE', token });
      load();
      onChange && onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <form className="card" onSubmit={add}>
        <h3 className="card-title">Add a team member</h3>

        <div className="form-grid">
          <div>
            <label className="field" style={{ marginTop: 0 }}>Full name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bilal Ahmed" />
          </div>
          <div>
            <label className="field" style={{ marginTop: 0 }}>Role (optional)</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fitness Trainer" />
          </div>
        </div>

        <label className="field">Services they provide</label>
        {services.length === 0 ? (
          <div className="hint">Add a service first (Services tab), then you can assign it here.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {services.map((s) => (
              <button
                type="button"
                key={s.id}
                className={picked.includes(s.id) ? 'chip active' : 'chip'}
                onClick={() => togglePick(s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <button className="btn btn-primary" style={{ marginTop: 18 }} disabled={busy}>
          <Icon name="plus" size={16} /> {busy ? 'Saving...' : 'Add team member'}
        </button>
      </form>

      <div className="card">
        <h3 className="card-title">Your team ({staff.length})</h3>
        {staff.length === 0 && (
          <div className="empty">No team members yet. Customers choose a specialist when booking, so add at least one.</div>
        )}
        {staff.map((st) => (
          <div key={st.id} className="row" style={{ alignItems: 'flex-start' }}>
            <div className="avatar">{initials(st.name)}</div>
            <div className="grow">
              <b>{st.name}</b>
              {st.title && <span className="muted"> • {st.title}</span>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {services.map((s) => (
                  <button
                    key={s.id}
                    className={idsOf(st).includes(s.id) ? 'chip chip-sm active' : 'chip chip-sm'}
                    onClick={() => toggleService(st, s.id)}
                    title="Click to turn this service on or off for this person"
                  >
                    {s.name}
                  </button>
                ))}
                {services.length === 0 && <span className="hint">No services to assign yet.</span>}
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => remove(st)}>
              <Icon name="trash" size={14} /> Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}