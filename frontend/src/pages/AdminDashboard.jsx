import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Plus, Edit3, Search } from 'lucide-react';
import AdminCalendar from './AdminCalendar';
import AdminFinances from './AdminFinances';
import EditMotoModal from '../components/EditMotoModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [motorcycles, setMotorcycles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('catalogo');

  // Form states
  const [newMoto, setNewMoto] = useState({ brand_id: '', model_name: '', engine_size: '', image_url: '' });
  const [newServicePrice, setNewServicePrice] = useState({ motorcycle_ids: [], service_id: '', price: '' });
  const [brandSearch, setBrandSearch] = useState('');
  const [editingMoto, setEditingMoto] = useState(null);

  // Search states
  const [motoTableSearch, setMotoTableSearch] = useState('');
  const [serviceMotoSearch, setServiceMotoSearch] = useState('');

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
      setLoading(false);
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
      setBrandSearch('');
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
      alert('Servicio asignado/actualizado correctamente');
      setNewServicePrice({ motorcycle_ids: [], service_id: '', price: '' });
    } catch (error) {
      console.error(error);
      alert('Error al asignar precio');
    }
  };

  // Filtered brands for searchable select
  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Filtered motos for the table
  const filteredMotosTable = motorcycles.filter(m => {
    if (!motoTableSearch.trim()) return true;
    const q = motoTableSearch.toLowerCase();
    return m.model_name.toLowerCase().includes(q) || String(m.engine_size).includes(q) || (m.brands?.name || '').toLowerCase().includes(q);
  });

  // Filtered motos for service price dropdown
  const filteredMotosService = motorcycles.filter(m => {
    if (!serviceMotoSearch.trim()) return true;
    const q = serviceMotoSearch.toLowerCase();
    return m.model_name.toLowerCase().includes(q) || String(m.engine_size).includes(q);
  });

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Oswald', textTransform: 'uppercase' }}>Panel de Administración</h1>
        <button onClick={handleLogout} className="btn-back">Cerrar Sesión</button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'catalogo' ? 'active' : ''}`} onClick={() => setActiveTab('catalogo')}>
          Catálogo
        </button>
        <button className={`admin-tab ${activeTab === 'calendario' ? 'active' : ''}`} onClick={() => setActiveTab('calendario')}>
          Calendario
        </button>
        <button className={`admin-tab ${activeTab === 'finanzas' ? 'active' : ''}`} onClick={() => setActiveTab('finanzas')}>
          Finanzas
        </button>
      </div>

      {activeTab === 'catalogo' ? (
        <>
          <div className="admin-grid-top" style={{ gap: '40px' }}>
            {/* Formulario Agregar Moto */}
            <div className="moto-showcase" style={{ textAlign: 'left', padding: '24px' }}>
              <h2 style={{ fontFamily: 'Oswald', marginBottom: '20px' }}><Plus size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Agregar Nueva Moto</h2>
              <form onSubmit={handleAddMoto} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Searchable brand select */}
                <div className="form-group">
                  <label className="form-label"><Search size={14} /> Marca</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="search-input"
                      style={{ paddingLeft: '16px' }}
                      placeholder="Buscar marca..."
                      value={brandSearch}
                      onChange={e => { setBrandSearch(e.target.value); setNewMoto({...newMoto, brand_id: ''}); }}
                    />
                    {brandSearch && !newMoto.brand_id && filteredBrands.length > 0 && (
                      <div className="brand-dropdown">
                        {filteredBrands.map(b => (
                          <div key={b.id} className="brand-dropdown-item" onClick={() => { setNewMoto({...newMoto, brand_id: b.id}); setBrandSearch(b.name); }}>
                            {b.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <input type="text" placeholder="Nombre del Modelo" className="search-input" style={{ paddingLeft: '16px' }} value={newMoto.model_name} onChange={e => setNewMoto({...newMoto, model_name: e.target.value})} required />
                <input type="number" placeholder="Cilindraje (CC)" className="search-input" style={{ paddingLeft: '16px' }} value={newMoto.engine_size} onChange={e => setNewMoto({...newMoto, engine_size: e.target.value})} required />
                <input type="url" placeholder="URL de la imagen" className="search-input" style={{ paddingLeft: '16px' }} value={newMoto.image_url} onChange={e => setNewMoto({...newMoto, image_url: e.target.value})} required />
                <button type="submit" className="btn-back" style={{ background: 'var(--color-primary)', color: 'white' }}>Agregar Moto</button>
              </form>
            </div>

            {/* Formulario Asignar Precio a Servicio */}
            <div className="moto-showcase" style={{ textAlign: 'left', padding: '24px' }}>
              <h2 style={{ fontFamily: 'Oswald', marginBottom: '20px' }}><Plus size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Asignar Nuevo Servicio</h2>
              <form onSubmit={handleAddServicePrice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Buscador + selector de moto */}
                <div className="form-group">
                  <label className="form-label"><Search size={14} /> Buscar moto</label>
                  <input
                    type="text"
                    className="search-input"
                    style={{ paddingLeft: '16px', marginBottom: '8px' }}
                    placeholder="Filtrar por modelo..."
                    value={serviceMotoSearch}
                    onChange={e => setServiceMotoSearch(e.target.value)}
                  />
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <button 
                      type="button"
                      onClick={() => {
                        const newIds = [...new Set([...newServicePrice.motorcycle_ids, ...filteredMotosService.map(m => m.id)])];
                        setNewServicePrice({...newServicePrice, motorcycle_ids: newIds});
                      }}
                      className="btn-back" style={{ fontSize: '11px', padding: '4px 8px' }}
                    >Seleccionar Todas</button>
                    <button 
                      type="button"
                      onClick={() => setNewServicePrice({...newServicePrice, motorcycle_ids: []})}
                      className="btn-back" style={{ fontSize: '11px', padding: '4px 8px' }}
                    >Deseleccionar</button>
                  </div>
                  
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '8px', backgroundColor: '#f9fafb' }}>
                    {filteredMotosService.length === 0 ? (
                      <div style={{ color: '#999', fontSize: '12px', textAlign: 'center', padding: '10px' }}>No hay motos que coincidan</div>
                    ) : (
                      filteredMotosService.map(m => (
                        <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                          <input 
                            type="checkbox" 
                            checked={newServicePrice.motorcycle_ids.includes(m.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setNewServicePrice(prev => {
                                const ids = prev.motorcycle_ids;
                                if (checked) {
                                  return { ...prev, motorcycle_ids: [...ids, m.id] };
                                } else {
                                  return { ...prev, motorcycle_ids: ids.filter(id => id !== m.id) };
                                }
                              });
                            }}
                          />
                          {m.model_name} ({m.engine_size}cc)
                        </label>
                      ))
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    Motos Seleccionadas: {newServicePrice.motorcycle_ids.length}
                  </div>
                </div>
                <select className="search-input" style={{ paddingLeft: '16px' }} value={newServicePrice.service_id} onChange={e => setNewServicePrice({...newServicePrice, service_id: e.target.value})} required>
                  <option value="">Selecciona un Servicio</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="number" placeholder="Precio ($)" className="search-input" style={{ paddingLeft: '16px' }} value={newServicePrice.price} onChange={e => setNewServicePrice({...newServicePrice, price: e.target.value})} required />
                <button type="submit" className="btn-back" style={{ background: 'var(--color-primary)', color: 'white' }}>Asignar Precio</button>
              </form>
            </div>
          </div>

          {/* Motos Registradas con buscador */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '60px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontFamily: 'Oswald' }}>Motos Registradas</h2>
            <div style={{ position: 'relative', minWidth: '250px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input
                type="text"
                className="search-input"
                style={{ paddingLeft: '36px', width: '100%' }}
                placeholder="Buscar moto registrada..."
                value={motoTableSearch}
                onChange={e => setMotoTableSearch(e.target.value)}
              />
            </div>
          </div>
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
                {filteredMotosTable.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: '#999' }}>No se encontraron motos</td></tr>
                ) : (
                  filteredMotosTable.map(moto => (
                    <tr key={moto.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '16px' }}>{moto.model_name}</td>
                      <td style={{ padding: '16px' }}>{moto.engine_size} cc</td>
                      <td style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                        <button onClick={() => setEditingMoto(moto)} style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}>
                          <Edit3 size={20} />
                        </button>
                        <button onClick={() => handleDeleteMoto(moto.id)} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : activeTab === 'calendario' ? (
        <AdminCalendar />
      ) : (
        <AdminFinances />
      )}

      {/* Edit Modal */}
      {editingMoto && (
        <EditMotoModal
          moto={editingMoto}
          services={services}
          onClose={() => setEditingMoto(null)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
