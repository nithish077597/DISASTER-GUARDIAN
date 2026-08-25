import express from 'express';
import { getDb, persist } from '../config/db.js';
import { evaluateAndDispatchReport } from '../services/emergencyService.js';
import { triggerSosWorkflow } from '../services/sosService.js';

const router = express.Router();

const rowToObj = (cols, row) => Object.fromEntries(cols.map((c, i) => [c, row[i]]));

router.post('/', async (req, res) => {
  const db = await getDb();
  const {
  disaster_type,
  lat,
  lng,
  description,
  timestamp,
  photo_url,
  reporter_id,
  report_type,
  location_status,
  location_description,
  location_source,
  people_count,
  injury_status,
  situation,
  priority_score,
  priority_level,
  verification_level
} = req.body;
  if (!disaster_type || !reporter_id)  {
    return res.status(400).json({ error: 'disaster_type, lat, lng, reporter_id are required' });
  }
  const stmt = db.prepare(`
  INSERT INTO reports (
    disaster_type,
    lat,
    lng,
    description,
    timestamp,
    photo_url,
    reporter_id,
    report_type,
    location_status,
    location_description,
    location_source,
    people_count,
    injury_status,
    situation,
    priority_score,
    priority_level,
    verification_level
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

stmt.run([
  disaster_type,
  lat ?? null,
  lng ?? null,
  description || '',
  timestamp || new Date().toISOString(),
  photo_url || '',
  reporter_id,
  report_type || 'CITIZEN_REPORT',
  location_status || 'KNOWN',
  location_description || '',
  location_source || '',
  people_count ?? null,
  injury_status || 'UNKNOWN',
  situation || '',
  priority_score ?? 0,
  priority_level || 'UNKNOWN',
  verification_level || 'REPORTED'
]);
  persist();
  const result = db.exec('SELECT * FROM reports ORDER BY id DESC LIMIT 1');
  const cols = result[0]?.columns;
  const row = result[0]?.values[0];
  const report = row ? rowToObj(cols, row) : {};

  // Auto-evaluate: publish live news (real photo + >3 reporters) or send category notifications
  const evaluation = await evaluateAndDispatchReport(report);

  res.status(201).json({ ...report, emergency: evaluation });
});

router.get('/', async (req, res) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM reports ORDER BY timestamp DESC');
  const cols = result[0]?.columns;
  const reports = (result[0]?.values || []).map(row => rowToObj(cols, row));
  res.json(reports);
});

router.get('/:id', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM reports WHERE id = ${req.params.id}`);
  const cols = result[0]?.columns;
  const row = result[0]?.values[0];
  const report = row ? rowToObj(cols, row) : null;
  if (!report) return res.status(404).json({ error: 'Not found' });
  res.json(report);
});

router.patch('/:id', async (req, res) => {
  const db = await getDb();
  const { status, severity, confidence_score } = req.body;
  const fields = [];
  const values = [];
  if (status) { fields.push('status = ?'); values.push(status); }
  if (severity) { fields.push('severity = ?'); values.push(severity); }
  if (confidence_score != null) { fields.push('confidence_score = ?'); values.push(confidence_score); }
  if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);
  const stmt = db.prepare(`UPDATE reports SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(values);
  persist();
  const result = db.exec(`SELECT * FROM reports WHERE id = ${req.params.id}`);
  const cols = result[0]?.columns;
  const row = result[0]?.values[0];
  const report = row ? rowToObj(cols, row) : {};

  // AUTO-TRIGGER: when a disaster reaches CRITICAL severity, identify citizens
  // inside the danger zone and run the emergency alert/call workflow.
  let sos = null;
  if (severity && String(severity).toUpperCase() === 'CRITICAL') {
    try {
      sos = await triggerSosWorkflow({ reportId: req.params.id, severity: 'CRITICAL' });
    } catch (err) {
      sos = { error: err.message };
    }
  }

  res.json({ ...report, sos });
});

router.post('/:id/escalate', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM reports WHERE id = ${req.params.id}`);
  if (!result[0]?.values[0]) return res.status(404).json({ error: 'Report not found' });
  const cols = result[0]?.columns;
  const row = result[0]?.values[0];
  const report = rowToObj(cols, row);
  const updated = { ...report, status: 'ESCALATED', severity: report.severity || 'HIGH_RISK' };
  const stmt = db.prepare(`UPDATE reports SET status = ?, severity = ? WHERE id = ?`);
  stmt.run([updated.status, updated.severity, req.params.id]);
  stmt.free();
  persist();
  res.json(updated);
});

router.post('/:id/dismiss', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM reports WHERE id = ${req.params.id}`);
  if (!result[0]?.values[0]) return res.status(404).json({ error: 'Report not found' });
  const cols = result[0]?.columns;
  const row = result[0]?.values[0];
  const report = rowToObj(cols, row);
  const updated = { ...report, status: 'FALSE_REPORT' };
  const stmt = db.prepare(`UPDATE reports SET status = ? WHERE id = ?`);
  stmt.run([updated.status, req.params.id]);
  stmt.free();
  persist();
  res.json(updated);
});

export default router;
