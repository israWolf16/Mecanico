import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarDays, Phone, User, FileText, ArrowLeft, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AppointmentForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const motoId = searchParams.get('motoId');
  const motoName = searchParams.get('motoName') || '';
  const engineSize = searchParams.get('engineSize') || '';
  const serviceName = searchParams.get('serviceName') || '';
  const servicePrice = searchParams.get('servicePrice') || '';

  const [form, setForm] = useState({ client_name: '', client_phone: '', observations: '', appointment_date: '', appointment_time: '' });
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

  // Generate time slots from 9:00 to 17:00 (last slot at 17:00, end at 18:00)
  const timeSlots = [];
  for (let h = 9; h <= 17; h++) {
    timeSlots.push(`${String(h).padStart(2,'0')}:00`);
    if (h < 17) timeSlots.push(`${String(h).padStart(2,'0')}:30`);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (isDateBlocked(form.appointment_date)) {
      setError('Ese día no está disponible. Por favor elige otro.');
      return;
    }
    try {
      await axios.post(`${API_URL}/appointments`, {
        motorcycle_id: motoId,
        service_name: serviceName,
        service_price: parseFloat(servicePrice),
        ...form
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
          <p style={{ color: '#666', marginBottom: '24px' }}>Tu cita para <strong>{serviceName}</strong> en tu <strong>{motoName}</strong> ha sido registrada exitosamente. Te contactaremos por WhatsApp para confirmar.</p>
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
        <h2 style={{ fontFamily: 'Oswald', textTransform: 'uppercase', marginBottom: '24px', fontSize: '22px' }}>
          <CalendarDays size={22} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Agendar Cita
        </h2>

        {/* Pre-loaded data */}
        <div className="appointment-preloaded">
          <div className="preloaded-item">
            <span className="preloaded-label">Modelo</span>
            <span className="preloaded-value">{motoName} — {engineSize}cc</span>
          </div>
          <div className="preloaded-item">
            <span className="preloaded-label">Servicio</span>
            <span className="preloaded-value">{serviceName} — ${servicePrice}</span>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label"><User size={14} /> Nombre completo</label>
            <input type="text" className="search-input" style={{ paddingLeft: '16px' }} value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} required />
          </div>

          <div className="form-group">
            <label className="form-label"><Phone size={14} /> Teléfono (WhatsApp)</label>
            <input type="tel" className="search-input" style={{ paddingLeft: '16px' }} placeholder="Ej: 5512345678" value={form.client_phone} onChange={e => setForm({...form, client_phone: e.target.value})} required />
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

export default AppointmentForm;
