import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Incidents.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduleId: '',
    severity: 'medium'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
    // Refresh incidents every 30 seconds to catch escalations
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [incidentsRes, schedulesRes] = await Promise.all([
        axios.get(`${API_BASE}/incidents`),
        axios.get(`${API_BASE}/schedules`)
      ]);
      setIncidents(incidentsRes.data.sort((a, b) => 
        new Date(b.triggeredAt) - new Date(a.triggeredAt)
      ));
      setSchedules(schedulesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load incidents');
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
      await axios.post(`${API_BASE}/incidents`, formData);
      setSuccess('Incident created successfully!');
      setFormData({
        title: '',
        description: '',
        scheduleId: '',
        severity: 'medium'
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create incident');
    }
  };

  const handleAcknowledge = async (incidentId) => {
    try {
      await axios.patch(`${API_BASE}/incidents/${incidentId}/acknowledge`);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to acknowledge incident');
    }
  };

  const handleResolve = async (incidentId) => {
    try {
      await axios.patch(`${API_BASE}/incidents/${incidentId}/resolve`);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to resolve incident');
    }
  };

  const handleEscalate = async (incidentId) => {
    try {
      await axios.post(`${API_BASE}/incidents/${incidentId}/escalate`);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to escalate incident');
    }
  };

  if (loading) {
    return <div className="loading">Loading incidents...</div>;
  }

  return (
    <div className="incidents">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Incidents</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Trigger Incident'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="incident-form">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Schedule</label>
              <select
                name="scheduleId"
                value={formData.scheduleId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a schedule</option>
                {schedules.map(schedule => (
                  <option key={schedule.id} value={schedule.id}>{schedule.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Severity</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">Trigger Incident</button>
          </form>
        )}
      </div>

      <div className="incident-list">
        {incidents.length === 0 ? (
          <div className="card">
            <p>No incidents yet. Trigger one to get started.</p>
          </div>
        ) : (
          incidents.map(incident => (
            <div key={incident.id} className="card incident-item">
              <div className="incident-header">
                <h3>{incident.title}</h3>
                <div className="incident-badges">
                  <span className={`status-badge status-${incident.state}`}>
                    {incident.state}
                  </span>
                  <span className={`severity-badge severity-${incident.severity}`}>
                    {incident.severity}
                  </span>
                </div>
              </div>
              
              <p className="incident-description">{incident.description || 'No description'}</p>
              
              <div className="incident-meta">
                <div>
                  <strong>Triggered:</strong> {new Date(incident.triggeredAt).toLocaleString()}
                </div>
                {incident.acknowledgedAt && (
                  <div>
                    <strong>Acknowledged:</strong> {new Date(incident.acknowledgedAt).toLocaleString()}
                  </div>
                )}
                {incident.resolvedAt && (
                  <div>
                    <strong>Resolved:</strong> {new Date(incident.resolvedAt).toLocaleString()}
                  </div>
                )}
                {incident.escalationLevel > 0 && (
                  <div>
                    <strong>Escalation Level:</strong> {incident.escalationLevel}
                  </div>
                )}
              </div>

              {incident.escalationHistory && incident.escalationHistory.length > 0 && (
                <div className="escalation-history">
                  <strong>Escalation History:</strong>
                  <ul>
                    {incident.escalationHistory.map((escalation, idx) => (
                      <li key={idx}>
                        Level {escalation.level} at {new Date(escalation.timestamp).toLocaleString()} - {escalation.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="incident-actions">
                {incident.state === 'triggered' && (
                  <button
                    className="btn btn-warning"
                    onClick={() => handleAcknowledge(incident.id)}
                  >
                    Acknowledge
                  </button>
                )}
                {incident.state !== 'resolved' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => handleResolve(incident.id)}
                    >
                      Resolve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleEscalate(incident.id)}
                    >
                      Escalate
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Incidents;

