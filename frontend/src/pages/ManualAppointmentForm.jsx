import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarDays, Phone, User, FileText, ArrowLeft, CheckCircle, Palette, Fuel, Bike, Image, Gauge } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const COLORES = [
  'Roja', 'Negra', 'Blanca', 'Azul', 'Gris', 'Amarilla', 'Verde', 'Naranja', 'Morada', 'Rosa', 'Plateada', 'Dorada'
];

const SERVICIOS_MANUAL = [
  { name: 'Afinación Básica', price: 400 },
  { name: 'Afinación Completa', price: 800 },
  { name: 'Chequeo General', price: 100 },
];

const ManualAppointmentForm = () => {
  const navigate = useNavigate();

  const [motoInfo, setMotoInfo] = useState({ brand: '', model_name: '', engine_size: '', image_url: '' });
  const [selectedService, setSelectedService] = useState('');
  const [form, setForm] = useState({ client_name: '', client_phone: '', observations: '', appointment_date: '', appointment_time: '' });
  const [color1, setColor1] = useState('');
  const [color2, setColor2] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [blockedDates, setBlockedDates] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/blocked-dates`).then(r => setBlockedDates(r.data.map(d => d.blocked_date))).catch(() => {});
  }, []);

  const formatLocalYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const minDate = formatLocalYYYYMMDD(today);
  const maxDate = formatLocalYYYYMMDD(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000));

  const isDateBlocked = (dateStr) => blockedDates.includes(dateStr);

  const timeSlots = [];
  for (let h = 9; h <= 17; h++) {
    timeSlots.push(`${String(h).padStart(2,'0')}:00`);
    if (h < 17) timeSlots.push(`${String(h).padStart(2,'0')}:30`);
  }

  const getServiceObj = () => SERVICIOS_MANUAL.find(s => s.name === selectedService);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!motoInfo.brand.trim() || !motoInfo.model_name.trim() || !motoInfo.engine_size) {
      setError('Por favor llena los datos de tu moto (Marca, Modelo y Cilindraje).');
      return;
    }
    if (!selectedService) {
      setError('Selecciona un servicio.');
      return;
    }
    if (!color1) {
      setError('Por favor selecciona al menos un color de tu moto.');
      return;
    }
    if (!fuelType) {
      setError('Por favor indica si tu moto es carburada o de inyección.');
      return;
    }
    if (isDateBlocked(form.appointment_date)) {
      setError('Ese día no está disponible. Por favor elige otro.');
      return;
    }

    const motoColor = color2 ? `${color1} con ${color2}` : color1;
    const svc = getServiceObj();
    const fullPhone = form.client_phone.replace(/\D/g, '');
    const phoneWith52 = fullPhone.startsWith('52') ? fullPhone : '52' + fullPhone;

    // Add observation with manual moto info
    const motoDesc = `[MOTO MANUAL] ${motoInfo.brand} ${motoInfo.model_name} ${motoInfo.engine_size}cc${motoInfo.image_url ? ' | Img: ' + motoInfo.image_url : ''}`;
    const fullObservations = motoDesc + (form.observations ? '\n' + form.observations : '');

    try {
      await axios.post(`${API_URL}/appointments`, {
        motorcycle_id: null,
        service_name: svc.name,
        service_price: svc.price,
        moto_color: motoColor,
        fuel_type: fuelType,
        client_name: form.client_name,
        client_phone: phoneWith52,
        observations: fullObservations,
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time
      });
      setSubmitted(true);
    } catch (err) {
      setError('Error al agendar la cita. Intenta nuevamente.');
    }
  };

  if (submitted) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="moto-showcase" style={{ maxWidth: '500px', width: '100%', padding: '40px 30px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <CheckCircle size={64} color="#22c55e" />
          </div>
          <h2 style={{ fontFamily: 'Oswald', textTransform: 'uppercase', marginBottom: '16px', fontSize: '24px', color: '#22c55e' }}>¡Cita Agendada!</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>Tu cita para <strong>{selectedService}</strong> en tu <strong>{motoInfo.brand} {motoInfo.model_name}</strong> ha sido registrada exitosamente. Te contactaremos por WhatsApp para confirmar.</p>
          <button className="btn-back" onClick={() => navigate('/')} style={{ margin: '0 auto' }}>
            <ArrowLeft size={16} /> Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '600px', padding: '40px 20px' }}>
      <button className="btn-back" onClick={() => navigate(-1)} style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="moto-showcase" style={{ textAlign: 'left', padding: '30px' }}>
        <h2 style={{ fontFamily: 'Oswald', textTransform: 'uppercase', marginBottom: '8px', fontSize: '22px' }}>
          <CalendarDays size={22} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Agendar Cita Manual
        </h2>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Llena los datos de tu moto manualmente para agendar tu cita.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sección datos de la moto */}
          <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #eee' }}>
            <h3 style={{ fontFamily: 'Oswald', fontSize: '16px', marginBottom: '12px', textTransform: 'uppercase', color: 'var(--color-primary)' }}>🏍️ Datos de tu moto</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label"><Bike size={14} /> Marca</label>
                <input type="text" className="search-input" style={{ paddingLeft: '16px' }} placeholder="Ej: Yamaha, Honda, Bajaj..." value={motoInfo.brand} onChange={e => setMotoInfo({...motoInfo, brand: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre del Modelo</label>
                <input type="text" className="search-input" style={{ paddingLeft: '16px' }} placeholder="Ej: FZ-S 3.0, Pulsar NS 200..." value={motoInfo.model_name} onChange={e => setMotoInfo({...motoInfo, model_name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label"><Gauge size={14} /> Cilindraje (CC)</label>
                <input type="number" className="search-input" style={{ paddingLeft: '16px' }} placeholder="Ej: 150, 200, 250..." value={motoInfo.engine_size} onChange={e => setMotoInfo({...motoInfo, engine_size: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label"><Image size={14} /> URL de la imagen (opcional)</label>
                <input type="url" className="search-input" style={{ paddingLeft: '16px' }} placeholder="https://ejemplo.com/mi-moto.jpg" value={motoInfo.image_url} onChange={e => setMotoInfo({...motoInfo, image_url: e.target.value})} />
                <span style={{ fontSize: '11px', color: '#999', marginTop: '4px', display: 'block' }}>Debe ser un enlace directo a una imagen (.jpg, .png, .jpeg, .webp)</span>
              </div>
              {motoInfo.image_url && (
                <div style={{ textAlign: 'center' }}>
                  <img src={motoInfo.image_url} alt="Preview" style={{ maxHeight: '100px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #ddd' }} onError={e => e.target.style.display = 'none'} />
                </div>
              )}
            </div>
          </div>

          {/* Servicio */}
          <div className="form-group">
            <label className="form-label">Servicio</label>
            <select className="search-input" style={{ paddingLeft: '16px' }} value={selectedService} onChange={e => setSelectedService(e.target.value)} required>
              <option value="">Selecciona un servicio</option>
              {SERVICIOS_MANUAL.map(s => <option key={s.name} value={s.name}>{s.name} — ${s.price}</option>)}
            </select>
          </div>

          {/* Datos del cliente */}
          <div className="form-group">
            <label className="form-label"><User size={14} /> Nombre completo</label>
            <input type="text" className="search-input" style={{ paddingLeft: '16px' }} value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} required />
          </div>

          <div className="form-group">
            <label className="form-label"><Phone size={14} /> Teléfono (WhatsApp)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              <span style={{ background: '#f3f4f6', border: '1px solid #ddd', borderRight: 'none', borderRadius: '8px 0 0 8px', padding: '10px 12px', fontWeight: 700, color: '#555', fontSize: '14px', whiteSpace: 'nowrap' }}>+52</span>
              <input type="tel" className="search-input" style={{ paddingLeft: '12px', borderRadius: '0 8px 8px 0', flex: 1 }} placeholder="Ej: 2202835590" value={form.client_phone} onChange={e => setForm({...form, client_phone: e.target.value})} required />
            </div>
          </div>

          {/* Color de la moto */}
          <div className="form-group">
            <label className="form-label"><Palette size={14} /> Color de la moto</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#999', marginBottom: '4px', display: 'block' }}>Color principal *</label>
                <select className="search-input" style={{ paddingLeft: '16px' }} value={color1} onChange={e => setColor1(e.target.value)} required>
                  <option value="">Selecciona</option>
                  {COLORES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#999', marginBottom: '4px', display: 'block' }}>Segundo color (opcional)</label>
                <select className="search-input" style={{ paddingLeft: '16px' }} value={color2} onChange={e => setColor2(e.target.value)}>
                  <option value="">Ninguno</option>
                  {COLORES.filter(c => c !== color1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {color1 && (
              <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                Vista previa: <span style={{ color: 'var(--color-primary)' }}>{color2 ? `${color1} con ${color2}` : color1}</span>
              </div>
            )}
          </div>

          {/* Tipo de combustión */}
          <div className="form-group">
            <label className="form-label"><Fuel size={14} /> Tipo de motor</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: `2px solid ${fuelType === 'Carburada' ? 'var(--color-primary)' : '#ddd'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', backgroundColor: fuelType === 'Carburada' ? 'rgba(230,0,18,0.05)' : '#fff', transition: 'all 0.2s ease' }}>
                <input type="radio" name="fuelType" value="Carburada" checked={fuelType === 'Carburada'} onChange={e => setFuelType(e.target.value)} style={{ display: 'none' }} />
                ⛽ Carburada
              </label>
              <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: `2px solid ${fuelType === 'Inyección Electrónica' ? 'var(--color-primary)' : '#ddd'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', backgroundColor: fuelType === 'Inyección Electrónica' ? 'rgba(230,0,18,0.05)' : '#fff', transition: 'all 0.2s ease' }}>
                <input type="radio" name="fuelType" value="Inyección Electrónica" checked={fuelType === 'Inyección Electrónica'} onChange={e => setFuelType(e.target.value)} style={{ display: 'none' }} />
                💉 Inyección
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><FileText size={14} /> Observaciones</label>
            <textarea className="search-input appointment-textarea" placeholder="Ejemplo: La moto hace un ruido al frenar..." value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label"><CalendarDays size={14} /> Fecha</label>
              <input type="date" className="search-input" style={{ paddingLeft: '16px' }} min={minDate} max={maxDate} value={form.appointment_date} onChange={e => {
                const val = e.target.value;
                if (isDateBlocked(val)) {
                  setError('Ese día está marcado como inhábil. Elige otro.');
                  return;
                }
                setError(null);
                setForm({...form, appointment_date: val});
              }} required />
            </div>

            <div className="form-group">
              <label className="form-label">Hora</label>
              <select className="search-input" style={{ paddingLeft: '16px' }} value={form.appointment_time} onChange={e => setForm({...form, appointment_time: e.target.value})} required>
                <option value="">Selecciona</option>
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary-full">AGENDAR CITA</button>
        </form>
      </div>
    </div>
  );
};

export default ManualAppointmentForm;
