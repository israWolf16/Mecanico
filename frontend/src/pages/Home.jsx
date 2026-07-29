import { useState, useEffect } from 'react';
import axios from 'axios';
import MotorcycleCard from '../components/MotorcycleCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Home = () => {
  const [motorcycles, setMotorcycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMotorcycles = async () => {
      try {
        const response = await axios.get(`${API_URL}/motorcycles`);
        setMotorcycles(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching motorcycles:', err);
        setError('No se pudieron cargar los modelos de motocicletas. Asegúrate de tener el backend corriendo y las tablas creadas en Supabase.');
        setLoading(false);
        
        // Mock data for UI presentation if backend is down
        setMotorcycles([
          { id: '1', model_name: 'FZ-S 3.0', engine_size: 149, image_url: '/images/moto1.png', brands: { name: 'Yamaha' } },
          { id: '2', model_name: 'CBR 250R', engine_size: 250, image_url: '/images/moto2.png', brands: { name: 'Honda' } },
          { id: '3', model_name: 'Gixxer SF', engine_size: 155, image_url: '/images/moto3.png', brands: { name: 'Suzuki' } },
          { id: '4', model_name: 'Rocketman 250', engine_size: 250, image_url: '/images/moto4.png', brands: { name: 'Vento' } }
        ]);
      }
    };

    fetchMotorcycles();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="section-title">Selecciona tu Motocicleta</h2>
      {error && <div style={{ color: '#ef4444', marginBottom: '20px', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '8px' }}>{error} <br/> (Mostrando datos de prueba)</div>}
      
      <div className="motorcycle-grid">
        {motorcycles.map((moto) => (
          <MotorcycleCard key={moto.id} moto={moto} />
        ))}
      </div>
    </div>
  );
};

export default Home;
