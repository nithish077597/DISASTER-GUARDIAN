import React, { useState, useEffect } from 'react';
import ReportTable from './components/ReportTable';
import AdminMap from './components/AdminMap';
import AlertPanel from './components/AlertPanel';

function App() {
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tab, setTab] = useState('reports');

  const load = async () => {
    const [r, a] = await Promise.all([
      fetch('http://localhost:5000/api/reports').then(res => res.json()),
      fetch('http://localhost:5000/api/alerts').then(res => res.json()),
    ]);
    setReports(r);
    setAlerts(a);
  };

  useEffect(() => { load(); const interval = setInterval(load, 5000); return () => clearInterval(interval); }, []);

  const overrideStatus = async (id, status) => {
    await fetch(`http://localhost:5000/api/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const overrideSeverity = async (id, severity) => {
    await fetch(`http://localhost:5000/api/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ severity }),
    });
    load();
  };

  return (
    <div className="admin-app">
      <nav className="navbar">
        <h1>🛡️ Disaster Guardian — Admin</h1>
        <div>
          <button className={tab === 'reports' ? 'active' : ''} onClick={() => setTab('reports')}>Reports</button>
          <button className={tab === 'map' ? 'active' : ''} onClick={() => setTab('map')}>Map</button>
          <button className={tab === 'alerts' ? 'active' : ''} onClick={() => setTab('alerts')}>Alerts</button>
        </div>
      </nav>
      <main className="main">
        {tab === 'reports' && <ReportTable reports={reports} onOverrideStatus={overrideStatus} onOverrideSeverity={overrideSeverity} />}
        {tab === 'map' && <AdminMap reports={reports} />}
        {tab === 'alerts' && <AlertPanel alerts={alerts} />}
      </main>
    </div>
  );
}

export default App;
