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

const asPosition = ({ position, lat, lng } = {}) => {
  if (Array.isArray(position) && Number.isFinite(position[0]) && Number.isFinite(position[1])) return position;
  if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  return null;
};

export const UserMarker = ({ position, lat, lng }) => {
  const pos = asPosition({ position, lat, lng });
  const icon = createCustomIcon('????', 'bg-red-600', 'border-white animate-pulse');
  if (!pos) return null;
  return (
    <Marker position={pos} icon={icon}>
      <Popup className="custom-leaflet-popup">
        <div className="p-2 space-y-1 font-sans text-xs">
          <strong className="text-red-500 uppercase block font-black">???? YOUR GPS LOCATION</strong>
          <p className="text-slate-700 font-mono text-[11px]">Lat: {pos[0]}, Lng: {pos[1]}</p>
          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">GPS Accuracy ??12m</span>
        </div>
      </Popup>
    </Marker>
  );
};

export const UserLocationMarker = UserMarker;

export const RedBeaconMarker = ({ position, lat, lng, title = 'CRITICAL ALERT BEACON' }) => {
  const icon = createCustomIcon('????', 'bg-red-600', 'border-white animate-ping');
  const pos = asPosition({ position, lat, lng });
  if (!pos) return null;
  return (
    <Marker position={pos} icon={icon}>
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
  if (!report) return null;
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

const zoneCenter = (center) =>
  center && Number.isFinite(center.lat) && Number.isFinite(center.lng) ? [center.lat, center.lng] : null;

export const LowRiskZoneCircle = ({ center, radius_m = 1200 }) => {
  const c = zoneCenter(center);
  if (!c) return null;
  return (
    <Circle
      center={c}
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
  const c = zoneCenter(center);
  if (!c) return null;
  return (
    <Circle
      center={c}
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
  const c = zoneCenter(center);
  if (!c) return null;
  return (
    <Circle
      center={c}
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

export const DangerZoneCircle = ({ center, zone, radius_m }) => {
  // Accept either center={{lat,lng}} + radius_m directly or a legacy
  // zone={{ center: {lat,lng}, radius_m }} object
  const c = zoneCenter(zone?.center || center);
  if (!c) return null;
  return (
    <Circle
      center={c}
      radius={radius_m ?? zone?.radius_m ?? 2500}
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
  if (!shelter || !Number.isFinite(shelter.lat) || !Number.isFinite(shelter.lng)) return null;
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
  if (!service || !Number.isFinite(service.lat) || !Number.isFinite(service.lng)) return null;
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
  if (!from || !to || !Number.isFinite(from.lat) || !Number.isFinite(to.lat)) return null;
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

// Renders either an explicit route (from/to) or a road-status segment
// shaped like RealtimeContext roads: { latlngs: [[lat,lng],...], status }
const ROAD_STATUS_COLORS = {
  BLOCKED: '#ef4444',
  'AT RISK': '#f59e0b',
  OPEN: '#10b981',
};

export const RoadPolyline = ({ road, from, to }) => {
  let positions = null;
  let color = '#10b981';
  let dashArray;

  if (road?.latlngs) {
    positions = road.latlngs;
    color = ROAD_STATUS_COLORS[road.status] || '#64748b';
    if (road.status === 'BLOCKED') dashArray = '6, 8';
  } else if (from && to && Number.isFinite(from.lat) && Number.isFinite(to.lat)) {
    positions = [
      [from.lat, from.lng],
      [from.lat + 0.003, from.lng + 0.003],
      [to.lat, to.lng],
    ];
  }

  if (!positions) return null;

  return (
    <Polyline
      positions={positions}
      pathOptions={{ color, weight: 5, dashArray, lineCap: 'round' }}
    />
  );
};
