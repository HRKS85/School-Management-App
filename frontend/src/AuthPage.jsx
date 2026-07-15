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
    <div style={{ padding: '20px', maxWidth: '400px', margin: '100px auto' }}>
      <h2>{mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Reset Password'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {mode === 'register' && <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} />}
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
        <input type="password" name="password" placeholder={mode === 'reset' ? "New Password" : "Password"} required minLength="6" onChange={handleChange} />
        <button type="submit">{mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Update Password'}</button>
      </form>
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'center' }}>
        {mode === 'login' && (
          <>
            <a href="#" onClick={(e) => { e.preventDefault(); setMode('register'); }}>Not registered? Create an account</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setMode('reset'); }}>Forgot Password?</a>
          </>
        )}
        {(mode === 'register' || mode === 'reset') && (
          <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }}>Back to Login</a>
        )}
      </div>
    </div>
  );
}