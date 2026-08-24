import React, { useState } from 'react';
import ReportForm from './pages/ReportForm';
import MapView from './pages/MapView';
import ReportList from './components/ReportList';
import './App.css';

function App() {
  const [view, setView] = useState('report');
  const [reports, setReports] = useState([]);

  const refreshReports = async () => {
    const res = await fetch('http://localhost:5000/api/reports');
    const data = await res.json();
    setReports(data);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <h1>🛡️ Disaster Guardian</h1>
        <div>
          <button className={view === 'report' ? 'active' : ''} onClick={() => setView('report')}>Report</button>
          <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>Map</button>
          <button className={view === 'list' ? 'active' : ''} onClick={() => { refreshReports(); setView('list'); }}>Reports</button>
        </div>
      </nav>
      <main className="main">
        {view === 'report' && <ReportForm onSubmitted={refreshReports} />}
        {view === 'map' && <MapView reports={reports} />}
        {view === 'list' && <ReportList reports={reports} />}
      </main>
    </div>
  );
}

export default App;
