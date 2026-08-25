import express from 'express';
import { getDb, persist } from '../config/db.js';

const router = express.Router();

const rowToObj = (cols, row) => Object.fromEntries(cols.map((c, i) => [c, row[i]]));

router.get('/', async (req, res) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM alert_escalations ORDER BY triggered_at DESC');
  const cols = result[0]?.columns;
  const escalations = (result[0]?.values || []).map(row => rowToObj(cols, row));
  res.json(escalations);
});

router.get('/alert/:alertId', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM alert_escalations WHERE alert_id = ${req.params.alertId} ORDER BY triggered_at DESC`);
  const cols = result[0]?.columns;
  const escalations = (result[0]?.values || []).map(row => rowToObj(cols, row));
  res.json(escalations);
});

router.post('/escalate', async (req, res) => {
  const db = await getDb();
  const { alert_id, from_level, to_level, reason } = req.body;
  if (!alert_id || !to_level) {
    return res.status(400).json({ error: 'alert_id and to_level are required' });
  }

  const now = new Date().toISOString();
  const fromLvl = from_level || 1;
  db.run(`INSERT INTO alert_escalations (alert_id, from_level, to_level, triggered_at, reason) VALUES (${alert_id}, ${fromLvl}, ${to_level}, '${now}', '${(reason || '').replace(/'/g, "''")}')`);
  persist();

  const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
  const id = lastIdResult[0]?.values[0]?.[0] || 0;

  res.status(201).json({ id, alert_id, from_level: fromLvl, to_level, triggered_at: now, reason: reason || '' });
});

export default router;
