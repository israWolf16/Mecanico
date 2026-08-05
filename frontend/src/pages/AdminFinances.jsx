import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, DollarSign, Wallet, Calendar, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AdminFinances = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);

  useEffect(() => {
    fetchFinishedAppointments();
  }, []);

  const fetchFinishedAppointments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      // Fetch a wide range to get all history
      const res = await axios.get(`${API_URL}/appointments?start_date=2000-01-01&end_date=2100-01-01`, { headers });
      
      const finished = res.data.filter(a => a.status === 'terminada');
      // Sort by date descending
      finished.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
      
      setAppointments(finished);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

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
        brand: 'Manual'
      };
    }
    return null;
  };

  const getMotoName = (appt) => parseManualMoto(appt)?.name || appt.motorcycles?.model_name || 'Moto';
  const getMotoImage = (appt) => parseManualMoto(appt)?.image || appt.motorcycles?.image_url || '';

  // Calcular métricas
  const totalInvertido = appointments.reduce((sum, appt) => sum + (parseFloat(appt.parts_cost) || 0), 0);
  const totalCobrado = appointments.reduce((sum, appt) => sum + (parseFloat(appt.total_charged) || 0), 0);
  const gananciaNeta = totalCobrado - totalInvertido;

  const dataPie = [
    { name: 'Inversión (Refacciones)', value: totalInvertido },
    { name: 'Ganancia Neta', value: gananciaNeta > 0 ? gananciaNeta : 0 }
  ];

  const COLORS = ['#f97316', '#22c55e']; // Naranja para inversión, Verde para ganancia

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="animate-fade-in" style={{ padding: '20px 0' }}>
      
      {/* Tarjetas de resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#fff7ed', padding: '16px', borderRadius: '50%' }}>
            <Wallet size={28} color="#ea580c" />
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Invertido</p>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#1f2937' }}>${totalInvertido.toFixed(2)}</h3>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '50%' }}>
            <DollarSign size={28} color="#2563eb" />
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Cobrado</p>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#1f2937' }}>${totalCobrado.toFixed(2)}</h3>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '50%' }}>
            <TrendingUp size={28} color="#16a34a" />
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ganancia Neta Total</p>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#16a34a' }}>${gananciaNeta.toFixed(2)}</h3>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Gráfico */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eee' }}>
          <h3 style={{ fontFamily: 'Oswald', margin: '0 0 20px 0', textTransform: 'uppercase' }}>Proporción Global</h3>
          {totalCobrado === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>No hay datos suficientes para graficar</div>
          ) : (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Grid Historial */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eee' }}>
          <h3 style={{ fontFamily: 'Oswald', margin: '0 0 20px 0', textTransform: 'uppercase' }}>Historial de Motos Entregadas</h3>
          
          {appointments.length === 0 ? (
            <p style={{ color: '#666' }}>No hay motos terminadas registradas.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {appointments.map(appt => (
                <div 
                  key={appt.id} 
                  onClick={() => setSelectedAppt(appt)}
                  style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <div style={{ height: '120px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getMotoImage(appt) ? (
                      <img src={getMotoImage(appt)} alt={getMotoName(appt)} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
                    ) : (
                      <span style={{ color: '#ccc', fontSize: '12px' }}>Sin Imagen</span>
                    )}
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{getMotoName(appt)}</div>
                    <div style={{ color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <Calendar size={12}/> {appt.appointment_date}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Cliente: {appt.client_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Detalles Financieros */}
      {selectedAppt && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '400px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedAppt(null)} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#666' }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ fontFamily: 'Oswald', margin: '0 0 8px 0', textTransform: 'uppercase', fontSize: '20px' }}>Desglose Financiero</h3>
            <div style={{ color: '#666', fontSize: '14px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
              <strong>Moto:</strong> {getMotoName(selectedAppt)}<br/>
              <strong>Cliente:</strong> {selectedAppt.client_name}<br/>
              <strong>Servicio:</strong> {selectedAppt.service_name}<br/>
              <strong>Fecha:</strong> {selectedAppt.appointment_date}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ea580c' }}>
                <span>Costo Refacciones:</span>
                <strong>${(parseFloat(selectedAppt.parts_cost) || 0).toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb' }}>
                <span>Cobro Total:</span>
                <strong>${(parseFloat(selectedAppt.total_charged) || 0).toFixed(2)}</strong>
              </div>
              
              <div style={{ margin: '12px 0', borderTop: '1px dashed #ccc' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontSize: '18px' }}>
                <strong>Ganancia Neta:</strong>
                <strong>${((parseFloat(selectedAppt.total_charged) || 0) - (parseFloat(selectedAppt.parts_cost) || 0)).toFixed(2)}</strong>
              </div>

              {(parseFloat(selectedAppt.parts_cost) || 0) > 0 && (
                <div style={{ textAlign: 'right', color: '#666', fontSize: '12px', marginTop: '4px' }}>
                  Rendimiento: {((((parseFloat(selectedAppt.total_charged) || 0) - (parseFloat(selectedAppt.parts_cost) || 0)) / (parseFloat(selectedAppt.parts_cost) || 0)) * 100).toFixed(1)}%
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFinances;
