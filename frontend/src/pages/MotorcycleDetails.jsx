import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ChevronRight, Settings } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const MotorcycleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/motorcycles/${id}/services`);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching details:', err);
        setError('No se pudieron cargar los detalles. Mostrando datos de prueba.');
        setLoading(false);
        
        // Mock data
        setData({
          motorcycle: {
            model_name: id === '1' ? 'FZ-S 3.0' : id === '2' ? 'CBR 250R' : id === '3' ? 'Gixxer SF' : 'Rocketman 250',
            engine_size: id === '2' ? 250 : 150,
            image_url: `/images/moto${id}.png`,
            brands: { name: id === '1' ? 'Yamaha' : id === '2' ? 'Honda' : 'Vento' }
          },
          services: [
            { price: 450, services: { name: 'Afinación Básica', description: 'Cambio de aceite, bujía y revisión de frenos.' } },
            { price: 850, services: { name: 'Afinación Completa', description: 'Aceite sintético, bujía iridio, filtro de aire y carburación.' } },
            { price: 200, services: { name: 'Chequeo General', description: 'Revisión de 15 puntos de seguridad.' } }
          ]
        });
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <button className="btn-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Volver al catálogo
      </button>

      <div className="details-layout">
        {/* Lado izquierdo: Imagen e Info de la moto */}
        <div className="moto-showcase glass-panel">
          <img 
            src={data.motorcycle.image_url || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'} 
            alt={data.motorcycle.model_name} 
          />
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>{data.motorcycle.model_name}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
            <span>{data.motorcycle.brands?.name}</span>
            <span>•</span>
            <span>{data.motorcycle.engine_size} cc</span>
          </div>
        </div>

        {/* Lado derecho: Servicios */}
        <div className="services-container">
          <h2 style={{ fontSize: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings color="var(--primary-color)" /> Servicios Disponibles
          </h2>
          
          {error && <div style={{ color: '#f59e0b', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

          <div className="services-list">
            {data.services && data.services.length > 0 ? (
              data.services.map((item, index) => (
                <div key={index} className="service-item glass-panel">
                  <div className="service-info">
                    <h3>{item.services.name}</h3>
                    <p>{item.services.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="service-price">${item.price}</div>
                    <ChevronRight color="var(--text-secondary)" />
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No hay servicios registrados para esta motocicleta.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorcycleDetails;
