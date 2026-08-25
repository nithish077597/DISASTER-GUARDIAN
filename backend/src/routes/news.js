import express from 'express';
import { getDb } from '../config/db.js';

const router = express.Router();

const SEVERITY_ORDER = { CRITICAL: 4, RISK: 3, HIGH: 2, NORMAL: 1 };

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* =====================================================
   LIVE NEWS FEED
   Published news items (real photo evidence + >3 citizen
   reporters), ranked by category severity then recency.
   Optional ?lat=&lng=&radius_km= filters to the citizen's
   surrounding area (default radius 100 km).
===================================================== */
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const lat = req.query.lat != null ? Number(req.query.lat) : null;
    const lng = req.query.lng != null ? Number(req.query.lng) : null;
    const radiusKm = req.query.radius_km != null ? Number(req.query.radius_km) : 100;

    let sql = `
      SELECT r.id, r.disaster_type, r.description, r.timestamp, r.photo_url,
             r.lat, r.lng, r.location_description, r.confidence_score,
             r.category, r.news_published, r.distinct_reporters,
             r.photo_verified, r.reporter_id
      FROM reports r
      WHERE r.news_published = 1
      ORDER BY r.timestamp DESC
      LIMIT 100
    `;

    const result = db.exec(sql);
    const cols = result[0]?.columns || [];
    let news = (result[0]?.values || []).map((row) =>
      Object.fromEntries(cols.map((c, i) => [c, row[i]]))
    );

    // Proximity filter around the citizen's live location
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      news = news.filter((n) => {
        const nLat = Number(n.lat);
        const nLng = Number(n.lng);
        if (!Number.isFinite(nLat) || !Number.isFinite(nLng)) return true;
        return haversineKm(lat, lng, nLat, nLng) <= radiusKm;
      });
    }

    // Rank by category severity first, then newest
    news.sort((a, b) => {
      const sevDiff = (SEVERITY_ORDER[b.category] || 1) - (SEVERITY_ORDER[a.category] || 1);
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    res.json(news);
  } catch (error) {
    console.error('Error building live news feed:', error);
    res.status(500).json({ error: 'Failed to load live news' });
  }
});

export default router;
