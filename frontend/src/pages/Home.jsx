import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MotorcycleCard from '../components/MotorcycleCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const BRANDS = ['todos', 'bajaj', 'yamaha', 'honda', 'suzuki', 'vento', 'italika', 'kawasaki', 'cfmoto'];

const Home = () => {
  const navigate = useNavigate();
  const [motorcycles, setMotorcycles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('todos');

  useEffect(() => {
    const fetchMotorcycles = async () => {
      try {
        const response = await axios.get(`${API_URL}/motorcycles`);
        setMotorcycles(response.data);
        setFiltered(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching motorcycles:', err);
        setError('No se pudieron cargar las motos del servidor. Mostrando datos de prueba.');
        setLoading(false);
        
        const mockData = [
          { id: '1', model_name: 'Pulsar NS 200', engine_size: 200, image_url: 'https://i.pinimg.com/736x/5b/18/1a/5b181a25efdaf80f54ce4f7fe7afe360.jpg', brands: { name: 'Bajaj' } },
          { id: '2', model_name: 'FZ-S 3.0', engine_size: 149, image_url: 'https://i.pinimg.com/736x/3a/ae/72/3aae72a46bf043cad52e85030e2e96a4.jpg', brands: { name: 'Yamaha' } },
          { id: '3', model_name: 'CBR 250R', engine_size: 250, image_url: 'https://i.pinimg.com/736x/db/5b/9e/db5b9ea4956d501492f0f0e237461dfb.jpg', brands: { name: 'Honda' } },
          { id: '4', model_name: 'Gixxer SF', engine_size: 155, image_url: 'https://i.pinimg.com/1200x/08/1f/7a/081f7a10432a24d7d4916096a4398b64.jpg', brands: { name: 'Suzuki' } },
          { id: '5', model_name: 'Rocketman 250', engine_size: 250, image_url: 'https://i.pinimg.com/736x/e7/d4/13/e7d4131046a2749101f0696389bc2cbc.jpg', brands: { name: 'Vento' } },
          { id: '6', model_name: 'Dominar 400', engine_size: 373, image_url: 'https://i.pinimg.com/736x/f6/ac/10/f6ac10c2bd5e116bdfb4e4eac1f23009.jpg', brands: { name: 'Bajaj' } },
          { id: '7', model_name: 'MT-03', engine_size: 321, image_url: 'https://i.pinimg.com/736x/4c/87/de/4c87de03dfa66d3b2e2e8dc3e8d39ec0.jpg', brands: { name: 'Yamaha' } },
          { id: '8', model_name: 'XR 150L', engine_size: 150, image_url: 'https://i.pinimg.com/736x/dc/56/d4/dc56d4c8e82e3b15be69d2e6eb0ab7e1.jpg', brands: { name: 'Honda' } },
        ];
        setMotorcycles(mockData);
        setFiltered(mockData);
      }
    };

    fetchMotorcycles();
  }, []);

  // Filtrar por búsqueda y marca
  useEffect(() => {
    let result = motorcycles;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.model_name.toLowerCase().includes(q) || String(m.engine_size).includes(q)
      );
    }
    if (brandFilter !== 'todos') {
      result = result.filter(m =>
        m.brands?.name?.toLowerCase().includes(brandFilter)
      );
    }
    setFiltered(result);
  }, [search, brandFilter, motorcycles]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header de página estilo Kanto */}
      <div className="page-header">
        <h1 className="page-title">
          Catálogo <span>MotoServ</span>
        </h1>
        <p className="page-subtitle">
          {motorcycles.length} modelos disponibles · {filtered.length} mostrados
        </p>
      </div>

      {/* Buscador */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        <div className="search-wrapper" style={{ width: '100%', marginBottom: 0 }}>
          <span className="search-icon">Buscar:</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por modelo o cilindraje..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>X</button>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate('/agendar-manual')}
            className="btn-back"
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              fontFamily: 'Oswald',
              fontSize: '13px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              padding: '8px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              letterSpacing: '0.5px'
            }}
          >
            ¿No encuentras tu moto?
          </button>
        </div>
      </div>

      {/* Filtros de marca (como los tipos de Pokémon) */}
      <div className="brand-scroll">
        {BRANDS.map(brand => (
          <button
            key={brand}
            className={`brand-btn ${brandFilter === brand ? 'active' : ''}`}
            data-brand={brand !== 'todos' ? brand : undefined}
            onClick={() => setBrandFilter(brand)}
          >
            {brand === 'todos' ? 'Todos' : brand.charAt(0).toUpperCase() + brand.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Grid de tarjetas */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No se encontraron motocicletas con ese criterio.</p>
          <button className="btn-back" onClick={() => { setSearch(''); setBrandFilter('todos'); }}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="motorcycle-grid">
          {filtered.map((moto, i) => (
            <MotorcycleCard key={moto.id} moto={moto} delay={i * 30} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
