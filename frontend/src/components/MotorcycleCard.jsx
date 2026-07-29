import { useNavigate } from 'react-router-dom';

// Colores por marca (equivalente a TYPE_COLORS del PokemonCard)
const BRAND_COLORS = {
  bajaj:    '#00a19b',
  yamaha:   '#0039a6',
  honda:    '#e60012',
  suzuki:   '#005ca9',
  vento:    '#ff6f00',
  italika:  '#d4145a',
  kawasaki: '#6dc066',
};

const getBrandColor = (brandName) => {
  const name = brandName?.toLowerCase() || '';
  for (const [key, color] of Object.entries(BRAND_COLORS)) {
    if (name.includes(key)) return color;
  }
  return '#e60012';
};

const MotorcycleCard = ({ moto, delay = 0 }) => {
  const navigate = useNavigate();
  const brandName = moto.brands?.name || 'Desconocida';
  const brandColor = getBrandColor(brandName);
  const ccPercent = Math.min(100, (moto.engine_size / 400) * 100);

  return (
    <div
      className="moto-card"
      style={{
        '--brand-color': brandColor,
        animationDelay: `${delay}ms`
      }}
      onClick={() => navigate(`/moto/${moto.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/moto/${moto.id}`)}
      aria-label={`Ver servicios de ${moto.model_name}`}
    >
      {/* Fondo decorativo circular (como PokemonCard) */}
      <div className="card-bg-circle"></div>

      {/* Número / Cilindraje */}
      <span className="card-num">#{moto.engine_size}cc</span>

      {/* Imagen de la moto */}
      <div className="card-sprite-wrap">
        <img
          src={moto.image_url}
          alt={moto.model_name}
          className="card-sprite"
          loading="lazy"
        />
      </div>

      {/* Nombre */}
      <h3 className="card-name">{moto.model_name}</h3>

      {/* Badge de marca (como los tipos de Pokémon) */}
      <div className="card-types">
        <span className="type-badge" style={{ background: brandColor }}>
          {brandName}
        </span>
      </div>

      {/* Stats mini (barras como HP y ATK) */}
      <div className="card-stats-mini">
        <div className="stat-mini">
          <span className="stat-mini-label">CC</span>
          <div className="stat-mini-bar">
            <div className="stat-mini-fill" style={{ width: `${ccPercent}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorcycleCard;
