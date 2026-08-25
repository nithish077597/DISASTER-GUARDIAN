import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png', iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png' });

const severityColor = { LOW_CONFIDENCE: 'blue', CONFIRMED: 'yellow', HIGH_RISK: 'orange', CRITICAL: 'red' };

function MapView({ reports }) {
  const [dangerZones, setDangerZones] = useState([]);

  useEffect(() => {
    const fetchZones = async () => {
      const zones = [];
      for (const r of reports.slice(0, 5)) {
        try {
          const res = await fetch(`http://localhost:5000/api/geo/danger-zone/${r.id}`);
          if (res.ok) zones.push(await res.json());
        } catch {}
      }
      setDangerZones(zones);
    };
    if (reports.length) fetchZones();
  }, [reports]);

  return (
    <div className="map-container">
      <h2>Live Disaster Map</h2>
      <MapContainer center={[28.6139, 77.209]} zoom={12} style={{ height: '70vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {reports.map(r => (
          <Marker key={r.id} position={[r.lat, r.lng]}>
            <Popup>
              <strong>{r.disaster_type}</strong><br />
              Severity: {r.severity}<br />
              Confidence: {r.confidence_score}<br />
              {r.description}
            </Popup>
          </Marker>
        ))}
        {dangerZones.map((z, i) => (
          <Circle key={i} center={[z.center.lat, z.center.lng]} radius={z.radius_m} pathOptions={{ color: severityColor[z.severity] || 'red', fillOpacity: 0.2 }} />
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;
