import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ChevronRight, Settings } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const BRAND_COLORS = {
  bajaj: '#00a19b', yamaha: '#0039a6', honda: '#e60012',
  suzuki: '#005ca9', vento: '#ff6f00', italika: '#d4145a', kawasaki: '#6dc066',
};

const getBrandColor = (brandName) => {
  const name = brandName?.toLowerCase() || '';
  for (const [key, color] of Object.entries(BRAND_COLORS)) {
    if (name.includes(key)) return color;
  }
  return '#e60012';
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
        
        const mockModels = {
          '1': { model_name: 'Pulsar NS 200', engine_size: 200, image_url: 'https://i.pinimg.com/736x/5b/18/1a/5b181a25efdaf80f54ce4f7fe7afe360.jpg', brands: { name: 'Bajaj' } },
          '2': { model_name: 'FZ 25', engine_size: 249, image_url: 'https://i.pinimg.com/736x/ea/07/0c/ea070c16dc1e27b496d3b7e0e4cb3486.jpg', brands: { name: 'Yamaha' } },
          '3': { model_name: 'CB 250 Twister', engine_size: 250, image_url: 'https://i.pinimg.com/736x/c3/4a/a2/c34aa2a16e6b94d8920de3e9f1a89a91.jpg', brands: { name: 'Honda' } },
          '4': { model_name: 'Gixxer SF 250', engine_size: 250, image_url: 'https://i.pinimg.com/736x/44/3a/e7/443ae77e44fde9eff2b7e2ff5e959d57.jpg', brands: { name: 'Suzuki' } },
          '5': { model_name: 'Tornado 250', engine_size: 250, image_url: 'https://i.pinimg.com/736x/3a/4d/c8/3a4dc8b4e43dbd4f1f119eaa4b1dfe21.jpg', brands: { name: 'Vento' } },
          '6': { model_name: 'Dominar 400', engine_size: 373, image_url: 'https://i.pinimg.com/736x/f6/ac/10/f6ac10c2bd5e116bdfb4e4eac1f23009.jpg', brands: { name: 'Bajaj' } },
          '7': { model_name: 'MT-03', engine_size: 321, image_url: 'https://i.pinimg.com/736x/4c/87/de/4c87de03dfa66d3b2e2e8dc3e8d39ec0.jpg', brands: { name: 'Yamaha' } },
          '8': { model_name: 'XR 150L', engine_size: 150, image_url: 'https://i.pinimg.com/736x/dc/56/d4/dc56d4c8e82e3b15be69d2e6eb0ab7e1.jpg', brands: { name: 'Honda' } },
        };
        const moto = mockModels[id] || mockModels['1'];
        setData({
          motorcycle: moto,
          services: [
            { price: 550, services: { name: 'Afinación Básica', description: 'Cambio de aceite, bujía y revisión de frenos.' } },
            { price: 980, services: { name: 'Afinación Completa', description: 'Aceite sintético, bujía iridio, filtro de aire y carburación completa.' } },
            { price: 250, services: { name: 'Chequeo General', description: 'Revisión de 15 puntos de seguridad del vehículo.' } },
            { price: 350, services: { name: 'Servicio de Frenos', description: 'Cambio de balatas, purgado de líquido y ajuste de frenos.' } },
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
        <ArrowLeft size={16} /> Volver al catálogo
      </button>

      <div className="details-layout">
        <div className="moto-showcase">
          <img 
            src={data.motorcycle.image_url} 
            alt={data.motorcycle.model_name} 
          />
          <h2>{data.motorcycle.model_name}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', color: '#666', marginTop: '8px' }}>
            <span style={{ fontWeight: 700, color: brandColor, fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase' }}>{brandName}</span>
            <span>•</span>
            <span style={{ fontWeight: 700, fontFamily: 'Oswald, sans-serif' }}>{data.motorcycle.engine_size} cc</span>
          </div>
        </div>

        <div className="services-container">
          <h2 style={{ fontSize: '24px', fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings color={brandColor} /> Servicios Disponibles
          </h2>
          
          {error && <div style={{ color: '#f59e0b', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>{error}</div>}

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
                    <ChevronRight color="#999" />
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#666' }}>No hay servicios registrados para esta motocicleta.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorcycleDetails;
