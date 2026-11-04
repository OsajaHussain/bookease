import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { Logo } from './Icons.jsx';

const cls = ({ isActive }) => (isActive ? 'navlink active' : 'navlink');

export default function Navbar() {
  const { auth, logout } = useAuth();
  const nav = useNavigate();
  const isCustomer = auth?.role === 'customer';

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/">
          <Logo />
        </Link>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {!auth && (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}

          {auth && isCustomer && (
            <>
              <NavLink to="/book" className={cls}>Book appointment</NavLink>
              <NavLink to="/customer" className={cls}>My tickets</NavLink>
            </>
          )}

          {auth && !isCustomer && <NavLink to="/owner" className={cls}>Dashboard</NavLink>}

          {auth && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { logout(); nav('/'); }}
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}