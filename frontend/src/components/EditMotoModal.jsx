import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const EditMotoModal = ({ moto, services, onClose, onSaved }) => {
  const [form, setForm] = useState({
    model_name: moto.model_name || '',
    engine_size: moto.engine_size || '',
    image_url: moto.image_url || '',
    accent_color: moto.accent_color || '#E60012'
  });
  const [servicePrices, setServicePrices] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch current service prices for this moto
    const fetchPrices = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API_URL}/motorcycles/${moto.id}/services`);
        const currentPrices = res.data.services || [];
        // Map services to include current prices
        const mapped = services.map(s => {
          const existing = currentPrices.find(cp => cp.services?.id === s.id);
          return { service_id: s.id, name: s.name, price: existing ? existing.price : '' };
        });
        setServicePrices(mapped);
      } catch (e) {
        // If we can't fetch, just show empty prices
        setServicePrices(services.map(s => ({ service_id: s.id, name: s.name, price: '' })));
      }
    };
    fetchPrices();
  }, [moto.id, services]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Update moto details
      await axios.patch(`${API_URL}/motorcycles/${moto.id}`, form, { headers });

      // Update service prices
      for (const sp of servicePrices) {
        if (sp.price !== '' && sp.price !== null) {
          await axios.post(`${API_URL}/motorcycle-services`, {
            motorcycle_id: moto.id,
            service_id: sp.service_id,
            price: parseFloat(sp.price)
          }, { headers });
        }
      }

      alert('Moto actualizada correctamente');
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const updateServicePrice = (index, price) => {
    const updated = [...servicePrices];
    updated[index].price = price;
    setServicePrices(updated);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontFamily: 'Oswald', textTransform: 'uppercase' }}>Editar Moto</h2>
          <button onClick={onClose} className="modal-close"><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Nombre del Modelo</label>
            <input type="text" className="search-input" style={{ paddingLeft: '16px' }} value={form.model_name} onChange={e => setForm({...form, model_name: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Cilindraje (CC)</label>
              <input type="number" className="search-input" style={{ paddingLeft: '16px' }} value={form.engine_size} onChange={e => setForm({...form, engine_size: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Color de Acento</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="color" value={form.accent_color} onChange={e => setForm({...form, accent_color: e.target.value})} style={{ width: '48px', height: '40px', border: 'none', cursor: 'pointer', borderRadius: '8px' }} />
                <span style={{ fontSize: '14px', color: '#666' }}>{form.accent_color}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">URL de Imagen</label>
            <input type="url" className="search-input" style={{ paddingLeft: '16px' }} value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
          </div>

          {form.image_url && (
            <div style={{ textAlign: 'center', margin: '12px 0' }}>
              <img src={form.image_url} alt="Preview" style={{ maxHeight: '120px', objectFit: 'contain', borderRadius: '8px' }} />
            </div>
          )}

          <h3 style={{ fontFamily: 'Oswald', marginTop: '20px', marginBottom: '12px' }}>Precios de Servicios</h3>
          {servicePrices.map((sp, i) => (
            <div key={sp.service_id} className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ flex: 1, fontWeight: 600, fontSize: '14px' }}>{sp.name}</label>
              <div style={{ position: 'relative', width: '120px' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontWeight: 700 }}>$</span>
                <input type="number" className="search-input" style={{ paddingLeft: '28px', width: '100%' }} value={sp.price} onChange={e => updateServicePrice(i, e.target.value)} placeholder="0" />
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-back">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="btn-back" style={{ background: 'var(--color-primary)', color: 'white' }}>
            <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMotoModal;
