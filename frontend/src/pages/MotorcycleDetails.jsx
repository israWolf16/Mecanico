import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ChevronRight, Settings, CalendarDays } from 'lucide-react';

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
          '2': { model_name: 'FZ-S 3.0', engine_size: 149, image_url: 'https://i.pinimg.com/736x/3a/ae/72/3aae72a46bf043cad52e85030e2e96a4.jpg', brands: { name: 'Yamaha' } },
          '3': { model_name: 'CBR 250R', engine_size: 250, image_url: 'https://i.pinimg.com/736x/db/5b/9e/db5b9ea4956d501492f0f0e237461dfb.jpg', brands: { name: 'Honda' } },
          '4': { model_name: 'Gixxer SF', engine_size: 155, image_url: 'https://i.pinimg.com/1200x/08/1f/7a/081f7a10432a24d7d4916096a4398b64.jpg', brands: { name: 'Suzuki' } },
          '5': { model_name: 'Rocketman 250', engine_size: 250, image_url: 'https://i.pinimg.com/736x/e7/d4/13/e7d4131046a2749101f0696389bc2cbc.jpg', brands: { name: 'Vento' } },
          '6': { model_name: 'Dominar 400', engine_size: 373, image_url: 'https://i.pinimg.com/736x/f6/ac/10/f6ac10c2bd5e116bdfb4e4eac1f23009.jpg', brands: { name: 'Bajaj' } },
          '7': { model_name: 'MT-03', engine_size: 321, image_url: 'https://i.pinimg.com/736x/4c/87/de/4c87de03dfa66d3b2e2e8dc3e8d39ec0.jpg', brands: { name: 'Yamaha' } },
          '8': { model_name: 'XR 150L', engine_size: 150, image_url: 'https://i.pinimg.com/736x/dc/56/d4/dc56d4c8e82e3b15be69d2e6eb0ab7e1.jpg', brands: { name: 'Honda' } },
        };
        const moto = mockModels[id] || mockModels['1'];

        // Simulated specific prices
        let basicPrice = 500, fullPrice = 900;
        if (moto.model_name === 'Pulsar NS 200') { basicPrice = 450; fullPrice = 850; }
        else if (moto.model_name === 'FZ-S 3.0') { basicPrice = 400; fullPrice = 750; }
        else if (moto.model_name === 'CBR 250R') { basicPrice = 600; fullPrice = 1100; }
        else if (moto.model_name === 'Gixxer SF') { basicPrice = 420; fullPrice = 800; }
        else if (moto.model_name === 'Rocketman 250') { basicPrice = 380; fullPrice = 700; }

        setData({
          motorcycle: moto,
          services: [
            { price: basicPrice, services: { name: 'Afinación Básica', description: 'Cambio de aceite, bujía y revisión de frenos.' } },
            { price: fullPrice, services: { name: 'Afinación Completa', description: 'Aceite sintético, bujía iridio, filtro de aire y carburación completa.' } },
            { price: 100, services: { name: 'Chequeo General', description: 'Revisión de 15 puntos de seguridad del vehículo.' } },
          ]
        });
      }
    };

    fetchDetails();
  }, [id]);

  const handleBookService = (serviceName, servicePrice) => {
    const params = new URLSearchParams({
      motoId: id,
      motoName: data.motorcycle.model_name,
      engineSize: data.motorcycle.engine_size,
      serviceName,
      servicePrice
    });
    navigate(`/agendar?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  const brandName = data.motorcycle.brands?.name || 'Desconocida';
  const brandColor = data.motorcycle.accent_color || getBrandColor(brandName);

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
                <div key={index} className="service-item" style={{ cursor: 'pointer' }} onClick={() => handleBookService(item.services.name, item.price)}>
                  <div className="service-info">
                    <h3>{item.services.name}</h3>
                    <p>{item.services.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="service-price">${item.price}</div>
                    <button className="btn-agendar" onClick={(e) => { e.stopPropagation(); handleBookService(item.services.name, item.price); }}>
                      <CalendarDays size={14} /> Agendar
                    </button>
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
