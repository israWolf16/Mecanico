import { useNavigate } from 'react-router-dom';

const MotorcycleCard = ({ moto }) => {
  const navigate = useNavigate();

  return (
    <div className="moto-card animate-fade-in" onClick={() => navigate(`/moto/${moto.id}`)}>
      <div className="card-image-container">
        <img 
          src={moto.image_url || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'} 
          alt={moto.model_name} 
          className="moto-image"
        />
        <div className="brand-badge">{moto.brands?.name || 'Desconocida'}</div>
      </div>
      <div className="card-content">
        <h3 className="moto-name">{moto.model_name}</h3>
        <p className="moto-engine">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>
          {moto.engine_size} cc
        </p>
      </div>
    </div>
  );
};

export default MotorcycleCard;
