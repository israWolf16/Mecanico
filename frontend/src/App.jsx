import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import Home from './pages/Home';
import MotorcycleDetails from './pages/MotorcycleDetails';
import './index.css';

function App() {
  return (
    <Router>
      <header className="app-header">
        <Link to="/" className="brand">
          <Wrench size={28} color="#ffffff" />
          <h1>MOTOSERV</h1>
        </Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/moto/:id" element={<MotorcycleDetails />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
