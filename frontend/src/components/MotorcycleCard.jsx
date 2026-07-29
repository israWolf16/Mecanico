import { useNavigate } from 'react-router-dom';

const getBrandColor = (brandName) => {
  const name = brandName?.toLowerCase() || '';
  if (name.includes('yamaha')) return '#0020bb'; // Yamaha Blue
  if (name.includes('honda')) return '#e60012'; // Honda Red
  if (name.includes('suzuki')) return '#005ca9'; // Suzuki Blue
  if (name.includes('vento')) return '#ff6f00'; // Vento Orange
  if (name.includes('bajaj') || name.includes('pulsar')) return '#00a19b'; // Bajaj Teal
  return '#e60012'; // Default red accent (Kanto style)
};

const MotorcycleCard = ({ moto }) => {
  const navigate = useNavigate();
  const brandName = moto.brands?.name || 'Desconocida';
  const brandColor = getBrandColor(brandName);

  return (
    <div 
      className="moto-card animate-fade-in" 
      onClick={() => navigate(`/moto/${moto.id}`)}
      style={{ '--brand-color': brandColor }}
    >
      {/* Barra de color superior (Estilo Pokemon) */}
      <div className="card-brand-bar"></div>
      
      <div className="card-image-container">
        <img 
          src={moto.image_url || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'} 
          alt={moto.model_name} 
          className="moto-image"
        />
        <div className="brand-badge">{brandName}</div>
      </div>
      <div className="card-content">
        <h3 className="moto-name">{moto.model_name}</h3>
        <p className="moto-engine">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>
          {moto.engine_size} cc
        </p>
      </div>
    </div>
  );
};

export default MotorcycleCard;
