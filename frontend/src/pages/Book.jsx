import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Navbar from '../components/Navbar.jsx';
import { Icon } from '../components/Icons.jsx';

const TYPE_ICON = { gym: 'dumbbell', salon: 'scissors', clinic: 'cross' };
const today = () => new Date().toLocaleDateString('en-CA');

function Step({ n, title }) {
  return (
    <div className="step-head">
      <span className="step-no">{n}</span>
      <h3>{title}</h3>
    </div>
  );
}

export default function Book() {
  const nav = useNavigate();
  const { auth } = useAuth();

  const [businesses, setBusinesses] = useState([]);
  const [data, setData] = useState(null);
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/public/businesses').then(setBusinesses).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    setTime('');
    setSlots([]);
    if (!serviceId || !staffId || !date) return;
    api(`/public/slots?staff_id=${staffId}&service_id=${serviceId}&date=${date}`)
      .then((r) => setSlots(r.slots))
      .catch((e) => setError(e.message));
  }, [serviceId, staffId, date]);

  async function pick(slug) {
    setError('');
    setServiceId('');
    setStaffId('');
    try {
      setData(await api('/public/business/' + slug));
    } catch (e) {
      setError(e.message);
    }
  }

  const service = data?.services.find((s) => String(s.id) === String(serviceId));
  const staffList = data
    ? data.staff.filter((s) => (s.service_ids || '').split(',').includes(String(serviceId)))
    : [];

  async function confirm() {
    setError('');
    setBusy(true);
    try {
      const b = await api('/customer/appointments', {
        method: 'POST',
        token: auth.token,
        body: { staff_id: Number(staffId), service_id: Number(serviceId), date, time },
      });
      await api(`/customer/appointments/${b.appointment_id}/pay`, { method: 'POST', token: auth.token });
      nav('/customer');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Navbar />

      <div className="container page" style={{ maxWidth: 900 }}>
        <h1>Book an appointment</h1>
        <p className="muted" style={{ margin: 0 }}>Choose a business, a service and a time that suits you.</p>

        {error && <div className="error">{error}</div>}

        <Step n="1" title="Choose a business" />
        {businesses.length === 0 && <div className="empty">No businesses available yet.</div>}
        <div className="grid grid-3">
          {businesses.map((b, i) => (
            <div
              key={b.id}
              className={data?.business.id === b.id ? 'card pick active rise' : 'card pick rise'}
              onClick={() => pick(b.slug)}
              style={{ padding: 18, animationDelay: i * 70 + 'ms' }}
            >
              <div className="icon-box" style={{ marginBottom: 10 }}>
                <Icon name={TYPE_ICON[b.business_type]} size={22} />
              </div>
              <b>{b.name}</b>
              <div className="muted" style={{ fontSize: 14, textTransform: 'capitalize' }}>
                {b.business_type}{b.city ? ' • ' + b.city : ''}
              </div>
            </div>
          ))}
        </div>

        {data && (
          <div className="enter" key={data.business.id}>
            <Step n="2" title="Choose a service" />
            {data.services.length === 0 && <div className="empty">This business has not added any services yet.</div>}
            <div className="grid grid-3">
              {data.services.map((s) => (
                <div
                  key={s.id}
                  className={String(serviceId) === String(s.id) ? 'card pick active' : 'card pick'}
                  onClick={() => { setServiceId(String(s.id)); setStaffId(''); }}
                  style={{ padding: 18 }}
                >
                  <b>{s.name}</b>
                  <div className="muted" style={{ fontSize: 14 }}>
                    {s.duration_min} min • Rs {Number(s.price).toLocaleString()}
                  </div>
                  {s.description && <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{s.description}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {serviceId && (
          <div className="enter" key={'staff-' + serviceId}>
            <Step n="3" title="Choose a specialist" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {staffList.map((s) => (
                <button
                  key={s.id}
                  className={String(staffId) === String(s.id) ? 'chip active' : 'chip'}
                  onClick={() => setStaffId(String(s.id))}
                >
                  {s.name}{s.title ? ' • ' + s.title : ''}
                </button>
              ))}
              {staffList.length === 0 && (
                <div className="empty" style={{ width: '100%' }}>No specialist is available for this service yet.</div>
              )}
            </div>
          </div>
        )}

        {staffId && (
          <div className="enter" key={'time-' + staffId}>
            <Step n="4" title="Pick a date and time" />
            <input
              className="input"
              type="date"
              min={today()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ maxWidth: 240 }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
              {slots.map((t) => (
                <button key={t} className={time === t ? 'chip active' : 'chip'} onClick={() => setTime(t)}>
                  {t}
                </button>
              ))}
              {slots.length === 0 && <div className="muted">No slots available on this day.</div>}
            </div>
          </div>
        )}

        {time && service && (
          <div className="card enter" style={{ marginTop: 30 }} key={'pay-' + time}>
            <h3 className="card-title">Confirm and pay</h3>
            <div className="summary-row"><span>Service</span><b>{service.name}</b></div>
            <div className="summary-row"><span>Date</span><b>{date}</b></div>
            <div className="summary-row"><span>Time</span><b>{time}</b></div>
            <div className="summary-row"><span>Total</span><b>Rs {Number(service.price).toLocaleString()}</b></div>
            <p className="hint">Checkout is running in test mode. JazzCash and Easypaisa will be connected soon.</p>
            <button className="btn btn-primary btn-block btn-lg" onClick={confirm} disabled={busy}>
              {busy ? 'Please wait...' : `Pay Rs ${Number(service.price).toLocaleString()} and get ticket`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}