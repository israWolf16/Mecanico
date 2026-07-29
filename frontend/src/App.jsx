import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Wrench, ShieldCheck } from 'lucide-react';
import Home from './pages/Home';
import MotorcycleDetails from './pages/MotorcycleDetails';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <header className="app-header">
        <Link to="/" className="brand">
          <Wrench size={28} color="#ffffff" />
          <h1>MOTOSERV</h1>
        </Link>
        <Link to="/login" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontFamily: 'Oswald', fontSize: '14px', textTransform: 'uppercase' }}>
          <ShieldCheck size={18} /> Acceso Mecánico
        </Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/moto/:id" element={<MotorcycleDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
