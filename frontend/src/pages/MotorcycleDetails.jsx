import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ChevronRight, Settings } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getBrandColor = (brandName) => {
  const name = brandName?.toLowerCase() || '';
  if (name.includes('yamaha')) return '#0020bb'; // Yamaha Blue
  if (name.includes('honda')) return '#e60012'; // Honda Red
  if (name.includes('suzuki')) return '#005ca9'; // Suzuki Blue
  if (name.includes('vento')) return '#ff6f00'; // Vento Orange
  if (name.includes('bajaj') || name.includes('pulsar')) return '#00a19b'; // Bajaj Teal
  return '#e60012'; // Default red accent (Kanto style)
};

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
        
        // Mock data fallback
        const isNS200 = id === '1';
        setData({
          motorcycle: {
            model_name: isNS200 ? 'Pulsar NS 200' : id === '2' ? 'FZ-S 3.0' : id === '3' ? 'CBR 250R' : id === '4' ? 'Gixxer SF' : 'Rocketman 250',
            engine_size: isNS200 ? 200 : id === '3' ? 250 : 150,
            image_url: isNS200 ? 'https://i.pinimg.com/736x/5b/18/1a/5b181a25efdaf80f54ce4f7fe7afe360.jpg' : `/images/moto${parseInt(id) - 1}.png`,
            brands: { name: isNS200 ? 'Bajaj' : id === '2' ? 'Yamaha' : id === '3' ? 'Honda' : id === '4' ? 'Suzuki' : 'Vento' }
          },
          services: [
            { price: isNS200 ? 550 : 450, services: { name: 'Afinación Básica', description: 'Cambio de aceite, bujía y revisión de frenos.' } },
            { price: isNS200 ? 980 : 850, services: { name: 'Afinación Completa', description: 'Aceite sintético, bujía iridio, filtro de aire y carburación.' } },
            { price: 250, services: { name: 'Chequeo General', description: 'Revisión de 15 puntos de seguridad.' } }
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

  const brandName = data.motorcycle.brands?.name || 'Desconocida';
  const brandColor = getBrandColor(brandName);

  return (
    <div className="container animate-fade-in" style={{ '--brand-color': brandColor }}>
      <button className="btn-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Volver al catálogo
      </button>

      <div className="details-layout">
        {/* Lado izquierdo: Imagen e Info de la moto */}
        <div className="moto-showcase">
          <img 
            src={data.motorcycle.image_url || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'} 
            alt={data.motorcycle.model_name} 
          />
          <h2>{data.motorcycle.model_name}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{brandName}</span>
            <span>•</span>
            <span style={{ fontWeight: 600 }}>{data.motorcycle.engine_size} cc</span>
          </div>
        </div>

        {/* Lado derecho: Servicios */}
        <div className="services-container">
          <h2 style={{ fontSize: '26px', fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings color="var(--brand-color)" /> Servicios Disponibles
          </h2>
          
          {error && <div style={{ color: '#f59e0b', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>{error}</div>}

          <div className="services-list">
            {data.services && data.services.length > 0 ? (
              data.services.map((item, index) => (
                <div key={index} className="service-item">
                  <div className="service-info">
                    <h3>{item.services.name}</h3>
                    <p>{item.services.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="service-price">${item.price}</div>
                    <ChevronRight color="var(--text-muted)" />
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
