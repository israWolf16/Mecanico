import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Wrench, ShieldCheck, LayoutDashboard } from 'lucide-react';
import Home from './pages/Home';
import MotorcycleDetails from './pages/MotorcycleDetails';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AppointmentForm from './pages/AppointmentForm';
import ManualAppointmentForm from './pages/ManualAppointmentForm';
import './index.css';

// Inner component that has access to useLocation (inside Router)
function AppContent() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('adminToken'));

  // Re-check token on every route change
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('adminToken'));
  }, [location]);

  // Listen for storage changes (login/logout from other tabs or same tab)
  useEffect(() => {
    const handleStorage = () => setIsLoggedIn(!!localStorage.getItem('adminToken'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <>
      <header className="app-header">
        <Link to="/" className="brand">
          <Wrench size={28} color="#ffffff" />
          <h1>MOTOSERV</h1>
        </Link>
        {isLoggedIn ? (
          <Link to="/admin" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontFamily: 'Oswald', fontSize: '14px', textTransform: 'uppercase' }}>
            <LayoutDashboard size={18} /> Panel Admin
          </Link>
        ) : (
          <Link to="/login" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontFamily: 'Oswald', fontSize: '14px', textTransform: 'uppercase' }}>
            <ShieldCheck size={18} /> Acceso Mecánico
          </Link>
        )}
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/moto/:id" element={<MotorcycleDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/agendar" element={<AppointmentForm />} />
          <Route path="/agendar-manual" element={<ManualAppointmentForm />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
