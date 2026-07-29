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
          { id: '1', model_name: 'Pulsar NS 200', engine_size: 200, image_url: 'https://i.pinimg.com/736x/5b/18/1a/5b181a25efdaf80f54ce4f7fe7afe360.jpg', brands: { name: 'Bajaj' } },
          { id: '2', model_name: 'FZ-S 3.0', engine_size: 149, image_url: '/images/moto1.png', brands: { name: 'Yamaha' } },
          { id: '3', model_name: 'CBR 250R', engine_size: 250, image_url: '/images/moto2.png', brands: { name: 'Honda' } },
          { id: '4', model_name: 'Gixxer SF', engine_size: 155, image_url: '/images/moto3.png', brands: { name: 'Suzuki' } },
          { id: '5', model_name: 'Rocketman 250', engine_size: 250, image_url: '/images/moto4.png', brands: { name: 'Vento' } }
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
      {error && <div style={{ color: '#dc2626', marginBottom: '20px', textAlign: 'center', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', padding: '12px', borderRadius: '8px', fontWeight: '500' }}>{error} <br/> (Mostrando datos de prueba)</div>}
      
      <div className="motorcycle-grid">
        {motorcycles.map((moto) => (
          <MotorcycleCard key={moto.id} moto={moto} />
        ))}
      </div>
    </div>
  );
};

export default Home;
