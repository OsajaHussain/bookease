import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Logo } from '../components/Icons.jsx';

export default function Login() {
  const nav = useNavigate();
  const { save } = useAuth();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const d = await api('/auth/login', { method: 'POST', body: { mobile, password } });
      save({ token: d.token, role: d.role, full_name: d.full_name, business_id: d.business_id });
      nav(d.role === 'customer' ? '/book' : '/owner');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <Link to="/"><Logo /></Link>
        <h2 style={{ margin: '22px 0 4px' }}>Welcome back</h2>
        <p className="muted" style={{ margin: '0 0 8px' }}>Log in with your mobile number.</p>

        <label className="field">Mobile number</label>
        <input className="input" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="03001234567" inputMode="numeric" />

        <label className="field">Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />

        {error && <div className="error">{error}</div>}

        <button className="btn btn-primary btn-block" style={{ marginTop: 22 }} disabled={busy}>
          {busy ? 'Please wait...' : 'Log in'}
        </button>

        <p className="muted" style={{ textAlign: 'center', marginBottom: 0 }}>
          New here? <Link to="/register" className="accent" style={{ fontWeight: 600 }}>Create an account</Link>
        </p>
      </form>
    </div>
  );
}