import { useEffect, useMemo } from 'react';
import { Marker, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getSeverityInfo, disasterLabel } from '../utils/helpers';

const ICON_SIZE = [34, 34];
const ICON_SIZE_LARGE = [42, 42];

const createIcon = (severity, large = false) => {
  const info = getSeverityInfo(severity);
  const size = large ? ICON_SIZE_LARGE : ICON_SIZE;
  const html = `
    <div style="
      width:${size[0]}px;height:${size[1]}px;border-radius:50%;
      background:${info.color};border:2px solid rgba(15,23,42,0.6);
      box-shadow:0 0 ${large ? 12 : 6}px ${large ? 4 : 2}px ${info.color}80;
      display:flex;align-items:center;justify-content:center;
      ${severity === 'CRITICAL' ? 'animation:pulse-critical 2s ease-in-out infinite;' : ''}
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="${large ? 18 : 14}" height="${large ? 18 : 14}" viewBox="0 0 24 24" fill="white" style="filter:drop-shadow(0 0 2px rgba(0,0,0,0.8))">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    className: 'custom-div-icon',
    html,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
  });
};

const SHELTER_ICON = L.divIcon({
  className: 'custom-div-icon',
  html: `
    <div style="width:32px;height:32px;border-radius:6px;background:rgba(34,197,94,0.95);
      border:2px solid rgba(15,23,42,0.7);box-shadow:0 0 12px 4px rgba(34,197,94,0.5);
      display:flex;align-items:center;justify-content:center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M12 3L3 9v12h7v-6h4v6h7V9l-9-6z"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const USER_ICON = L.divIcon({
  className: 'custom-div-icon',
  html: `
    <div style="width:28px;height:28px;border-radius:50%;background:rgba(56,189,248,0.95);
      border:2px solid rgba(15,23,42,0.7);box-shadow:0 0 12px 4px rgba(56,189,248,0.5);
      display:flex;align-items:center;justify-content:center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white">
        <path d="M12 12c2.7 0 4.8-2.3 4.8-5.2S14.7 2 12 2 7.2 4.8 7.2 7.8 9.3 12 12 12zm0 2.4c-3.2 0-5.8 2.6-5.8 5.8v1h11.6v-1c0-3.2-2.6-5.8-5.8-5.8z"/>
      </svg>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

export const ReportMarker = ({ report, onClick }) => {
  const icon = useMemo(() => createIcon(report.severity || 'LOW_CONFIDENCE'), [report.severity]);
  return (
    <Marker
      position={[report.lat, report.lng]}
      icon={icon}
      eventHandlers={{ click: () => onClick && onClick(report) }}
    />
  );
};

export const ShelterMarker = ({ shelter, onClick }) => (
  <Marker
    position={[shelter.lat, shelter.lng]}
    icon={SHELTER_ICON}
    eventHandlers={{ click: () => onClick && onClick(shelter) }}
  />
);

export const LiveUserMarker = ({ user, onClick }) => {
  const icon = useMemo(() => {
    const html = `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <span style="position:absolute;width:36px;height:36px;border-radius:50%;background:rgba(6,182,212,0.4);animation:pulse-critical 2s infinite;"></span>
        <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg, #06b6d4, #3b82f6);border:2px solid #ffffff;box-shadow:0 0 10px rgba(6,182,212,0.8);display:flex;align-items:center;justify-content:center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 12c2.7 0 4.8-2.3 4.8-5.2S14.7 2 12 2 7.2 4.8 7.2 7.8 9.3 12 12 12zm0 2.4c-3.2 0-5.8 2.6-5.8 5.8v1h11.6v-1c0-3.2-2.6-5.8-5.8-5.8z"/>
          </svg>
        </div>
      </div>
    `;
    return L.divIcon({
      className: 'custom-live-user-icon',
      html,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });
  }, []);

  return (
    <Marker
      position={[user.lat, user.lng]}
      icon={icon}
      eventHandlers={{ click: () => onClick && onClick(user) }}
    />
  );
};

export const UserLocationMarker = ({ lat, lng }) => {
  const icon = useMemo(() => USER_ICON, []);
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], Math.max(map.getZoom(), 12), { animate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, map]);
  return <Marker position={[lat, lng]} icon={icon} />;
};

export const DangerZoneCircle = ({ zone }) => {
  if (!zone?.center) return null;
  const info = getSeverityInfo(zone.severity);
  return (
    <Circle
      center={[zone.center.lat, zone.center.lng]}
      radius={zone.radius_m}
      pathOptions={{
        color: info.color,
        fillColor: info.color,
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6 6',
      }}
    />
  );
};

export const SafeLocationCircle = ({ shelter }) => {
  if (!shelter) return null;
  return (
    <Circle
      center={[shelter.lat, shelter.lng]}
      radius={500}
      pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.1, weight: 1 }}
    />
  );
};

export const EvacuationRoutePolyline = ({ from, to }) => {
  if (!from || !to) return null;
  const positions = [
    [from.lat, from.lng],
    [to.lat, to.lng],
  ];
  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: '#22c55e',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8',
      }}
    />
  );
};
export const FitToReports = ({ reports, userPos }) => {
  const map = useMap();
  const positions = useMemo(() => {
    const pts = reports
      .filter((r) => r.lat != null && r.lng != null)
      .map((r) => [r.lat, r.lng]);
    if (userPos?.lat != null) pts.push([userPos.lat, userPos.lng]);
    return pts;
  }, [reports, userPos]);

  useEffect(() => {
    if (positions.length < 2) return;
    const group = L.featureGroup([]);
    positions.forEach((p) => group.addLayer(L.marker(p)));
    map.fitBounds(group.getBounds().pad(0.25));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions, map]);
  return null;
};

export const formatReportPopup = (r) => ({
  HTML: `
    <div style="font-family:inherit;color:#f8faff;min-width:180px">
      <div style="font-weight:700;text-transform:capitalize;margin-bottom:4px">${disasterLabel(r.disaster_type)}</div>
      <div style="font-size:12px;color:#cbd5e1">ID: ${r.id}</div>
      <div style="font-size:12px;color:#cbd5e1">Confidence: ${r.confidence_score ?? 0}%</div>
      <div style="font-size:12px;color:#cbd5e1">Severity: ${r.severity || 'LOW_CONFIDENCE'}</div>
      <div style="font-size:12px;color:#94a3b8;margin-top:4px">${r.description?.slice(0, 80) || ''}</div>
    </div>
  `,
});

export { createIcon };
