import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Icon, Logo } from '../components/Icons.jsx';

export default function Register() {
  const nav = useNavigate();
  const { save } = useAuth();
  const [mode, setMode] = useState('customer');
  const [f, setF] = useState({
    full_name: '', mobile: '', password: '',
    business_name: '', business_type: 'gym', city: '', phone: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'customer') {
        const d = await api('/auth/signup', {
          method: 'POST',
          body: { full_name: f.full_name, mobile: f.mobile, password: f.password },
        });
        save({ token: d.token, role: 'customer', full_name: f.full_name, business_id: null });
        nav('/book');
      } else {
        const d = await api('/auth/register-business', { method: 'POST', body: f });
        save({ token: d.token, role: 'owner', full_name: f.full_name, business_id: d.business_id });
        nav('/owner');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-split">
      <aside className="auth-brand">
        <Link to="/"><Logo /></Link>
        <div>
          <h2>Bring your bookings online.</h2>
          <p>Create an account as a customer to book, or as a business owner to start taking appointments.</p>
          <ul>
            <li><Icon name="check" size={18} /> Set up services, team and hours in minutes</li>
            <li><Icon name="check" size={18} /> Customers book and pay online</li>
            <li><Icon name="check" size={18} /> Secure single-use QR tickets</li>
          </ul>
        </div>
        <small>© 2026 BookEase</small>
      </aside>

      <main className="auth-pane">
        <form className="card auth-card" onSubmit={submit}>
          <Link to="/" className="auth-mobile-logo"><Logo /></Link>
          <h2 style={{ margin: '0 0 16px' }}>Create your account</h2>

          <div className="tabs">
            <button type="button" className={mode === 'customer' ? 'tab active' : 'tab'} onClick={() => setMode('customer')}>
              Customer
            </button>
            <button type="button" className={mode === 'owner' ? 'tab active' : 'tab'} onClick={() => setMode('owner')}>
              Business owner
            </button>
          </div>

          {mode === 'owner' && (
            <>
              <label className="field">Business name</label>
              <input className="input" value={f.business_name} onChange={set('business_name')} placeholder="Ali Gym" />

              <label className="field">Business type</label>
              <select className="input" value={f.business_type} onChange={set('business_type')}>
                <option value="gym">Gym</option>
                <option value="salon">Salon</option>
                <option value="clinic">Clinic</option>
              </select>

              <label className="field">City</label>
              <input className="input" value={f.city} onChange={set('city')} placeholder="Karachi" />
            </>
          )}

          <label className="field">Full name</label>
          <input className="input" value={f.full_name} onChange={set('full_name')} placeholder="Ali Khan" />

          <label className="field">Mobile number</label>
          <input className="input" value={f.mobile} onChange={set('mobile')} placeholder="03001234567" inputMode="numeric" />

          <label className="field">Password (at least 6 characters)</label>
          <input className="input" type="password" value={f.password} onChange={set('password')} placeholder="Choose a password" />

          {error && <div className="error">{error}</div>}

          <button className="btn btn-primary btn-block" style={{ marginTop: 22 }} disabled={busy}>
            {busy ? 'Please wait...' : mode === 'owner' ? 'Start my business' : 'Create account'}
          </button>

          <p className="muted" style={{ textAlign: 'center', marginBottom: 0 }}>
            Already have an account? <Link to="/login" className="accent" style={{ fontWeight: 600 }}>Log in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}