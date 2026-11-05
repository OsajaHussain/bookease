import { useEffect, useState } from 'react';
import '../requests.css';
import { api } from '../api.js';

export default function RequestModal({ id, token, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/staff/appointments/${id}/request`, { token }).then(setData).catch((e) => setError(e.message));
  }, [id, token]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const empty = data && !data.description && !data.image;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <h3 style={{ margin: 0 }}>Customer request</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>

        {error && <div className="error">{error}</div>}
        {!data && !error && <p className="muted">Loading...</p>}

        {data && (
          <>
            <div className="muted" style={{ marginTop: 6, fontSize: 14 }}>
              {data.customer} • {data.service} • {data.when}
            </div>

            {empty && <div className="empty" style={{ marginTop: 14 }}>The customer did not add any details.</div>}
            {data.description && <div className="modal-note">{data.description}</div>}
            {data.image && <img src={data.image} alt="Photo shared by the customer" />}
          </>
        )}
      </div>
    </div>
  );
}