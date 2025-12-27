import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalIncidents: 0,
    activeIncidents: 0,
    resolvedIncidents: 0,
    schedules: 0,
    users: 0
  });
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [incidentsRes, schedulesRes] = await Promise.all([
        axios.get(`${API_BASE}/incidents`),
        axios.get(`${API_BASE}/schedules`)
      ]);

      const incidents = incidentsRes.data;
      const activeIncidents = incidents.filter(i => i.state !== 'resolved');
      const resolvedIncidents = incidents.filter(i => i.state === 'resolved');

      setStats({
        totalIncidents: incidents.length,
        activeIncidents: activeIncidents.length,
        resolvedIncidents: resolvedIncidents.length,
        schedules: schedulesRes.data.length,
        users: 0 // Will be updated when users endpoint is called
      });

      setRecentIncidents(incidents.slice(0, 5).sort((a, b) => 
        new Date(b.triggeredAt) - new Date(a.triggeredAt)
      ));
      setSchedules(schedulesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Incidents</h3>
          <p className="stat-number">{stats.totalIncidents}</p>
        </div>
        <div className="stat-card active">
          <h3>Active Incidents</h3>
          <p className="stat-number">{stats.activeIncidents}</p>
        </div>
        <div className="stat-card resolved">
          <h3>Resolved</h3>
          <p className="stat-number">{stats.resolvedIncidents}</p>
        </div>
        <div className="stat-card">
          <h3>Schedules</h3>
          <p className="stat-number">{stats.schedules}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Current On-Call</h2>
          {schedules.length === 0 ? (
            <p>No schedules configured</p>
          ) : (
            <div className="oncall-list">
              {schedules.map(schedule => (
                <div key={schedule.id} className="oncall-item">
                  <div className="oncall-service">{schedule.name}</div>
                  {schedule.currentOnCall ? (
                    <div className="oncall-user">
                      <strong>{schedule.currentOnCall.name}</strong>
                      <span className="oncall-indicator">ON-CALL</span>
                    </div>
                  ) : (
                    <div className="oncall-user">No one on-call</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Recent Incidents</h2>
          {recentIncidents.length === 0 ? (
            <p>No incidents yet</p>
          ) : (
            <div className="incident-list">
              {recentIncidents.map(incident => (
                <div key={incident.id} className="incident-item">
                  <div className="incident-header">
                    <h3>{incident.title}</h3>
                    <span className={`status-badge status-${incident.state}`}>
                      {incident.state}
                    </span>
                  </div>
                  <p className="incident-description">{incident.description || 'No description'}</p>
                  <div className="incident-meta">
                    <span>Triggered: {new Date(incident.triggeredAt).toLocaleString()}</span>
                    {incident.resolvedAt && (
                      <span>Resolved: {new Date(incident.resolvedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

