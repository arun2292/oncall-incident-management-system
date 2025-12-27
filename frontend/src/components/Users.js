import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Users.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/users`);
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUserId) {
        // Update existing user
        await axios.put(`${API_BASE}/users/${editingUserId}`, formData);
        setSuccess('User updated successfully!');
      } else {
        // Create new user
        await axios.post(`${API_BASE}/users`, formData);
        setSuccess('User created successfully!');
      }
      setFormData({
        name: '',
        email: '',
        phone: ''
      });
      setShowForm(false);
      setEditingUserId(null);
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || `Failed to ${editingUserId ? 'update' : 'create'} user`);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || ''
    });
    setEditingUserId(user.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      phone: ''
    });
    setEditingUserId(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="users">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Users</h2>
          <button className="btn btn-primary" onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setShowForm(true);
            }
          }}>
            {showForm ? 'Cancel' : 'Add User'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="user-form">
            {editingUserId && (
              <div className="form-info">
                <strong>Editing User ID: {editingUserId}</strong>
              </div>
            )}
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone (optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              {editingUserId ? 'Update User' : 'Create User'}
            </button>
          </form>
        )}
      </div>

      <div className="user-list">
        {users.length === 0 ? (
          <div className="card">
            <p>No users yet. Add one to get started.</p>
          </div>
        ) : (
          users.map(user => (
            <div key={user.id} className="card user-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3>{user.name}</h3>
                  <p><strong>Email:</strong> {user.email}</p>
                  {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                  <p style={{ fontSize: '0.875rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
                    <strong>ID:</strong> {user.id}
                  </p>
                </div>
                <button 
                  className="btn btn-warning" 
                  onClick={() => handleEdit(user)}
                  style={{ marginTop: '0' }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Users;

