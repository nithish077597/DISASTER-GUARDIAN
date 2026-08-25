import { Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

const createCustomIcon = (emoji, bgClass = 'bg-slate-900', borderClass = 'border-slate-700') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div className="w-9 h-9 rounded-full ${bgClass} border-2 ${borderClass} shadow-xl flex items-center justify-center text-lg select-none hover:scale-110 transition-transform">
        ${emoji}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

export const UserMarker = ({ position }) => {
  const icon = createCustomIcon('????', 'bg-red-600', 'border-white animate-pulse');
  return (
    <Marker position={position} icon={icon}>
      <Popup className="custom-leaflet-popup">
        <div className="p-2 space-y-1 font-sans text-xs">
          <strong className="text-red-500 uppercase block font-black">???? YOUR GPS LOCATION</strong>
          <p className="text-slate-700 font-mono text-[11px]">Lat: {position[0]}, Lng: {position[1]}</p>
          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">GPS Accuracy ??12m</span>
        </div>
      </Popup>
    </Marker>
  );
};

export const UserLocationMarker = UserMarker;

export const RedBeaconMarker = ({ position, title = 'CRITICAL ALERT BEACON' }) => {
  const icon = createCustomIcon('????', 'bg-red-600', 'border-white animate-ping');
  return (
    <Marker position={position} icon={icon}>
      <Popup className="custom-leaflet-popup">
        <div className="p-2 space-y-1 font-sans text-xs">
          <strong className="text-red-600 uppercase block font-black">{title}</strong>
          <p className="text-slate-700 font-mono text-[11px]">High risk danger beacon active.</p>
        </div>
      </Popup>
    </Marker>
  );
};

export const ReportMarker = ({ report }) => {
  const emoji = report?.disaster_type === 'FLOOD' ? '????' : report?.disaster_type === 'FIRE' ? '????' : '??????';
  const icon = createCustomIcon(emoji, 'bg-amber-600', 'border-amber-300');
  return (
    <Marker position={[report.lat || 28.621, report.lng || 77.214]} icon={icon}>
      <Popup className="custom-leaflet-popup">
        <div className="p-2 space-y-1 font-sans text-xs">
          <strong className="text-amber-600 uppercase block font-black">{report.disaster_type} REPORT</strong>
          <p className="text-slate-700">{report.description || 'Citizen incident report.'}</p>
        </div>
      </Popup>
    </Marker>
  );
};

export const FitToReports = ({ points = [] }) => {
  const map = useMap();
  if (points.length > 0) {
    try {
      const bounds = L.latLngBounds(points.map((p) => [p.lat || p[0], p.lng || p[1]]));
      map.fitBounds(bounds, { padding: [40, 40] });
    } catch {
      // fallback
    }
  }
  return null;
};

export const LowRiskZoneCircle = ({ center, radius_m = 1200 }) => {
  return (
    <Circle
      center={[center.lat, center.lng]}
      radius={radius_m}
      pathOptions={{
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 4',
      }}
    />
  );
};

export const MediumRiskZoneCircle = ({ center, radius_m = 1500 }) => {
  return (
    <Circle
      center={[center.lat, center.lng]}
      radius={radius_m}
      pathOptions={{
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.2,
        weight: 2,
      }}
    />
  );
};

export const HighRiskZoneCircle = ({ center, radius_m = 1800 }) => {
  return (
    <Circle
      center={[center.lat, center.lng]}
      radius={radius_m}
      pathOptions={{
        color: '#f97316',
        fillColor: '#f97316',
        fillOpacity: 0.25,
        weight: 2.5,
      }}
    />
  );
};

export const DangerZoneCircle = ({ center, radius_m = 2500 }) => {
  return (
    <Circle
      center={[center.lat, center.lng]}
      radius={radius_m}
      pathOptions={{
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.35,
        weight: 3,
        className: 'animate-pulse',
      }}
    />
  );
};

export const ShelterMarker = ({ shelter }) => {
  const icon = createCustomIcon('????', 'bg-emerald-600', 'border-emerald-300');
  return (
    <Marker position={[shelter.lat, shelter.lng]} icon={icon}>
      <Popup className="custom-leaflet-popup">
        <div className="p-2 space-y-1 font-sans text-xs">
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
            VERIFIED SAFE SHELTER
          </span>
          <h4 className="font-extrabold text-slate-900 text-sm">{shelter.name}</h4>
          <p className="text-slate-600">Capacity: <strong>{shelter.capacity}</strong> ??? Status: <strong className="text-emerald-600">{shelter.status}</strong></p>
          <a
            href={`tel:${shelter.phone || '112'}`}
            className="mt-1 block text-center py-1 rounded bg-emerald-600 text-white font-bold text-[11px]"
          >
            ???? CALL SHELTER ({shelter.phone || '112'})
          </a>
        </div>
      </Popup>
    </Marker>
  );
};

export const EmergencyServiceMarker = ({ service }) => {
  const emoji = service.type === 'hospital' ? '????' : service.type === 'police' ? '????' : '????';
  const bg = service.type === 'hospital' ? 'bg-cyan-600' : service.type === 'police' ? 'bg-blue-600' : 'bg-red-600';
  const icon = createCustomIcon(emoji, bg, 'border-white');

  return (
    <Marker position={[service.lat, service.lng]} icon={icon}>
      <Popup className="custom-leaflet-popup">
        <div className="p-2 space-y-1 font-sans text-xs">
          <strong className="text-slate-900 uppercase block font-black">{service.name}</strong>
          <p className="text-slate-600">Distance: <strong>{service.distance}</strong></p>
          <a href={`tel:${service.phone}`} className="mt-1 block text-center py-1 rounded bg-slate-900 text-white font-bold text-[11px]">
            ???? CALL ({service.phone})
          </a>
        </div>
      </Popup>
    </Marker>
  );
};

export const EvacuationRoutePolyline = ({ from, to }) => {
  return (
    <Polyline
      positions={[
        [from.lat, from.lng],
        [from.lat + 0.003, from.lng + 0.003],
        [to.lat, to.lng],
      ]}
      pathOptions={{
        color: '#10b981',
        weight: 5,
        dashArray: '8, 8',
        lineCap: 'round',
      }}
    />
  );
};

export const RoadPolyline = EvacuationRoutePolyline;
