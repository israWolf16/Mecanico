import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        navigate('/admin');
      }
    } catch (err) {
      setError('Credenciales inválidas. Intenta nuevamente.');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div className="moto-showcase" style={{ maxWidth: '400px', width: '100%', padding: '40px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ background: 'var(--color-primary)', padding: '16px', borderRadius: '50%' }}>
            <Lock size={32} color="#ffffff" />
          </div>
        </div>
        <h2 style={{ fontFamily: 'Oswald', textTransform: 'uppercase', marginBottom: '24px', fontSize: '24px' }}>
          Acceso Mecánico
        </h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="text" 
            placeholder="Usuario" 
            className="search-input" 
            style={{ paddingLeft: '16px' }}
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="search-input" 
            style={{ paddingLeft: '16px' }}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            style={{
              background: 'var(--color-primary)', 
              color: 'white', 
              border: 'none', 
              padding: '14px', 
              borderRadius: 'var(--radius-md)', 
              fontFamily: 'Oswald',
              fontSize: '18px',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            ENTRAR
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
