import React, { useState, useEffect } from 'react';

function ReportForm({ onSubmitted }) {
  const [form, setForm] = useState({
    disaster_type: 'FLOOD',
    lat: '',
    lng: '',
    description: '',
    reporter_id: 'citizen_1',
    photo_url: '',
  });
  const [status, setStatus] = useState('');

  const getLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm(f => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
    }, () => alert('Location access denied'));
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      const res = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('Report submitted!');
      setForm({ disaster_type: 'FLOOD', lat: '', lng: '', description: '', reporter_id: 'citizen_1', photo_url: '' });
      onSubmitted?.();
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Report Disaster</h2>
      <form onSubmit={submit} className="form">
        <label>
          Disaster Type
          <select value={form.disaster_type} onChange={(e) => setForm({ ...form, disaster_type: e.target.value })}>
            <option>FLOOD</option>
            <option>LANDSLIDE</option>
          </select>
        </label>
        <label>
          Latitude
          <input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} required />
        </label>
        <label>
          Longitude
          <input value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} required />
        </label>
        <button type="button" onClick={getLocation}>Use My Location</button>
        <label>
          Description
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label>
          Photo URL (optional)
          <input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} />
        </label>
        <button type="submit" className="primary">Submit Report</button>
      </form>
      {status && <p className="status">{status}</p>}
    </div>
  );
}

export default ReportForm;
