import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { Icon } from './Icons.jsx';

const empty = { name: '', description: '', duration_min: '60', price: '' };

export default function ServicesPanel({ token, onChange }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api('/owner/services', { token }).then(setList).catch((e) => setError(e.message));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        duration_min: Number(form.duration_min),
        price: Number(form.price),
      };
      if (editId) await api('/owner/services/' + editId, { method: 'PUT', token, body });
      else await api('/owner/services', { method: 'POST', token, body });
      setForm(empty);
      setEditId(null);
      load();
      onChange && onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function edit(s) {
    setEditId(s.id);
    setForm({
      name: s.name,
      description: s.description || '',
      duration_min: String(s.duration_min),
      price: String(s.price),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancel() {
    setEditId(null);
    setForm(empty);
    setError('');
  }

  async function remove(s) {
    if (!window.confirm(`Delete "${s.name}"? Customers will no longer be able to book it.`)) return;
    try {
      await api('/owner/services/' + s.id, { method: 'DELETE', token });
      if (editId === s.id) cancel();
      load();
      onChange && onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <form className="card" onSubmit={save}>
        <h3 className="card-title">{editId ? 'Edit service' : 'Add a new service'}</h3>

        <div className="form-grid">
          <div>
            <label className="field" style={{ marginTop: 0 }}>Service name</label>
            <input className="input" value={form.name} onChange={set('name')} placeholder="e.g. Personal Training" />
          </div>
          <div>
            <label className="field" style={{ marginTop: 0 }}>Duration (minutes)</label>
            <input className="input" type="number" min="5" max="480" step="5" value={form.duration_min} onChange={set('duration_min')} />
          </div>
          <div>
            <label className="field" style={{ marginTop: 0 }}>Price (Rs)</label>
            <input className="input" type="number" min="0" step="1" value={form.price} onChange={set('price')} placeholder="1500" />
          </div>
        </div>

        <label className="field">Description (optional)</label>
        <textarea className="input" value={form.description} onChange={set('description')} placeholder="A short description customers will see" />

        {error && <div className="error">{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" disabled={busy}>
            <Icon name={editId ? 'check' : 'plus'} size={16} />
            {busy ? 'Saving...' : editId ? 'Save changes' : 'Add service'}
          </button>
          {editId && (
            <button type="button" className="btn btn-ghost" onClick={cancel}>Cancel</button>
          )}
        </div>
      </form>

      <div className="card">
        <h3 className="card-title">Your services ({list.length})</h3>
        {list.length === 0 && (
          <div className="empty">No services yet. Add your first service above so customers can start booking.</div>
        )}
        {list.map((s) => (
          <div key={s.id} className="row">
            <div className="grow">
              <b>{s.name}</b>
              <div className="muted" style={{ fontSize: 14 }}>
                {s.duration_min} min • Rs {Number(s.price).toLocaleString()}
              </div>
              {s.description && <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{s.description}</div>}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => edit(s)}>
              <Icon name="edit" size={14} /> Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => remove(s)}>
              <Icon name="trash" size={14} /> Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}