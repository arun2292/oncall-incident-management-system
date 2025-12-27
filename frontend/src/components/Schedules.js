import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Schedules.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    serviceId: '',
    rotation: [{ userId: '', startTime: '', endTime: '' }]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesRes, servicesRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE}/schedules`),
        axios.get(`${API_BASE}/services`),
        axios.get(`${API_BASE}/users`)
      ]);
      setSchedules(schedulesRes.data);
      setServices(servicesRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load schedules');
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

  const handleRotationChange = (index, field, value) => {
    const newRotation = [...formData.rotation];
    newRotation[index] = { ...newRotation[index], [field]: value };
    setFormData(prev => ({ ...prev, rotation: newRotation }));
  };

  const addRotationEntry = () => {
    setFormData(prev => ({
      ...prev,
      rotation: [...prev.rotation, { userId: '', startTime: '', endTime: '' }]
    }));
  };

  const removeRotationEntry = (index) => {
    setFormData(prev => ({
      ...prev,
      rotation: prev.rotation.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post(`${API_BASE}/schedules`, formData);
      setSuccess('Schedule created successfully!');
      setFormData({
        name: '',
        serviceId: '',
        rotation: [{ userId: '', startTime: '', endTime: '' }]
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create schedule');
    }
  };

  if (loading) {
    return <div className="loading">Loading schedules...</div>;
  }

  return (
    <div className="schedules">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>On-Call Schedules</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create Schedule'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="schedule-form">
            <div className="form-group">
              <label>Schedule Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Service</label>
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a service</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Rotation</label>
              {formData.rotation.map((entry, index) => (
                <div key={index} className="rotation-entry">
                  <select
                    value={entry.userId}
                    onChange={(e) => handleRotationChange(index, 'userId', e.target.value)}
                    required
                  >
                    <option value="">Select user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                  <input
                    type="datetime-local"
                    value={entry.startTime}
                    onChange={(e) => handleRotationChange(index, 'startTime', e.target.value)}
                    required
                  />
                  <input
                    type="datetime-local"
                    value={entry.endTime}
                    onChange={(e) => handleRotationChange(index, 'endTime', e.target.value)}
                    required
                  />
                  {formData.rotation.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeRotationEntry(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addRotationEntry}
              >
                Add Rotation Entry
              </button>
            </div>

            <button type="submit" className="btn btn-primary">Create Schedule</button>
          </form>
        )}
      </div>

      <div className="schedule-list">
        {schedules.length === 0 ? (
          <div className="card">
            <p>No schedules configured. Create one to get started.</p>
          </div>
        ) : (
          schedules.map(schedule => (
            <div key={schedule.id} className="card schedule-item">
              <h3>{schedule.name}</h3>
              <div className="schedule-info">
                <p><strong>Service:</strong> {services.find(s => s.id === schedule.serviceId)?.name || 'N/A'}</p>
                {schedule.currentOnCall ? (
                  <p>
                    <strong>Current On-Call:</strong> {schedule.currentOnCall.name}
                    <span className="oncall-indicator">ON-CALL</span>
                  </p>
                ) : (
                  <p><strong>Current On-Call:</strong> No one assigned</p>
                )}
              </div>
              <div className="rotation-details">
                <h4>Rotation Schedule:</h4>
                {schedule.rotation.map((entry, index) => {
                  const user = users.find(u => u.id === entry.userId);
                  return (
                    <div key={index} className="rotation-item">
                      <span>{user?.name || 'Unknown'}</span>
                      <span>{new Date(entry.startTime).toLocaleString()} - {new Date(entry.endTime).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Schedules;

