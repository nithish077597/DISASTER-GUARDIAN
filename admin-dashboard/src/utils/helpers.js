export const DISASTER_TYPES = [
  { value: 'FLOOD', label: 'Flood', color: '#3b82f6' },
  { value: 'FIRE', label: 'Fire', color: '#ef4444' },
  { value: 'LANDSLIDE', label: 'Landslide', color: '#94a3b8' },
  { value: 'CYCLONE', label: 'Cyclone', color: '#8b5cf6' },
  { value: 'EARTHQUAKE', label: 'Earthquake', color: '#f59e0b' },
  { value: 'ACCIDENT', label: 'Accident', color: '#f97316' },
  { value: 'OTHER', label: 'Other', color: '#94a3b8' },
];

export const SEVERITY = {
  LOW_CONFIDENCE: { label: 'Low Confidence', color: '#22c55e' },
  CONFIRMED: { label: 'Confirmed', color: '#f59e0b' },
  HIGH_RISK: { label: 'High Risk', color: '#f97316' },
  CRITICAL: { label: 'Critical', color: '#ef4444' },
};

export const getSeverityInfo = (severity) => SEVERITY[severity] || SEVERITY.LOW_CONFIDENCE;

export const getRiskLevel = (report) => {
  const conf = report?.confidence_score || 0;
  if (report?.severity === 'CRITICAL' || conf >= 81) return 'CRITICAL';
  if (report?.severity === 'HIGH_RISK' || conf >= 61) return 'HIGH_RISK';
  if (report?.severity === 'CONFIRMED' || conf >= 31) return 'CONFIRMED';
  return 'LOW_CONFIDENCE';
};

export const formatDistance = (km) => { if (km == null || isNaN(km)) return '???'; if (km < 1) return `${Math.round(km * 1000)} m`; return `${km.toFixed(1)} km`; };
export const formatTime = (iso) => { if (!iso) return '???'; try { return new Date(iso).toLocaleString(); } catch { return iso; } };
export const timeAgo = (iso) => { if (!iso) return '???'; try { const d = Date.now() - new Date(iso).getTime(); const m = Math.floor(d/60000), h = Math.floor(d/3600000), dd = Math.floor(d/86400000); if (dd>0) return `${dd}d ago`; if (h>0) return `${h}h ago`; if (m>0) return `${m}m ago`; return 'just now'; } catch { return '???'; } };
export const haversineKm = (lat1, lon1, lat2, lon2) => { const R=6371; const dLat=((lat2-lat1)*Math.PI)/180; const dLon=((lon2-lon1)*Math.PI)/180; const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2; return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); };
export const disasterLabel = (type) => DISASTER_TYPES.find((d) => d.value === type)?.label || type || 'Unknown';
export const estimateTravelTime = (km) => { if (km == null || isNaN(km)) return '???'; const mins = Math.max(1, Math.round(km*6)); if (mins<60) return `${mins} min`; return `${(mins/60).toFixed(1)} h`; };
export const severityRank = (severity) => ({ CRITICAL: 4, HIGH_RISK: 3, CONFIRMED: 2, LOW_CONFIDENCE: 1 }[severity] || 0);

export const CHANNEL_LABELS = { APP: 'App', SMS: 'SMS', VOICE: 'Voice', GATEWAY: 'Hardware Gateway' };
export const ALERT_CHANNELS = {
  LOW_CONFIDENCE: ['APP'],
  CONFIRMED: ['APP'],
  HIGH_RISK: ['APP', 'SMS'],
  CRITICAL: ['APP', 'SMS', 'VOICE', 'GATEWAY'],
};
