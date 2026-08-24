import express from 'express';
import { getDb, persist } from '../config/db.js';

const router = express.Router();

const DANGER_RADIUS = {
  FLOOD: { LOW_CONFIDENCE: 500, CONFIRMED: 1000, HIGH_RISK: 2000, CRITICAL: 4000 },
  LANDSLIDE: { LOW_CONFIDENCE: 300, CONFIRMED: 700, HIGH_RISK: 1500, CRITICAL: 3000 },
};

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const rowToObj = (cols, row) => Object.fromEntries(cols.map((c, i) => [c, row[i]]));

router.get('/danger-zone/:reportId', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM reports WHERE id = ${req.params.reportId}`);
  const cols = result[0]?.columns;
  const row = result[0]?.values[0];
  const report = row ? rowToObj(cols, row) : null;
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const radius = DANGER_RADIUS[report.disaster_type]?.[report.severity] || 500;
  res.json({
    center: { lat: report.lat, lng: report.lng },
    radius_m: radius,
    disaster_type: report.disaster_type,
    severity: report.severity,
  });
});

router.get('/safe-locations/:reportId', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM reports WHERE id = ${req.params.reportId}`);
  const cols = result[0]?.columns;
  const row = result[0]?.values[0];
  const report = row ? rowToObj(cols, row) : null;
  if (!report) return res.status(404).json({ error: 'Report not found' });

  const radius = (DANGER_RADIUS[report.disaster_type]?.[report.severity] || 500) / 1000;
  const shelterResult = db.exec('SELECT * FROM shelters');
  const shelterCols = shelterResult[0]?.columns;
  const shelters = (shelterResult[0]?.values || []).map(row => rowToObj(shelterCols, row));
  const safe = shelters
    .filter(s => s.disaster_types.includes(report.disaster_type))
    .map(s => ({
      ...s,
      distance_km: haversineKm(report.lat, report.lng, s.lat, s.lng),
    }))
    .filter(s => s.distance_km > radius)
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, 5);

  res.json(safe);
});

router.get('/users-at-risk/:reportId', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM reports WHERE id = ${req.params.reportId}`);
  const cols = result[0]?.columns;
  const row = result[0]?.values[0];
  const report = row ? rowToObj(cols, row) : null;
  if (!report) return res.status(404).json({ error: 'Report not found' });

  const radius = (DANGER_RADIUS[report.disaster_type]?.[report.severity] || 500) / 1000;
  const userResult = db.exec('SELECT * FROM users');
  const userCols = userResult[0]?.columns;
  const users = (userResult[0]?.values || []).map(row => rowToObj(userCols, row));
  const atRisk = users
    .map(u => ({ ...u, distance_km: haversineKm(report.lat, report.lng, u.lat, u.lng) }))
    .filter(u => u.distance_km <= radius);

  res.json(atRisk);
});

export default router;
