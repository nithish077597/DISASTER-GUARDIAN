import express from 'express';
import { getDb, persist } from '../config/db.js';

const router = express.Router();

const rowToObj = (cols, row) => Object.fromEntries(cols.map((c, i) => [c, row[i]]));

router.get('/', async (req, res) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM alert_acknowledgments ORDER BY acknowledged_at DESC');
  const cols = result[0]?.columns;
  const acks = (result[0]?.values || []).map(row => rowToObj(cols, row));
  res.json(acks);
});

router.get('/alert/:alertId', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM alert_acknowledgments WHERE alert_id = ${req.params.alertId} ORDER BY acknowledged_at DESC`);
  const cols = result[0]?.columns;
  const acks = (result[0]?.values || []).map(row => rowToObj(cols, row));
  res.json(acks);
});

router.get('/member/:memberId', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM alert_acknowledgments WHERE team_member_id = ${req.params.memberId} ORDER BY acknowledged_at DESC`);
  const cols = result[0]?.columns;
  const acks = (result[0]?.values || []).map(row => rowToObj(cols, row));
  res.json(acks);
});

router.post('/acknowledge', async (req, res) => {
  const db = await getDb();
  const { alert_id, team_member_id, note } = req.body;
  if (!alert_id || !team_member_id) {
    return res.status(400).json({ error: 'alert_id and team_member_id are required' });
  }

  const now = new Date().toISOString();
  db.run(`INSERT INTO alert_acknowledgments (alert_id, team_member_id, acknowledged_at, note) VALUES (${alert_id}, ${team_member_id}, '${now}', '${(note || '').replace(/'/g, "''")}')`);
  persist();

  const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
  const id = lastIdResult[0]?.values[0]?.[0] || 0;

  res.status(201).json({ id, alert_id, team_member_id, acknowledged_at: now, note: note || '' });
});

export default router;
