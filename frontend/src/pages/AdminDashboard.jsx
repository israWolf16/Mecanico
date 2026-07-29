import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [motorcycles, setMotorcycles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newMoto, setNewMoto] = useState({ brand_id: '', model_name: '', engine_size: '', image_url: '' });
  const [newServicePrice, setNewServicePrice] = useState({ motorcycle_id: '', service_id: '', price: '' });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [motosRes, brandsRes, servicesRes] = await Promise.all([
        axios.get(`${API_URL}/motorcycles`),
        axios.get(`${API_URL}/brands`),
        axios.get(`${API_URL}/services`)
      ]);
      setMotorcycles(motosRes.data);
      setBrands(brandsRes.data);
      setServices(servicesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      if (error.response && error.response.status === 403) {
        navigate('/login');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const handleAddMoto = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_URL}/motorcycles`, newMoto, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Moto agregada correctamente');
      setNewMoto({ brand_id: '', model_name: '', engine_size: '', image_url: '' });
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error al agregar moto');
    }
  };

  const handleDeleteMoto = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta moto?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/motorcycles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Moto eliminada');
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar moto');
    }
  };

  const handleAddServicePrice = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_URL}/motorcycle-services`, newServicePrice, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Precio de servicio asignado/actualizado');
      setNewServicePrice({ motorcycle_id: '', service_id: '', price: '' });
    } catch (error) {
      console.error(error);
      alert('Error al asignar precio');
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'Oswald', textTransform: 'uppercase' }}>Panel de Administración</h1>
        <button onClick={handleLogout} className="btn-back">Cerrar Sesión</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Formulario Agregar Moto */}
        <div className="moto-showcase" style={{ textAlign: 'left', padding: '24px' }}>
          <h2 style={{ fontFamily: 'Oswald', marginBottom: '20px' }}><Plus size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Agregar Nueva Moto</h2>
          <form onSubmit={handleAddMoto} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <select className="search-input" style={{ paddingLeft: '16px' }} value={newMoto.brand_id} onChange={e => setNewMoto({...newMoto, brand_id: e.target.value})} required>
              <option value="">Selecciona una Marca</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <input type="text" placeholder="Nombre del Modelo" className="search-input" style={{ paddingLeft: '16px' }} value={newMoto.model_name} onChange={e => setNewMoto({...newMoto, model_name: e.target.value})} required />
            <input type="number" placeholder="Cilindraje (CC)" className="search-input" style={{ paddingLeft: '16px' }} value={newMoto.engine_size} onChange={e => setNewMoto({...newMoto, engine_size: e.target.value})} required />
            <input type="url" placeholder="URL de la imagen" className="search-input" style={{ paddingLeft: '16px' }} value={newMoto.image_url} onChange={e => setNewMoto({...newMoto, image_url: e.target.value})} required />
            <button type="submit" className="btn-back" style={{ background: 'var(--color-primary)', color: 'white' }}>Agregar Moto</button>
          </form>
        </div>

        {/* Formulario Asignar Precio a Servicio */}
        <div className="moto-showcase" style={{ textAlign: 'left', padding: '24px' }}>
          <h2 style={{ fontFamily: 'Oswald', marginBottom: '20px' }}><Plus size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Asignar Precio a Servicio</h2>
          <form onSubmit={handleAddServicePrice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <select className="search-input" style={{ paddingLeft: '16px' }} value={newServicePrice.motorcycle_id} onChange={e => setNewServicePrice({...newServicePrice, motorcycle_id: e.target.value})} required>
              <option value="">Selecciona una Moto</option>
              {motorcycles.map(m => <option key={m.id} value={m.id}>{m.model_name}</option>)}
            </select>
            <select className="search-input" style={{ paddingLeft: '16px' }} value={newServicePrice.service_id} onChange={e => setNewServicePrice({...newServicePrice, service_id: e.target.value})} required>
              <option value="">Selecciona un Servicio</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="number" placeholder="Precio ($)" className="search-input" style={{ paddingLeft: '16px' }} value={newServicePrice.price} onChange={e => setNewServicePrice({...newServicePrice, price: e.target.value})} required />
            <button type="submit" className="btn-back" style={{ background: 'var(--color-primary)', color: 'white' }}>Asignar Precio</button>
          </form>
        </div>
      </div>

      <h2 style={{ fontFamily: 'Oswald', marginTop: '60px', marginBottom: '20px' }}>Motos Registradas</h2>
      <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--color-surface-2)', borderBottom: '2px solid var(--color-border)' }}>
            <tr>
              <th style={{ padding: '16px' }}>Modelo</th>
              <th style={{ padding: '16px' }}>Cilindraje</th>
              <th style={{ padding: '16px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {motorcycles.map(moto => (
              <tr key={moto.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px' }}>{moto.model_name}</td>
                <td style={{ padding: '16px' }}>{moto.engine_size} cc</td>
                <td style={{ padding: '16px' }}>
                  <button onClick={() => handleDeleteMoto(moto.id)} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
