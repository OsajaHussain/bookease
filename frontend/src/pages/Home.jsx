import { Link } from 'react-router-dom';
import Hero3D from '../components/Hero3D.jsx';
import Navbar from '../components/Navbar.jsx';
import Reveal from '../components/Reveal.jsx';
import { Icon, Logo } from '../components/Icons.jsx';
import { useAuth } from '../auth.jsx';

const strip = [
  { big: 'Real-time', small: 'slot availability' },
  { big: '15 min', small: 'slot hold while paying' },
  { big: '1 QR', small: 'per booking, single use' },
  { big: '3 steps', small: 'to set up your business' },
];

const steps = [
  { icon: 'calendar', title: 'Choose a slot', text: 'Pick a service, a specialist and an available time.' },
  { icon: 'card', title: 'Pay online', text: 'Complete your payment in under a minute.' },
  { icon: 'ticket', title: 'Get your ticket', text: 'Your appointment ticket arrives with a personal QR code.' },
  { icon: 'shield', title: 'Scan and enter', text: 'The business scans your QR code. Approved means you are in.' },
];

const features = [
  { icon: 'calendar', title: 'Live availability', text: 'Customers only see slots that are truly free, based on your hours and existing bookings.' },
  { icon: 'ticket', title: 'Secure QR tickets', text: 'Every confirmed booking gets a unique QR code that works only once.' },
  { icon: 'shield', title: 'Instant check-in', text: 'Scan at the door and get a clear Approved or Not approved result, with sound.' },
  { icon: 'user', title: 'Team and services', text: 'Add your own services, prices and specialists in a few minutes.' },
  { icon: 'clock', title: 'Working hours', text: 'Set open days and times. Customers cannot book outside them.' },
  { icon: 'card', title: 'Daily dashboard', text: "See today's bookings and revenue at a glance." },
];

const pros = [
  { icon: 'dumbbell', title: 'Gyms', text: 'Trainer sessions, classes and personal coaching.' },
  { icon: 'scissors', title: 'Salons', text: 'Hair, beauty and grooming appointments.' },
  { icon: 'cross', title: 'Clinics', text: 'Doctor visits without the waiting room queue.' },
];

const faqs = [
  {
    q: 'How does QR check-in work?',
    a: 'After a booking is confirmed, the customer gets a ticket with a unique QR code. At the door, your team scans it from the dashboard using a phone or laptop camera and sees Approved or Not approved right away. Each code works only once.',
  },
  {
    q: 'Can two customers book the same slot?',
    a: 'No. Once a slot is booked, or while someone is paying for it, it disappears for everyone else.',
  },
  {
    q: 'Can I set up my own services and team?',
    a: 'Yes. From the dashboard you add your services, prices, team members and working hours. Customers can start booking as soon as setup is done.',
  },
  {
    q: 'Does it work on a phone?',
    a: 'Yes. BookEase works in any modern browser on a phone, tablet or computer.',
  },
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
        <div className="hero-grid" />
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

      <div className="strip-wrap">
        <div className="container">
          <div className="strip">
            {strip.map((s) => (
              <div key={s.big}>
                <b>{s.big}</b>
                <span>{s.small}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center' }}>
            <Reveal style={{ flex: '1 1 320px' }}>
              <div className="step-label">For business owners</div>
              <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(26px, 3.4vw, 36px)' }}>
                Run your whole day from one dashboard
              </h2>
              <p className="muted" style={{ margin: '0 0 22px' }}>
                See who is coming, check people in with a scan and track the day's revenue, without paperwork or
                phone calls.
              </p>
              <ul className="feature-list">
                {['Today\'s schedule at a glance', 'Scan QR tickets from any camera', 'Manage services, team and hours yourself'].map((t) => (
                  <li key={t} className="feature-item"><Icon name="check" size={18} /> <span>{t}</span></li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={150} className="mock-wrap">
              <div className="mock">
                <div className="mock-bar">
                  <i /><i /><i />
                  <span className="mock-url">BookEase dashboard</span>
                </div>
                <div className="mock-body">
                  <div className="mock-side">
                    <div className="on">Overview</div>
                    <div>Services</div>
                    <div>Team</div>
                    <div>Working hours</div>
                  </div>
                  <div className="mock-main">
                    <div className="mock-stats">
                      <div className="mock-stat"><small>Today's appointments</small><b>12</b></div>
                      <div className="mock-stat"><small>Today's revenue</small><b>Rs 18,400</b></div>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <div className="mock-row">
                        <span><b>10:00</b> Ayesha K.<br /><small className="muted">Personal Training</small></span>
                        <span className="pill used">Checked in</span>
                      </div>
                      <div className="mock-row">
                        <span><b>11:30</b> Hamza R.<br /><small className="muted">Group Class</small></span>
                        <span className="pill ok">Upcoming</span>
                      </div>
                      <div className="mock-row">
                        <span><b>13:00</b> Sara M.<br /><small className="muted">Personal Training</small></span>
                        <span className="pill ok">Upcoming</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mock-toast">
                <Icon name="check" size={18} /> Approved: Ayesha K.
              </div>
              <div className="hint" style={{ textAlign: 'center', marginTop: 30 }}>Illustrative sample data</div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="section-head">
            <h2>Everything you need to run your day</h2>
            <p>Simple tools that keep bookings organised and entry smooth.</p>
          </Reveal>
          <div className="grid grid-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div className="card card-hover" style={{ height: '100%' }}>
                  <div className="icon-box"><Icon name={f.icon} size={22} /></div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{f.title}</h3>
                  <p className="muted" style={{ margin: 0 }}>{f.text}</p>
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
          <Reveal className="section-head">
            <h2>Frequently asked questions</h2>
          </Reveal>
          <Reveal className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      {!auth && (
        <section style={{ paddingBottom: 72 }}>
          <div className="container">
            <Reveal>
              <div className="cta-band">
                <h2>Bring your business online</h2>
                <p>Create your business account and start taking bookings.</p>
                <Link to="/register" className="btn btn-primary btn-lg">Create business account</Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <footer className="footer-pro">
        <div className="footer-grid">
          <div>
            <Logo />
            <p style={{ margin: 0, maxWidth: 320, fontSize: 14, color: '#94a3b8' }}>
              Online appointment booking with secure QR tickets, for gyms, salons and clinics.
            </p>
          </div>
          <div>
            <h4>For customers</h4>
            <Link to="/book">Book an appointment</Link>
            <Link to="/customer">My tickets</Link>
          </div>
          <div>
            <h4>For businesses</h4>
            <Link to="/register">Create business account</Link>
            <Link to="/login">Log in</Link>
          </div>
        </div>
        <div className="footer-bottom">© 2026 BookEase. All rights reserved.</div>
      </footer>
    </div>
  );
}