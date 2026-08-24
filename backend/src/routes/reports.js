import express from 'express';
import { getDb, persist } from '../config/db.js';

const router = express.Router();

const rowToObj = (cols, row) => Object.fromEntries(cols.map((c, i) => [c, row[i]]));

router.post('/', async (req, res) => {
  const db = await getDb();
  const { disaster_type, lat, lng, description, timestamp, photo_url, reporter_id } = req.body;
  if (!disaster_type || lat == null || lng == null || !reporter_id) {
    return res.status(400).json({ error: 'disaster_type, lat, lng, reporter_id are required' });
  }
  const stmt = db.prepare('INSERT INTO reports (disaster_type, lat, lng, description, timestamp, photo_url, reporter_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run([disaster_type, lat, lng, description || '', timestamp || new Date().toISOString(), photo_url || '', reporter_id]);
  persist();
  const result = db.exec('SELECT * FROM reports ORDER BY id DESC LIMIT 1');
  const cols = result[0]?.columns;
  const row = result[0]?.values[0];
  const report = row ? rowToObj(cols, row) : {};
  res.status(201).json(report);
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
  res.json(report);
});

export default router;
