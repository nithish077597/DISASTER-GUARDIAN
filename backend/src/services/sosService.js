import { getDb, persist } from '../config/db.js';
import { sendAlert } from './alertService.js';

/* =====================================================
   EMERGENCY SOS SERVICE
   Core feature: when a disaster's severity reaches
   CRITICAL, identify every citizen inside the danger
   zone (geofence around the epicentre) and trigger the
   full emergency alert/call workflow (APP + SMS +
   VOICEMAIL + CALL + GATEWAY siren).

   Danger-zone radius defaults vary by disaster type and
   are configurable per trigger request.
===================================================== */

// CRITICAL channel ladder (kept local to avoid a circular import with emergencyService)
const CATEGORY_CHANNELS_CRITICAL = ['APP', 'SMS', 'VOICEMAIL', 'CALL', 'GATEWAY'];

// Map legacy severity labels to the 4 emergency categories
const normalizeCategory = (severity) => {
  const value = String(severity || '').toUpperCase();
  if (value === 'CRITICAL') return 'CRITICAL';
  if (value === 'HIGH_RISK' || value === 'HIGH' || value === 'RISK') return 'RISK';
  if (value === 'CONFIRMED' || value === 'HIGH') return 'HIGH';
  return 'NORMAL';
};

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* Per-disaster-type danger-zone radius (km) when severity is CRITICAL */
export const CRITICAL_DANGER_RADIUS_KM = {
  FLOOD: 5,
  LANDSLIDE: 4,
  EARTHQUAKE: 6,
  CYCLONE: 8,
  WILDFIRE: 5,
  DEFAULT: 5,
};

const rowToObj = (cols, row) => Object.fromEntries(cols.map((c, i) => [c, row[i]]));

/* Resolve the effective danger-zone radius for a disaster */
export const resolveDangerRadiusKm = (disasterType, overrideKm) => {
  if (Number.isFinite(Number(overrideKm)) && Number(overrideKm) > 0) {
    return Number(overrideKm);
  }
  const key = String(disasterType || '').toUpperCase();
  return CRITICAL_DANGER_RADIUS_KM[key] || CRITICAL_DANGER_RADIUS_KM.DEFAULT;
};

/* Identify every registered citizen inside the danger zone (geofence) */
export const identifyDangerZoneUsers = async ({ lat, lng, radiusKm = 5 }) => {
  const db = await getDb();
  const result = db.exec('SELECT id, name, phone, lat, lng, location FROM users');
  if (!result[0]) return [];

  const cols = result[0].columns;
  const idIdx = cols.indexOf('id');
  const nameIdx = cols.indexOf('name');
  const phoneIdx = cols.indexOf('phone');
  const latIdx = cols.indexOf('lat');
  const lngIdx = cols.indexOf('lng');
  const locIdx = cols.indexOf('location');

  const centerLat = Number(lat);
  const centerLng = Number(lng);

  const users = [];
  for (const row of result[0].values) {
    const uLat = Number(row[latIdx]);
    const uLng = Number(row[lngIdx]);
    if (!Number.isFinite(uLat) || !Number.isFinite(uLng)) continue;

    const distanceKm = haversineKm(centerLat, centerLng, uLat, uLng);
    if (distanceKm <= radiusKm) {
      users.push({
        id: row[idIdx],
        name: row[nameIdx],
        phone: row[phoneIdx],
        lat: uLat,
        lng: uLng,
        location: locIdx >= 0 ? row[locIdx] : null,
        distanceKm: Number(distanceKm.toFixed(2)),
      });
    }
  }

  return users.sort((a, b) => a.distanceKm - b.distanceKm);
};

const buildSosMessage = ({ disasterType, lat, lng, locationName, affectedCount }) => {
  const where = locationName || `${lat}, ${lng}`;
  return (
    `EMERGENCY SOS // CRITICAL ${disasterType} near ${where}. ` +
    `${affectedCount} citizen(s) detected inside the danger zone. ` +
    `Immediate evacuation advised. Emergency response team has been dispatched. ` +
    `If trapped, call 112 (NDRF). Stay calm and move to higher safe ground.`
  );
};

/* List historical SOS events (newest first) */
export const listSosEvents = async () => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM sos_events ORDER BY triggered_at DESC LIMIT 100');
  if (!result[0]) return [];
  const cols = result[0].columns;
  return result[0].values.map((row) => rowToObj(cols, row));
};

/* =====================================================
   MAIN ENTRY: trigger the emergency SOS call workflow.
   Only fires the full CRITICAL channel ladder
   (APP + SMS + VOICEMAIL + CALL + GATEWAY) when the
   disaster severity normalizes to CRITICAL.
===================================================== */
export const triggerSosWorkflow = async ({
  reportId = null,
  lat = null,
  lng = null,
  disasterType = 'DISASTER',
  severity = 'CRITICAL',
  radiusKm = null,
  locationName = null,
  message = null,
  source = 'SYSTEM',
  triggeredBy = null,
} = {}) => {
  const db = await getDb();

  // If a report is referenced, hydrate coordinates/type/severity from it.
  let report = null;
  if (reportId != null) {
    const res = db.exec(`SELECT * FROM reports WHERE id = ${Number(reportId) || 0}`);
    if (res[0]?.values[0]) report = rowToObj(res[0].columns, res[0].values[0]);
    if (report) {
      lat = lat ?? Number(report.lat);
      lng = lng ?? Number(report.lng);
      disasterType = disasterType || report.disaster_type;
      severity = severity || report.severity || 'CRITICAL';
      locationName = locationName || report.location_description || report.location_status;
    }
  }

  const centerLat = Number(lat);
  const centerLng = Number(lng);
  if (!Number.isFinite(centerLat) || !Number.isFinite(centerLng)) {
    throw new Error('Valid disaster epicentre coordinates (lat, lng) are required to trigger SOS.');
  }

  const category = normalizeCategory(severity);

  // The emergency call workflow only runs for CRITICAL severity disasters.
  if (category !== 'CRITICAL') {
    return {
      triggered: false,
      reason: 'SOS call workflow is reserved for CRITICAL severity disasters only.',
      category,
      severity,
      disasterType,
      lat: centerLat,
      lng: centerLng,
    };
  }

  const effectiveRadiusKm = resolveDangerRadiusKm(disasterType, radiusKm);
  const affected = await identifyDangerZoneUsers({
    lat: centerLat,
    lng: centerLng,
    radiusKm: effectiveRadiusKm,
  });

  const channels = CATEGORY_CHANNELS_CRITICAL; // APP, SMS, VOICEMAIL, CALL, GATEWAY
  const finalMessage =
    message || buildSosMessage({ disasterType, lat: centerLat, lng: centerLng, locationName, affectedCount: affected.length });
  const recipients = affected.map((u) => ({ name: u.name, phone: u.phone }));

  // Dispatch the emergency alert/call workflow across all CRITICAL channels.
  const dispatch = await sendAlert(
    channels,
    { id: reportId, lat: centerLat, lng: centerLng, disaster_type: disasterType, reporter_id: source, severity: 'CRITICAL' },
    finalMessage,
    recipients
  );

  const triggeredAt = new Date().toISOString();
  const esc = (s) => String(s ?? '').replace(/'/g, "''");

  db.run(
    `INSERT INTO sos_events (report_id, disaster_type, lat, lng, radius_km, severity, message, triggered_at, affected_count, source) ` +
    `VALUES (${Number(reportId) || 0}, '${esc(disasterType)}', ${centerLat}, ${centerLng}, ${effectiveRadiusKm}, 'CRITICAL', '${esc(finalMessage)}', '${triggeredAt}', ${affected.length}, '${esc(source)}')`
  );

  const lastIdResult = db.exec('SELECT MAX(id) as id FROM sos_events');
  const sosId = lastIdResult[0]?.values[0]?.[0] || 0;
  persist();

  // Persist each affected citizen so responders can track outreach.
  if (affected.length > 0) {
    const stmt = db.prepare(
      'INSERT INTO sos_affected_users (sos_event_id, user_id, name, phone, distance_km, channels) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const u of affected) {
      stmt.run([sosId, String(u.id ?? ''), String(u.name ?? ''), String(u.phone ?? ''), u.distanceKm, JSON.stringify(channels)]);
    }
    stmt.free();
    persist();
  }

  return {
    triggered: true,
    sos_event_id: sosId,
    category,
    severity: 'CRITICAL',
    disasterType,
    lat: centerLat,
    lng: centerLng,
    locationName: locationName || null,
    radiusKm: effectiveRadiusKm,
    affectedCount: affected.length,
    affectedUsers: affected,
    channels,
    message: finalMessage,
    dispatch,
    triggeredAt,
    source,
  };
};

export default { identifyDangerZoneUsers, triggerSosWorkflow, listSosEvents, resolveDangerRadiusKm };
