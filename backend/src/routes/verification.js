import express from 'express';
import axios from 'axios';
import { getDb, persist } from '../config/db.js';

const router = express.Router();

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const fetchRainfall = async (lat, lng) => {
  try {
    const url = `https://api.open-meteo.com/api/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum&timezone=auto&forecast_days=1`;
    const res = await axios.get(url);
    const today = res.data.daily?.time?.[0];
    const precipitation = res.data.daily?.precipitation_sum?.[0] || 0;
    return { date: today, precipitation_mm: precipitation };
  } catch (err) {
    console.error('Open-Meteo fetch failed', err.message);
    return { date: null, precipitation_mm: 0 };
  }
};

const computeConfidence = (db, report) => {
  const { lat, lng, disaster_type, timestamp } = report;
  let score = 0;

  let sixHoursAgo;
  try {
    sixHoursAgo = new Date(new Date(timestamp).getTime() - 6 * 60 * 60 * 1000).toISOString();
  } catch {
    sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  }

  const safeId = report.id || 0;
  const safeType = disaster_type || '';
  const safeTs = sixHoursAgo || '';
  const safeLat = lat || 0;
  const safeLng = lng || 0;
  const sql = `SELECT * FROM reports WHERE id != ${safeId} AND disaster_type = '${safeType.replace(/'/g, "''")}' AND timestamp >= '${safeTs.replace(/'/g, "''")}' AND ABS(lat - ${safeLat}) < 0.03 AND ABS(lng - ${safeLng}) < 0.03`;
  const result = db.exec(sql);
  const cols = result[0]?.columns;
  const nearby = (result[0]?.values || []).map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
  const validNearby = nearby.filter(r => haversineKm(lat, lng, r.lat, r.lng) <= 2);
  if (validNearby.length >= 5) score += 30;
  else if (validNearby.length >= 2) score += 15;

  return score;
};

router.post('/:id/score', async (req, res) => {
  const db = await getDb();
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  const weather = await fetchRainfall(report.lat, report.lng);
  let score = computeConfidence(db, report);

  if (weather.precipitation_mm >= 50) score += 40;
  else if (weather.precipitation_mm >= 20) score += 20;

  score = Math.min(score + 10, 100);

  let severity = 'LOW_CONFIDENCE';
  if (score >= 81) severity = 'CRITICAL';
  else if (score >= 61) severity = 'HIGH_RISK';
  else if (score >= 31) severity = 'CONFIRMED';

  const stmt = db.prepare('UPDATE reports SET confidence_score = ?, severity = ? WHERE id = ?');
  stmt.run(score, severity, report.id);
  persist();

  const updated = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
  res.json({ ...updated, weather });
});

router.get('/', async (req, res) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM reports ORDER BY timestamp DESC');
  const cols = result[0]?.columns;
  const reports = (result[0]?.values || []).map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
  res.json(reports);
});

export default router;
