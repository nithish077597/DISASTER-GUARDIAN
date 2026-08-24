import { useEffect } from 'react';
import { Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getSeverityInfo } from '../utils/helpers';

const createIcon = (severity, large = false) => {
  const info = getSeverityInfo(severity);
  const size = large ? [42, 42] : [34, 34];
  const html = `
    <div style="
      width:${size[0]}px;height:${size[1]}px;border-radius:50%;
      background:${info.color};border:2px solid rgba(15,23,42,0.6);
      box-shadow:0 0 ${large ? 12 : 6}px ${large ? 4 : 2}px ${info.color}80;
      display:flex;align-items:center;justify-content:center;
      ${severity === 'CRITICAL' ? 'animation:pulse-critical 2s ease-in-out infinite;' : ''}
    "><svg xmlns="http://www.w3.org/2000/svg" width="${large ? 18 : 14}" height="${large ? 18 : 14}" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg></div>`;
  return L.divIcon({ className: 'custom-div-icon', html, iconSize: size, iconAnchor: [size[0] / 2, size[1]], popupAnchor: [0, -size[1]] });
};

const SHELTER_ICON = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="width:32px;height:32px;border-radius:6px;background:rgba(34,197,94,0.95);border:2px solid rgba(15,23,42,0.7);box-shadow:0 0 12px 4px rgba(34,197,94,0.5);display:flex;align-items:center;justify-content:center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 3L3 9v12h7v-6h4v6h7V9l-9-6z"/></svg></div>`,
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
});

export const LiveUserMarker = ({ user, onClick }) => {
  const html = `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;">
      <span style="position:absolute;width:34px;height:34px;border-radius:50%;background:rgba(6,182,212,0.4);animation:pulse-critical 2s infinite;"></span>
      <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg, #06b6d4, #3b82f6);border:2px solid #ffffff;box-shadow:0 0 10px rgba(6,182,212,0.8);display:flex;align-items:center;justify-content:center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 12c2.7 0 4.8-2.3 4.8-5.2S14.7 2 12 2 7.2 4.8 7.2 7.8 9.3 12 12 12zm0 2.4c-3.2 0-5.8 2.6-5.8 5.8v1h11.6v-1c0-3.2-2.6-5.8-5.8-5.8z"/>
        </svg>
      </div>
    </div>
  `;
  const icon = L.divIcon({ className: 'custom-live-user-icon', html, iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -17] });
  return <Marker position={[user.lat, user.lng]} icon={icon} eventHandlers={{ click: () => onClick && onClick(user) }} />;
};

export const ReportMarker = ({ report, onClick }) => (
  <Marker position={[report.lat, report.lng]} icon={createIcon(report.severity || 'LOW_CONFIDENCE')} eventHandlers={{ click: () => onClick && onClick(report) }} />
);

export const ShelterMarker = ({ shelter }) => (
  <Marker position={[shelter.lat, shelter.lng]} icon={SHELTER_ICON} />
);

export const DangerZoneCircle = ({ zone }) => {
  if (!zone?.center) return null;
  const info = getSeverityInfo(zone.severity);
  return <Circle center={[zone.center.lat, zone.center.lng]} radius={zone.radius_m} pathOptions={{ color: info.color, fillColor: info.color, fillOpacity: 0.1, weight: 1.5, dashArray: '5 6' }} />;
};

export const FitMap = ({ reports, shelterPoints = [] }) => {
  const map = useMap();
  useEffect(() => {
    const points = [
      ...reports.filter((r) => r.lat != null).map((r) => [r.lat, r.lng]),
      ...shelterPoints,
    ];
    if (points.length < 2) return;
    const group = L.featureGroup([]);
    points.forEach((p) => group.addLayer(L.marker(p)));
    map.fitBounds(group.getBounds().pad(0.25));
  }, [reports, shelterPoints, map]);
  return null;
};
