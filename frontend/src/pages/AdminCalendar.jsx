import { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarDays, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Ban, Plus, Trash2, MessageCircle, Camera, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AdminCalendar = () => {
  const [view, setView] = useState('day'); // 'day' or 'week'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');

  const [notes, setNotes] = useState('');
  const [evidence, setEvidence] = useState('');
  const [partsCost, setPartsCost] = useState('');
  const [totalCharged, setTotalCharged] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchBlockedDates();
  }, [currentDate, view]);

  const formatLocalYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      let url = '';
      if (view === 'day') {
        const dateStr = formatLocalYYYYMMDD(currentDate);
        url = `${API_URL}/appointments?date=${dateStr}`;
      } else {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const startStr = formatLocalYYYYMMDD(startOfWeek);
        const endStr = formatLocalYYYYMMDD(endOfWeek);
        url = `${API_URL}/appointments?start_date=${startStr}&end_date=${endStr}`;
      }
      
      const res = await axios.get(url, { headers });
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBlockedDates = async () => {
    try {
      const res = await axios.get(`${API_URL}/blocked-dates`);
      setBlockedDates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') newDate.setDate(newDate.getDate() + 1);
    else newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') newDate.setDate(newDate.getDate() - 1);
    else newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const addBlockedDate = async () => {
    if (!newBlockDate) return;
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/blocked-dates`, {
        blocked_date: newBlockDate,
        reason: newBlockReason
      }, { headers });
      setNewBlockDate('');
      setNewBlockReason('');
      fetchBlockedDates();
    } catch (err) {
      console.error(err);
      alert('Error al bloquear fecha');
    }
  };

  const removeBlockedDate = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/blocked-dates/${id}`, { headers });
      fetchBlockedDates();
    } catch (err) {
      console.error(err);
    }
  };

  const openApptDetails = (appt) => {
    setSelectedAppt(appt.id === selectedAppt?.id ? null : appt);
    setNotes(appt.mechanic_notes || '');
    setEvidence(appt.evidence_images ? appt.evidence_images.join(', ') : '');
    setPartsCost(appt.parts_cost || '');
    setTotalCharged(appt.total_charged || '');
  };

  const updateAppt = async (statusUpdate = null, issueReason = null, isNote = false) => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      const payload = {
        mechanic_notes: notes,
        evidence_images: evidence.split(',').map(e => e.trim()).filter(e => e),
        parts_cost: partsCost !== '' ? parseFloat(partsCost) : null,
        total_charged: totalCharged !== '' ? parseFloat(totalCharged) : null
      };
      
      if (statusUpdate) {
        payload.status = statusUpdate;
      }
      
      await axios.patch(`${API_URL}/appointments/${selectedAppt.id}`, payload, { headers });
      
      let phone = selectedAppt.client_phone.replace(/\D/g, '');
      if (!phone.startsWith('52')) phone = '52' + phone;
      if (statusUpdate === 'terminada') {
        window.open(`https://wa.me/${phone}?text=Hola! Tu moto ${selectedAppt.motorcycles?.model_name || 'moto'} se encuentra lista, puedes pasar a recogerla. - MotoServ`);
      } else if (statusUpdate === 'inconveniente') {
        window.open(`https://wa.me/${phone}?text=Hola! Hemos encontrado un inconveniente con tu moto ${selectedAppt.motorcycles?.model_name || 'moto'}: ${issueReason}. Por favor contáctanos. - MotoServ`);
      } else if (isNote && notes) {
        window.open(`https://wa.me/${phone}?text=Te adjunto el avance de tu moto ${selectedAppt.motorcycles?.model_name || 'moto'}: ${notes}`);
      }
      
      fetchAppointments();
      setSelectedAppt(null);
    } catch (err) {
      console.error(err);
      alert('Error al actualizar');
    }
  };

  const handleMarkCompleted = () => {
    updateAppt('terminada');
  };

  const handleMarkIssue = () => {
    const reason = prompt('Razón del inconveniente:');
    if (reason) {
      updateAppt('inconveniente', reason);
    }
  };

  const handleSaveNotes = () => {
    updateAppt(null, null, true);
  };

  const handleDeleteAppt = async () => {
    if (!window.confirm('¿Seguro que deseas eliminar esta cita de forma permanente?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/appointments/${selectedAppt.id}`, { headers });
      fetchAppointments();
      setSelectedAppt(null);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la cita');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'terminada': return '#22c55e';
      case 'inconveniente': return '#f97316';
      default: return '#eab308';
    }
  };

  // Helper to get moto info from the joined data
  const parseManualMoto = (appt) => {
    if (appt.motorcycles) return null;
    const obs = appt.observations || '';
    if (!obs.startsWith('[MOTO MANUAL]')) return null;
    const lines = obs.split('\n');
    const match = lines[0].match(/^\[MOTO MANUAL\] (.*?) (\d+)cc(?: \| Img: (.*))?$/);
    if (match) {
      return {
        name: match[1],
        engine: match[2],
        image: match[3] || '',
        brand: 'Manual',
        observations: lines.slice(1).join('\n')
      };
    }
    return null;
  };

  const getMotoName = (appt) => parseManualMoto(appt)?.name || appt.motorcycles?.model_name || 'Moto';
  const getMotoImage = (appt) => parseManualMoto(appt)?.image || appt.motorcycles?.image_url || '';
  const getMotoEngine = (appt) => parseManualMoto(appt)?.engine || appt.motorcycles?.engine_size || '';
  const getMotoBrand = (appt) => parseManualMoto(appt)?.brand || appt.motorcycles?.brands?.name || '';
  const getObservations = (appt) => {
    const manual = parseManualMoto(appt);
    if (manual) return manual.observations || 'Ninguna';
    return appt.observations || 'Ninguna';
  };

  const renderApptCard = (appt) => {
    const isSelected = selectedAppt?.id === appt.id;
    return (
      <div key={appt.id} style={{ marginBottom: '16px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
        <div 
          onClick={() => openApptDetails(appt)}
          style={{ 
            padding: '16px', 
            cursor: 'pointer', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: '#f9fafb'
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{appt.appointment_time} - {appt.client_name}</div>
            <div style={{ color: '#555', fontSize: '14px', marginTop: '4px' }}>
              {appt.service_name} | {getMotoName(appt)} {getMotoEngine(appt) ? `(${getMotoEngine(appt)}cc)` : ''}
            </div>
            <div style={{ color: '#888', fontSize: '13px', marginTop: '2px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {appt.moto_color && <span>⭕ {appt.moto_color}</span>}
              {appt.fuel_type && <span>⛽ {appt.fuel_type}</span>}
            </div>
          </div>
          <div>
            <span style={{ 
              backgroundColor: getStatusColor(appt.status) + '20', 
              color: getStatusColor(appt.status),
              padding: '4px 8px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {appt.status || 'pendiente'}
            </span>
          </div>
        </div>

        {isSelected && (
          <div style={{ padding: '16px', borderTop: '1px solid #ddd', backgroundColor: '#fff' }}>
            {/* Moto image + info */}
            {getMotoImage(appt) && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                <img 
                  src={getMotoImage(appt)} 
                  alt={getMotoName(appt)} 
                  style={{ width: '100px', height: '80px', objectFit: 'contain', borderRadius: '8px' }} 
                />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{getMotoName(appt)}</div>
                  <div style={{ color: '#666', fontSize: '13px' }}>{getMotoBrand(appt)} · {getMotoEngine(appt)}cc</div>
                  {appt.moto_color && <div style={{ color: '#888', fontSize: '13px', marginTop: '2px' }}>⭕ {appt.moto_color}</div>}
                  {appt.fuel_type && <div style={{ color: '#888', fontSize: '13px' }}>⛽ {appt.fuel_type}</div>}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px', fontSize: '14px', color: '#444' }}>
              <p><strong>Teléfono:</strong> {appt.client_phone}</p>
              <p><strong>Servicio:</strong> {appt.service_name} — ${appt.service_price}</p>
              <p><strong>Observaciones:</strong> {getObservations(appt)}</p>
            </div>
            
            {/* Liquidación */}
            <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '15px' }}>
                Liquidación
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <label className="form-label" style={{ color: '#166534' }}>Costo Refacciones (MXN)</label>
                  <input type="number" className="search-input" style={{ width: '100%', borderColor: '#bbf7d0', boxSizing: 'border-box' }} value={partsCost} onChange={e => setPartsCost(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <label className="form-label" style={{ color: '#166534' }}>Cobro Total (MXN)</label>
                  <input type="number" className="search-input" style={{ width: '100%', borderColor: '#bbf7d0', boxSizing: 'border-box' }} value={totalCharged} onChange={e => setTotalCharged(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              
              {(partsCost !== '' && totalCharged !== '') && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #bbf7d0', fontSize: '14px', fontWeight: 'bold' }}>
                  <span style={{ color: '#166534' }}>Ganancia Real: ${(parseFloat(totalCharged) - parseFloat(partsCost)).toFixed(2)}</span>
                  <span style={{ color: parseFloat(partsCost) > 0 ? '#166534' : '#666' }}>
                    Rendimiento: {parseFloat(partsCost) > 0 ? (((parseFloat(totalCharged) - parseFloat(partsCost)) / parseFloat(partsCost)) * 100).toFixed(1) + '%' : 'N/A'}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label"><FileText size={14} /> Notas del Mecánico</label>
              <textarea 
                className="search-input" 
                style={{ minHeight: '80px', padding: '12px', width: '100%', boxSizing: 'border-box' }} 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={handleSaveNotes} className="btn-back" style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
                Guardar Notas
              </button>
              <button onClick={handleMarkCompleted} className="btn-back" style={{ flex: 1, backgroundColor: '#22c55e', color: 'white', borderColor: '#22c55e' }}>
                <CheckCircle size={16} /> Terminada
              </button>
              <button onClick={handleMarkIssue} className="btn-back" style={{ flex: 1, backgroundColor: '#f97316', color: 'white', borderColor: '#f97316' }}>
                <AlertTriangle size={16} /> Inconveniente
              </button>
              <button onClick={handleDeleteAppt} className="btn-back" style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}>
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div style={{ marginTop: '24px' }}>
        {appointments.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No hay citas para este día.</p>
        ) : (
          appointments.map(renderApptCard)
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      const dateStr = formatLocalYYYYMMDD(dayDate);
      
      const dayAppts = appointments.filter(a => {
        return a.appointment_date && a.appointment_date.startsWith(dateStr);
      });
      
      days.push(
        <div key={i} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px', minHeight: '200px' }}>
          <h4 style={{ textAlign: 'center', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '12px' }}>
            {dayDate.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
          </h4>
          {dayAppts.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>Sin citas</p>
          ) : (
            dayAppts.map(a => (
              <div 
                key={a.id} 
                onClick={() => openApptDetails(a)}
                style={{ 
                  backgroundColor: getStatusColor(a.status) + '20', 
                  padding: '6px', 
                  borderRadius: '4px', 
                  marginBottom: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderLeft: `4px solid ${getStatusColor(a.status)}`
                }}
              >
                <div><strong>{a.appointment_time}</strong> - {a.client_name ? a.client_name.split(' ')[0] : ''}</div>
                <div style={{ color: '#777', fontSize: '10px' }}>{getMotoName(a)}{a.moto_color ? ` · ${a.moto_color}` : ''}</div>
              </div>
            ))
          )}
        </div>
      );
    }
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '16px', marginTop: '24px', overflowX: 'auto' }}>
        {days}
      </div>
    );
  };
  
  return (
    <div className="container animate-fade-in" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontFamily: 'Oswald', textTransform: 'uppercase', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarDays size={28} /> Calendario de Citas
        </h1>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-back" 
            style={{ backgroundColor: view === 'day' ? 'var(--color-primary)' : '#fff', color: view === 'day' ? '#fff' : '#000' }}
            onClick={() => setView('day')}
          >
            Por Día
          </button>
          <button 
            className="btn-back" 
            style={{ backgroundColor: view === 'week' ? 'var(--color-primary)' : '#fff', color: view === 'week' ? '#fff' : '#000' }}
            onClick={() => setView('week')}
          >
            Por Semana
          </button>
        </div>
      </div>

      <div className="moto-showcase" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={handlePrev} className="btn-back" style={{ padding: '8px' }}><ChevronLeft size={20} /></button>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {view === 'day' 
              ? currentDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              : `Semana del ${(() => {
                  const s = new Date(currentDate);
                  s.setDate(currentDate.getDate() - currentDate.getDay());
                  return s.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
                })()}`
            }
          </h2>
          <button onClick={handleNext} className="btn-back" style={{ padding: '8px' }}><ChevronRight size={20} /></button>
        </div>

        {view === 'day' ? renderDayView() : renderWeekView()}
        
        {view === 'week' && selectedAppt && (
          <div style={{ marginTop: '24px', padding: '16px', border: '1px solid var(--color-primary)', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '16px', fontFamily: 'Oswald' }}>Detalles de la cita seleccionada</h3>
            {renderApptCard(selectedAppt)}
          </div>
        )}
      </div>

      <div className="moto-showcase" style={{ padding: '24px' }}>
        <h2 style={{ fontFamily: 'Oswald', textTransform: 'uppercase', marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Ban size={20} /> Días Bloqueados (Inhábiles)
        </h2>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <input 
              type="date" 
              className="search-input" 
              style={{ paddingLeft: '16px', width: '100%', boxSizing: 'border-box' }} 
              value={newBlockDate} 
              onChange={e => setNewBlockDate(e.target.value)} 
            />
          </div>
          <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
            <input 
              type="text" 
              className="search-input" 
              style={{ paddingLeft: '16px', width: '100%', boxSizing: 'border-box' }} 
              placeholder="Razón (ej. Día festivo, vacaciones)" 
              value={newBlockReason} 
              onChange={e => setNewBlockReason(e.target.value)} 
            />
          </div>
          <button onClick={addBlockedDate} className="btn-back" style={{ backgroundColor: 'var(--color-primary)', color: 'white', height: '42px', alignSelf: 'flex-end' }}>
            <Plus size={16} /> Bloquear Día
          </button>
        </div>

        <div>
          {blockedDates.length === 0 ? (
            <p style={{ color: '#666', fontSize: '14px' }}>No hay días bloqueados registrados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {blockedDates.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                  <div>
                    <strong style={{ color: '#ef4444' }}>{new Date(b.blocked_date + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
                    <span style={{ color: '#666', marginLeft: '12px', fontSize: '14px' }}>{b.reason || 'Sin razón especificada'}</span>
                  </div>
                  <button onClick={() => removeBlockedDate(b.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCalendar;
