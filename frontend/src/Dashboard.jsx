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
    name: user?.name || '', 
    age: '', 
    rollNumber: '', 
    address: '', 
    city: '', 
    state: '', 
    pincode: ''
  });
  
  const [errors, setErrors] = useState({});
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
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: '' }));

    if (['age', 'rollNumber', 'pincode'].includes(name)) {
      if (!/^\d*$/.test(value)) return; 
    }
    if (['city', 'state', 'name'].includes(name)) {
      if (!/^[a-zA-Z\s]*$/.test(value)) return; 
    }
    if (name === 'pincode' && value.length > 6) return;

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Required";
    if (!form.age) newErrors.age = "Required";
    if (!form.rollNumber.trim()) newErrors.rollNumber = "Required";
    if (!form.address.trim()) newErrors.address = "Required";
    if (!form.city.trim()) newErrors.city = "Required";
    if (!form.state.trim()) newErrors.state = "Required";
    if (!form.pincode || form.pincode.length !== 6) newErrors.pincode = "6 digits Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }

    try {
      if (editId) {
        await axios.put(`https://school-management-app-bn8r.onrender.com/students/${editId}`, form, axiosConfig);
        setEditId(null);
      } else {
        await axios.post('https://school-management-app-bn8r.onrender.com/students', form, axiosConfig);
      }
      
      setForm({ name: user?.name || '', age: '', rollNumber: '', address: '', city: '', state: '', pincode: '' });
      setErrors({});
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (student) => {
    setForm({ ...student });
    setEditId(student._id);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      await axios.delete(`https://school-management-app-bn8r.onrender.com/students/${id}`, axiosConfig);
      fetchStudents();
      if (editId === id) {
        setForm({ name: user?.name || '', age: '', rollNumber: '', address: '', city: '', state: '', pincode: '' });
        setEditId(null);
        setErrors({});
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate('/');
  };

  const renderInput = (name, labelText, type = "text") => (
    <div className="input-group">
      <div className="input-label-row">
        <label htmlFor={name} className="label-text">
          <span className="asterisk">*</span>
          {labelText}
        </label>
        {errors[name] && <span className="error-text">{errors[name]}</span>}
      </div>
      <input
        id={name}
        name={name}
        type={type}
        value={form[name]}
        onChange={handleChange}
        className={`input-field ${errors[name] ? 'error' : ''}`}
      />
    </div>
  );

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        
        <header className="card header-card">
          <div className="avatar-wrapper">
            <div className="avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <p className="user-name">{user.name || "Administrator"}</p>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </header>

        <div className="card">
          <h2>Student Registration</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {renderInput("name", "Student Name")}
              {renderInput("age", "Age")}
              {renderInput("rollNumber", "Roll Number")}
              {renderInput("address", "Address")}
              {renderInput("city", "City")}
              {renderInput("state", "State")}
              {renderInput("pincode", "Pincode")}
            </div>
            
            <div style={{ marginTop: '10px' }}>
              <button type="submit" className={`btn ${editId ? 'btn-warning' : 'btn-success'}`}>
                {editId ? 'Update Student Record' : 'Save Student Record'}
              </button>
            </div>
          </form>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Roll No</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>Pincode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.age}</td>
                  <td>{s.rollNumber}</td>
                  <td>{s.address}</td>
                  <td>{s.city}</td>
                  <td>{s.state}</td>
                  <td>{s.pincode}</td>
                  <td className="actions-cell">
                    <button onClick={() => handleEdit(s)} className="btn-action-edit">Edit</button>
                    <button onClick={() => handleDelete(s._id)} className="btn-action-delete">Delete</button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    No students found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
}