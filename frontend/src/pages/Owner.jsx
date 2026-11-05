import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Navbar from '../components/Navbar.jsx';
import Scanner from '../components/Scanner.jsx';
import ServicesPanel from '../components/ServicesPanel.jsx';
import StaffPanel from '../components/StaffPanel.jsx';
import HoursPanel from '../components/HoursPanel.jsx';
import AppointmentsPanel from '../components/AppointmentsPanel.jsx';
import RequestModal from '../components/RequestModal.jsx';
import CountUp from '../components/CountUp.jsx';
import { Icon } from '../components/Icons.jsx';

export default function Owner() {
  const { auth } = useAuth();
  const isOwner = auth.role === 'owner';

  const [tab, setTab] = useState('overview');
  const [today, setToday] = useState(null);
  const [setup, setSetup] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [error, setError] = useState('');

  const loadToday = useCallback(() => {
    api('/staff/today', { token: auth.token }).then(setToday).catch((e) => setError(e.message));
  }, [auth.token]);

  const loadSetup = useCallback(async () => {
    if (!isOwner) return;
    try {
      const [s, st, h] = await Promise.all([
        api('/owner/services', { token: auth.token }),
        api('/owner/staff', { token: auth.token }),
        api('/owner/working-hours', { token: auth.token }),
      ]);
      setSetup({ services: s.length, staff: st.length, hours: h.length });
    } catch {}
  }, [auth.token, isOwner]);

  useEffect(() => {
    loadToday();
    loadSetup();
  }, [loadToday, loadSetup]);

  const closeModal = useCallback(() => setViewId(null), []);

  const tabs = [
    ['overview', 'Overview'],
    ['bookings', 'Appointments'],
    ...(isOwner
      ? [
          ['services', 'Services'],
          ['staff', 'Team'],
          ['hours', 'Working hours'],
        ]
      : []),
  ];

  const steps = setup
    ? [
        { label: 'Add your services', done: setup.services > 0, tab: 'services' },
        { label: 'Add your team members', done: setup.staff > 0, tab: 'staff' },
        { label: 'Set your working hours', done: setup.hours > 0, tab: 'hours' },
      ]
    : [];
  const incomplete = steps.some((s) => !s.done);

  return (
    <div>
      <Navbar />

      <div className="container page">
        <h1>Welcome, {auth.full_name}</h1>
        <p className="muted" style={{ margin: 0 }}>Manage your business and check in customers.</p>

        <div className="subtabs">
          {tabs.map(([key, label]) => (
            <button key={key} className={tab === key ? 'subtab active' : 'subtab'} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {error && <div className="error">{error}</div>}

        <div key={tab} className="fade-in">
          {tab === 'overview' && (
            <>
              {isOwner && incomplete && (
                <div className="card rise" style={{ marginBottom: 20 }}>
                  <h3 className="card-title">Finish setting up your business</h3>
                  <p className="muted" style={{ marginTop: 0 }}>
                    Customers can book as soon as these three steps are done.
                  </p>
                  {steps.map((s, i) => (
                    <div key={s.tab} className="check-item">
                      <span className={s.done ? 'check-dot done' : 'check-dot'}>
                        {s.done ? <Icon name="check" size={14} /> : i + 1}
                      </span>
                      <span style={{ flex: 1, fontWeight: 600 }}>{s.label}</span>
                      {!s.done && (
                        <button className="btn btn-primary btn-sm" onClick={() => setTab(s.tab)}>Do it now</button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {today && (
                <div className="stats">
                  <div className="card card-hover rise">
                    <div className="stat-label">Today's appointments</div>
                    <div className="stat-value"><CountUp value={today.count} /></div>
                  </div>
                  <div className="card card-hover rise" style={{ animationDelay: '120ms' }}>
                    <div className="stat-label">Today's revenue</div>
                    <div className="stat-value"><CountUp value={today.revenue} prefix="Rs " /></div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'start' }}>
                <Scanner token={auth.token} onDone={loadToday} />

                <div className="card">
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="clock" size={20} /> Today's schedule
                  </h3>
                  {today && today.appointments.length === 0 && (
                    <div className="empty">No confirmed appointments for today yet.</div>
                  )}
                  {today && today.appointments.map((a, i) => (
                    <div key={a.id} className="row rise" style={{ animationDelay: i * 70 + 'ms' }}>
                      <div className="grow">
                        <b>{a.time}</b> • {a.customer}
                        <div className="muted" style={{ fontSize: 13 }}>{a.service} • {a.staff}</div>
                      </div>
                      {a.has_request ? (
                        <button className="btn btn-ghost btn-sm" onClick={() => setViewId(a.id)}>
                          <Icon name="image" size={14} /> Request
                        </button>
                      ) : null}
                      <span className={a.status === 'completed' ? 'pill used' : 'pill ok'}>
                        {a.status === 'completed' ? 'Checked in' : 'Upcoming'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'bookings' && <AppointmentsPanel token={auth.token} onView={setViewId} />}
          {tab === 'services' && isOwner && <ServicesPanel token={auth.token} onChange={loadSetup} />}
          {tab === 'staff' && isOwner && <StaffPanel token={auth.token} onChange={loadSetup} />}
          {tab === 'hours' && isOwner && <HoursPanel token={auth.token} onChange={loadSetup} />}
        </div>
      </div>

      {viewId && <RequestModal id={viewId} token={auth.token} onClose={closeModal} />}
    </div>
  );
}