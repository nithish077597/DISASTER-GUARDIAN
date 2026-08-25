import express from 'express';
import { getDb, persist } from '../config/db.js';

const router = express.Router();

const rowToObj = (cols, row) => Object.fromEntries(cols.map((c, i) => [c, row[i]]));

router.get('/', async (req, res) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM alert_rules ORDER BY id DESC');
  const cols = result[0]?.columns;
  const rules = (result[0]?.values || []).map(row => {
    const obj = rowToObj(cols, row);
    try { obj.team_member_ids = JSON.parse(obj.team_member_ids); } catch { obj.team_member_ids = []; }
    try { obj.channels = JSON.parse(obj.channels); } catch { obj.channels = []; }
    return obj;
  });
  res.json(rules);
});

router.get('/:id', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM alert_rules WHERE id = ${req.params.id}`);
  const cols = result[0]?.columns;
  const row = result[0]?.values[0];
  if (!row) return res.status(404).json({ error: 'Alert rule not found' });
  const obj = rowToObj(cols, row);
  try { obj.team_member_ids = JSON.parse(obj.team_member_ids); } catch { obj.team_member_ids = []; }
  try { obj.channels = JSON.parse(obj.channels); } catch { obj.channels = []; }
  res.json(obj);
});

router.post('/', async (req, res) => {
  const db = await getDb();
  const { name, severity, channels, team_member_ids, escalation_delay_minutes } = req.body;
  if (!name || !severity) {
    return res.status(400).json({ error: 'name and severity are required' });
  }

  const now = new Date().toISOString();
  const memberIds = JSON.stringify(team_member_ids || []);
  const channelList = JSON.stringify(channels || ['APP', 'SMS']);
  const delay = escalation_delay_minutes || 15;

  db.run(`INSERT INTO alert_rules (name, severity, channels, team_member_ids, escalation_delay_minutes, is_active, created_at) VALUES ('${name.replace(/'/g, "''")}', '${severity.replace(/'/g, "''")}', '${channelList.replace(/'/g, "''")}', '${memberIds.replace(/'/g, "''")}', ${delay}, 1, '${now}')`);
  persist();

  const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
  const id = lastIdResult[0]?.values[0]?.[0] || 0;

  res.status(201).json({
    id,
    name,
    severity,
    channels: channels || ['APP', 'SMS'],
    team_member_ids: team_member_ids || [],
    escalation_delay_minutes: delay,
    is_active: 1,
    created_at: now,
  });
});

router.put('/:id', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM alert_rules WHERE id = ${req.params.id}`);
  if (!result[0]?.values[0]) return res.status(404).json({ error: 'Alert rule not found' });

  const { name, severity, channels, team_member_ids, escalation_delay_minutes, is_active } = req.body;
  const sets = [];
  if (name !== undefined) sets.push(`name = '${String(name).replace(/'/g, "''")}'`);
  if (severity !== undefined) sets.push(`severity = '${String(severity).replace(/'/g, "''")}'`);
  if (channels !== undefined) sets.push(`channels = '${JSON.stringify(channels).replace(/'/g, "''")}'`);
  if (team_member_ids !== undefined) sets.push(`team_member_ids = '${JSON.stringify(team_member_ids).replace(/'/g, "''")}'`);
  if (escalation_delay_minutes !== undefined) sets.push(`escalation_delay_minutes = ${Number(escalation_delay_minutes)}`);
  if (is_active !== undefined) sets.push(`is_active = ${is_active ? 1 : 0}`);

  if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

  db.run(`UPDATE alert_rules SET ${sets.join(', ')} WHERE id = ${req.params.id}`);
  persist();

  const updatedResult = db.exec(`SELECT * FROM alert_rules WHERE id = ${req.params.id}`);
  const cols = updatedResult[0]?.columns;
  const row = updatedResult[0]?.values[0];
  const obj = rowToObj(cols, row);
  try { obj.team_member_ids = JSON.parse(obj.team_member_ids); } catch { obj.team_member_ids = []; }
  try { obj.channels = JSON.parse(obj.channels); } catch { obj.channels = []; }
  res.json(obj);
});

router.delete('/:id', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT COUNT(*) as count FROM alert_rules WHERE id = ${req.params.id}`);
  const count = result[0]?.values[0]?.[0] || 0;
  if (count === 0) return res.status(404).json({ error: 'Alert rule not found' });
  db.run(`DELETE FROM alert_rules WHERE id = ${req.params.id}`);
  persist();
  res.json({ success: true });
});

export default router;
