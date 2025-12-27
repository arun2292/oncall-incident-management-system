import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Schedules from './components/Schedules';
import Incidents from './components/Incidents';
import Users from './components/Users';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="App">
      <header className="App-header">
        <h1>On-Call Incident Management System</h1>
        <nav className="nav-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'schedules' ? 'active' : ''}
            onClick={() => setActiveTab('schedules')}
          >
            Schedules
          </button>
          <button 
            className={activeTab === 'incidents' ? 'active' : ''}
            onClick={() => setActiveTab('incidents')}
          >
            Incidents
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </nav>
      </header>
      <main className="App-main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'schedules' && <Schedules />}
        {activeTab === 'incidents' && <Incidents />}
        {activeTab === 'users' && <Users />}
      </main>
    </div>
  );
}

export default App;

