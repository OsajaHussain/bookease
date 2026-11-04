import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Owner from './pages/Owner.jsx';
import Customer from './pages/Customer.jsx';
import Book from './pages/Book.jsx';
import { useAuth } from './auth.jsx';

function Protected({ roles, children }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (!roles.includes(auth.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="fade-in">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/owner" element={<Protected roles={['owner', 'staff']}><Owner /></Protected>} />
        <Route path="/customer" element={<Protected roles={['customer']}><Customer /></Protected>} />
        <Route path="/book" element={<Protected roles={['customer']}><Book /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}