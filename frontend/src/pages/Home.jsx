import { Link } from 'react-router-dom';
import Hero3D from '../components/Hero3D.jsx';
import Navbar from '../components/Navbar.jsx';
import Reveal from '../components/Reveal.jsx';
import { Icon } from '../components/Icons.jsx';
import { useAuth } from '../auth.jsx';

const steps = [
  { icon: 'calendar', title: 'Choose a slot', text: 'Pick a service, a specialist and an available time.' },
  { icon: 'card', title: 'Pay online', text: 'Complete your payment in under a minute.' },
  { icon: 'ticket', title: 'Get your ticket', text: 'Your appointment ticket arrives with a personal QR code.' },
  { icon: 'shield', title: 'Scan and enter', text: 'The business scans your QR code. Approved means you are in.' },
];

const pros = [
  { icon: 'dumbbell', title: 'Gyms', text: 'Trainer sessions, classes and personal coaching.' },
  { icon: 'scissors', title: 'Salons', text: 'Hair, beauty and grooming appointments.' },
  { icon: 'cross', title: 'Clinics', text: 'Doctor visits without the waiting room queue.' },
];

const owner = [
  'Add and manage your own services and prices',
  'Set your team and their working hours',
  'Scan QR tickets at the door in seconds',
  "See today's bookings and revenue at a glance",
];

const delay = (s) => ({ animationDelay: s + 's' });

export default function Home() {
  const { auth } = useAuth();
  const isCustomer = auth?.role === 'customer';

  const buttons = !auth
    ? [
        { to: '/register', text: 'Get started', primary: true },
        { to: '/login', text: 'Log in' },
      ]
    : isCustomer
    ? [
        { to: '/book', text: 'Book an appointment', primary: true },
        { to: '/customer', text: 'My tickets' },
      ]
    : [{ to: '/owner', text: 'Open dashboard', primary: true }];

  return (
    <div>
      <Navbar />

      <header className="hero">
        <div className="hero-inner">
          <div style={{ flex: '1 1 440px' }}>
            <span className="badge rise" style={delay(0)}>Gyms • Salons • Clinics</span>
            <h1 className="rise" style={delay(0.1)}>
              Online bookings,
              <br />
              <span className="accent">without the hassle.</span>
            </h1>
            <p className="lead rise" style={delay(0.2)}>
              Appointment booking, secure payments and QR tickets for gyms, salons and clinics, all in one platform.
            </p>
            <div className="rise" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', ...delay(0.3) }}>
              {buttons.map((b) => (
                <Link key={b.to} to={b.to} className={b.primary ? 'btn btn-primary btn-lg' : 'btn btn-ghost btn-lg'}>
                  {b.text}
                </Link>
              ))}
            </div>
            <div className="checks rise" style={delay(0.4)}>
              <span><Icon name="check" size={16} /> Instant confirmation</span>
              <span><Icon name="check" size={16} /> Secure QR entry</span>
              <span><Icon name="check" size={16} /> No double bookings</span>
            </div>
          </div>

          <div className="rise" style={{ flex: '1 1 420px', height: 'min(540px, 95vw)', position: 'relative', ...delay(0.25) }}>
            <Hero3D />
            <div className="float-chip chip-a">
              <span className="chip-dot"><Icon name="check" size={13} /></span>
              Booking confirmed
            </div>
            <div className="float-chip chip-b">
              <span className="chip-dot"><Icon name="shield" size={13} /></span>
              QR approved, welcome in
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <h2>How it works</h2>
            <p>Four simple steps from booking to entry.</p>
          </Reveal>
          <div className="grid grid-4">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 110}>
                <div className="card card-hover" style={{ height: '100%' }}>
                  <div className="icon-box"><Icon name={s.icon} size={22} /></div>
                  <div className="step-label">Step {i + 1}</div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{s.title}</h3>
                  <p className="muted" style={{ margin: 0 }}>{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="section-head">
            <h2>Built for every profession</h2>
            <p>One platform, with a setup that fits each type of business.</p>
          </Reveal>
          <div className="grid grid-3">
            {pros.map((p, i) => (
              <Reveal key={p.title} delay={i * 120}>
                <div className="card card-hover" style={{ height: '100%' }}>
                  <div className="icon-box"><Icon name={p.icon} size={22} /></div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{p.title}</h3>
                  <p className="muted" style={{ margin: 0 }}>{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <div className="card" style={{ padding: 36 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <div className="step-label">For business owners</div>
                  <h2 style={{ margin: '0 0 10px', fontSize: 30 }}>Run your day from one dashboard</h2>
                  <p className="muted" style={{ margin: 0 }}>
                    Set up in minutes. Your customers book online and walk in with a ticket.
                  </p>
                </div>
                <ul className="feature-list" style={{ flex: '1 1 300px' }}>
                  {owner.map((t, i) => (
                    <li key={t}>
                      <Reveal className="feature-item" delay={150 + i * 140}>
                        <Icon name="check" size={18} /> <span>{t}</span>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {!auth && (
        <section style={{ paddingBottom: 72 }}>
          <div className="container">
            <Reveal>
              <div className="cta-band">
                <h2>Bring your business online</h2>
                <p>Create your business account and start taking bookings today.</p>
                <Link to="/register" className="btn btn-primary btn-lg">Create business account</Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <footer className="footer">© 2026 BookEase. All rights reserved.</footer>
    </div>
  );
}