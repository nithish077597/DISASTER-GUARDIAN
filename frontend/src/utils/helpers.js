export const DISASTER_TYPES = [
  { value: 'FLOOD', label: 'Flood', color: '#3b82f6', icon: '🌊' },
  { value: 'FIRE', label: 'Fire', color: '#ef4444', icon: '🔥' },
  { value: 'LANDSLIDE', label: 'Landslide', color: '#a8a29e', icon: '⛰️' },
  { value: 'CYCLONE', label: 'Cyclone', color: '#8b5cf6', icon: '🌀' },
  { value: 'EARTHQUAKE', label: 'Earthquake', color: '#f59e0b', icon: '🌍' },
  { value: 'ACCIDENT', label: 'Accident', color: '#f97316', icon: '🚒' },
  { value: 'OTHER', label: 'Other', color: '#94a3b8', icon: '⚠️' },
];

export const SEVERITY = {
  LOW_CONFIDENCE: { label: 'Low Confidence', color: '#3b82f6', colorClass: 'bg-blue-500', dot: '🔵' },
  CONFIRMED: { label: 'Confirmed', color: '#eab308', colorClass: 'bg-yellow-500', dot: '🟡' },
  HIGH_RISK: { label: 'High Risk', color: '#f97316', colorClass: 'bg-orange-500', dot: '🟠' },
  CRITICAL: { label: 'Critical', color: '#ef4444', colorClass: 'bg-red-500', dot: '🔴' },
};

export const getSeverityInfo = (severity) => SEVERITY[severity] || SEVERITY.LOW_CONFIDENCE;

export const getRiskLevel = (report) => {
  const conf = report?.confidence_score || 0;
  if (report?.severity === 'CRITICAL' || conf >= 81) return 'CRITICAL';
  if (report?.severity === 'HIGH_RISK' || conf >= 61) return 'HIGH_RISK';
  if (report?.severity === 'CONFIRMED' || conf >= 31) return 'CONFIRMED';
  return 'LOW_CONFIDENCE';
};

export const getSafetyStatus = (reports) => {
  if (!reports || !reports.length) return { status: 'SAFE', label: 'YOU ARE SAFE', color: '#22c55e' };
  const critical = reports.some((r) => getRiskLevel(r) === 'CRITICAL');
  const high = reports.some((r) => getRiskLevel(r) === 'HIGH_RISK');
  if (critical) return { status: 'CRITICAL', label: 'CRITICAL RISK', color: '#ef4444' };
  if (high) return { status: 'HIGH_RISK', label: 'HIGH RISK', color: '#f97316' };
  return { status: 'SAFE', label: 'YOU ARE SAFE', color: '#22c55e' };
};

export const formatDistance = (km) => {
  if (km == null || isNaN(km)) return '—';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

export const formatTime = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export const timeAgo = (iso) => {
  if (!iso) return '—';
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'just now';
  } catch {
    return '—';
  }
};

export const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const nearestLocation = (locations, lat, lng) => {
  if (!locations?.length) return null;
  return locations.reduce((best, cur) => {
    if (!best) return cur;
    const bd = haversineKm(lat, lng, best.lat, best.lng);
    const cd = haversineKm(lat, lng, cur.lat, cur.lng);
    return cd < bd ? cur : best;
  }, null);
};

export const disasterLabel = (type) => DISASTER_TYPES.find((d) => d.value === type)?.label || type || 'Unknown';

export const estimateTravelTime = (distanceKm) => {
  if (distanceKm == null || isNaN(distanceKm)) return '—';
  const mins = Math.max(1, Math.round(distanceKm * 6));
  if (mins < 60) return `${mins} min`;
  return `${(mins / 60).toFixed(1)} h`;
};
