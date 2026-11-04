import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Navbar from '../components/Navbar.jsx';
import Ticket from '../components/Ticket.jsx';

export default function Customer() {
  const { auth } = useAuth();
  const [list, setList] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/customer/appointments', { token: auth.token }).then(setList).catch((e) => setError(e.message));
  }, [auth.token]);

  const tickets = list.filter((a) => a.qr_status);

  return (
    <div>
      <Navbar />

      <div className="container page" style={{ maxWidth: 900 }}>
        <h1>Welcome, {auth.full_name}</h1>
        <p className="muted" style={{ margin: 0 }}>Your appointment tickets</p>

        {error && <div className="error">{error}</div>}
        {!error && tickets.length === 0 && (
          <div className="empty rise" style={{ marginTop: 20 }}>
            You have no tickets yet.{' '}
            <Link to="/book" className="accent" style={{ fontWeight: 600 }}>Book your first appointment</Link>
          </div>
        )}

        <div style={{ display: 'grid', gap: 22, marginTop: 24 }}>
          {tickets.map((a, i) => (
            <div key={a.id} className="rise" style={{ animationDelay: i * 120 + 'ms' }}>
              <Ticket a={a} token={auth.token} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}