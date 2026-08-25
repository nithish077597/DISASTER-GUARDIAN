import express from 'express';
import { getDb } from '../config/db.js';
import { triggerSosWorkflow, identifyDangerZoneUsers, listSosEvents } from '../services/sosService.js';

const router = express.Router();

/* Trigger the emergency SOS call workflow.
   Body (any combination):
     - reportId            : existing report whose coordinates/severity are used
     - lat, lng            : disaster epicentre
     - disasterType        : FLOOD | LANDSLIDE | ...
     - severity            : must be CRITICAL to fire the call workflow
     - radiusKm            : override danger-zone radius
     - locationName, message, source, triggeredBy
*/
router.post('/trigger', async (req, res) => {
  try {
    const result = await triggerSosWorkflow(req.body || {});
    if (!result.triggered) {
      return res.status(200).json(result);
    }
    return res.status(201).json(result);
  } catch (err) {
    console.error('SOS trigger failed:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

/* Preview which citizens fall inside the danger zone (no alerts sent) */
router.get('/danger-zone', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Number(req.query.radiusKm);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: 'lat and lng query params are required' });
    }
    const users = await identifyDangerZoneUsers({ lat, lng, radiusKm });
    return res.json({ center: { lat, lng }, radiusKm: Number.isFinite(radiusKm) ? radiusKm : 5, count: users.length, users });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* List historical SOS events */
router.get('/events', async (req, res) => {
  try {
    return res.json(await listSosEvents());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* Affected citizens for a specific SOS event */
router.get('/events/:id/affected', async (req, res) => {
  try {
    const database = await getDb();
    const result = database.exec(`SELECT * FROM sos_affected_users WHERE sos_event_id = ${Number(req.params.id) || 0}`);
    if (!result[0]) return res.json([]);
    const cols = result[0].columns;
    const rows = result[0].values.map((row) => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
