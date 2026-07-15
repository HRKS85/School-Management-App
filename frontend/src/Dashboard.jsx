import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const user = userRaw ? JSON.parse(userRaw) : null;
  
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    name: '', age: '', rollNumber: '', address: '', city: '', state: '', pincode: ''
  });
  const [editId, setEditId] = useState(null);

  const axiosConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  useEffect(() => {
    if (!user || !token) {
      navigate('/');
    } else {
      fetchStudents();
    }
  }, [user, token, navigate]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('https://school-management-app-bn8r.onrender.com/students', axiosConfig);
      setStudents(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'pincode') {
      const numericValue = e.target.value.replace(/\D/g, '').slice(0, 6);
      setForm({ ...form, pincode: numericValue });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.pincode.length !== 6) {
      alert("Pincode must be exactly 6 digits.");
      return;
    }

    try {
      if (editId) {
        await axios.put(`https://school-management-app-bn8r.onrender.com/students/${editId}`, form, axiosConfig);
        setEditId(null);
      } else {
        await axios.post('https://school-management-app-bn8r.onrender.com/students', form, axiosConfig);
      }
      setForm({ name: '', age: '', rollNumber: '', address: '', city: '', state: '', pincode: '' });
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (student) => {
    setForm({ ...student });
    setEditId(student._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      await axios.delete(`https://school-management-app-bn8r.onrender.com/students/${id}`, axiosConfig);
      fetchStudents();
      if (editId === id) {
        setForm({ name: '', age: '', rollNumber: '', address: '', city: '', state: '', pincode: '' });
        setEditId(null);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate('/');
  };

  if (!user) return null;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f4f4f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#007bff', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
            {user.email.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: 'bold' }}>{user.email}</span>
        </div>
        <button onClick={handleLogout} style={{ background: '#dc3545', padding: '8px 16px' }}>Logout</button>
      </header>

      <h2>Student Registration Form</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
        <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="Age" required />
        <input name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="Roll Number" required />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
        <input name="city" value={form.city} onChange={handleChange} placeholder="City" required />
        <input name="state" value={form.state} onChange={handleChange} placeholder="State" required />
        
        <input 
          name="pincode" 
          value={form.pincode} 
          onChange={handleChange} 
          placeholder="Pincode (6 Digits)" 
          pattern="\d{6}" 
          title="Please enter exactly 6 digits"
          required 
        />
        
        <button type="submit" style={{ gridColumn: 'span 2', background: editId ? '#f59e0b' : '#10b981' }}>
          {editId ? 'Update Student' : 'Add Student'}
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th><th>Age</th><th>Roll No</th><th>Address</th><th>City</th><th>State</th><th>Pincode</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.name}</td><td>{s.age}</td><td>{s.rollNumber}</td>
              <td>{s.address}</td><td>{s.city}</td><td>{s.state}</td><td>{s.pincode}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Edit</button>
                <button onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
          {students.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>No students found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}