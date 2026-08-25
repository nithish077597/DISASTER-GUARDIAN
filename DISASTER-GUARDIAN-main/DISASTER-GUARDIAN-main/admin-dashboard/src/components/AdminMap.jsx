import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png', iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png' });

const severityColor = { LOW_CONFIDENCE: 'blue', CONFIRMED: 'yellow', HIGH_RISK: 'orange', CRITICAL: 'red' };

function AdminMap({ reports }) {
  return (
    <div className="map-container">
      <h2>Admin Map</h2>
      <MapContainer center={[28.6139, 77.209]} zoom={12} style={{ height: '70vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {reports.map(r => (
          <Marker key={r.id} position={[r.lat, r.lng]}>
            <Popup>
              <strong>{r.disaster_type}</strong><br />
              Severity: {r.severity}<br />
              Status: {r.status}<br />
              {r.description}
            </Popup>
          </Marker>
        ))}
        {reports.filter(r => r.severity === 'CRITICAL' || r.severity === 'HIGH_RISK').map(r => (
          <Circle key={'z' + r.id} center={[r.lat, r.lng]} radius={r.severity === 'CRITICAL' ? 4000 : 2000} pathOptions={{ color: severityColor[r.severity] || 'red', fillOpacity: 0.2 }} />
        ))}
      </MapContainer>
    </div>
  );
}

export default AdminMap;
