import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'register') {
        const res = await axios.post('https://school-management-app-bn8r.onrender.com/register', formData);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } else if (mode === 'login') {
        const res = await axios.post('https://school-management-app-bn8r.onrender.com/login', { email: formData.email, password: formData.password });
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } else if (mode === 'reset') {
        await axios.post('https://school-management-app-bn8r.onrender.com/reset-password', { email: formData.email, newPassword: formData.password });
        alert("Password reset! You can now log in.");
        setMode('login');
      }
    } catch (err) {
      alert(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="auth-page-bg">
      <div className="auth-mobile-card">
        
        {/* Abstract Blob Header */}
        <div className="auth-header-visuals">
          <div className="blob-yellow"></div>
          <div className="blob-salmon"></div>
          <div className="blob-purple">
            <h2 className="auth-title">
              {mode === 'login' && <>Welcome<br/>Back</>}
              {mode === 'register' && <>Create<br/>Account</>}
              {mode === 'reset' && <>Reset<br/>Password</>}
            </h2>
          </div>
        </div>

        {/* Minimal Form Section */}
        <div className="auth-form-container">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            
            {mode === 'register' && (
              <div className="minimal-input-group">
                <label className="minimal-label">Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  onChange={handleChange} 
                  className="minimal-input" 
                  placeholder="John Doe" 
                />
              </div>
            )}
            
            <div className="minimal-input-group">
              <label className="minimal-label">Email</label>
              <input 
                type="email" 
                name="email" 
                required 
                onChange={handleChange} 
                className="minimal-input" 
                placeholder="giga@example.com" 
              />
            </div>
            
            <div className="minimal-input-group">
              <label className="minimal-label">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                minLength="6" 
                onChange={handleChange} 
                className="minimal-input" 
                placeholder="•••••••" 
              />
            </div>

            <div className="auth-action-row">
              <span className="auth-action-text">
                {mode === 'login' ? 'Sign in' : mode === 'register' ? 'Sign up' : 'Update'}
              </span>
              <button type="submit" className="auth-circle-btn">
                →
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="auth-footer">
            {mode === 'login' ? (
              <>
                <button onClick={() => setMode('register')} className="minimal-link">Sign up</button>
                <button onClick={() => setMode('reset')} className="minimal-link">Forgot Password</button>
              </>
            ) : (
              <button onClick={() => setMode('login')} className="minimal-link">Back to Sign in</button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}