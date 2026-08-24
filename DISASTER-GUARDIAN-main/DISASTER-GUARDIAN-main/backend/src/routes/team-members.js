import express from 'express';
import { getDb, persist } from '../config/db.js';

const router = express.Router();

const rowToObj = (cols, row) => Object.fromEntries(cols.map((c, i) => [c, row[i]]));

router.get('/', async (req, res) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM team_members ORDER BY escalation_level ASC, created_at DESC');
  const cols = result[0]?.columns;
  const members = (result[0]?.values || []).map(row => rowToObj(cols, row));
  res.json(members);
});

router.get('/:id', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM team_members WHERE id = ${req.params.id}`);
  const cols = result[0]?.columns;
  const row = result[0]?.values[0];
  if (!row) return res.status(404).json({ error: 'Team member not found' });
  res.json(rowToObj(cols, row));
});

router.post('/', async (req, res) => {
  const db = await getDb();
  const { name, phone, email, role, escalation_level } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' });
  }

  const now = new Date().toISOString();
  const level = escalation_level || 1;
  db.run(`INSERT INTO team_members (name, phone, email, role, escalation_level, is_active, created_at) VALUES ('${name.replace(/'/g, "''")}', '${phone.replace(/'/g, "''")}', '${(email || '').replace(/'/g, "''")}', '${(role || 'team').replace(/'/g, "''")}', ${level}, 1, '${now}')`);
  persist();

  const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
  const id = lastIdResult[0]?.values[0]?.[0] || 0;

  res.status(201).json({ id, name, phone, email, role: role || 'team', escalation_level: level, is_active: 1, created_at: now });
});

router.put('/:id', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM team_members WHERE id = ${req.params.id}`);
  if (!result[0]?.values[0]) return res.status(404).json({ error: 'Team member not found' });

  const { name, phone, email, role, escalation_level, is_active } = req.body;
  const sets = [];
  if (name !== undefined) sets.push(`name = '${String(name).replace(/'/g, "''")}'`);
  if (phone !== undefined) sets.push(`phone = '${String(phone).replace(/'/g, "''")}'`);
  if (email !== undefined) sets.push(`email = '${String(email).replace(/'/g, "''")}'`);
  if (role !== undefined) sets.push(`role = '${String(role).replace(/'/g, "''")}'`);
  if (escalation_level !== undefined) sets.push(`escalation_level = ${Number(escalation_level)}`);
  if (is_active !== undefined) sets.push(`is_active = ${is_active ? 1 : 0}`);

  if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

  db.run(`UPDATE team_members SET ${sets.join(', ')} WHERE id = ${req.params.id}`);
  persist();

  const updatedResult = db.exec(`SELECT * FROM team_members WHERE id = ${req.params.id}`);
  const cols = updatedResult[0]?.columns;
  const row = updatedResult[0]?.values[0];
  res.json(rowToObj(cols, row));
});

router.delete('/:id', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT COUNT(*) as count FROM team_members WHERE id = ${req.params.id}`);
  const count = result[0]?.values[0]?.[0] || 0;
  if (count === 0) return res.status(404).json({ error: 'Team member not found' });

  db.run(`DELETE FROM team_members WHERE id = ${req.params.id}`);
  db.run(`DELETE FROM notification_preferences WHERE team_member_id = ${req.params.id}`);
  persist();
  res.json({ success: true });
});

export default router;
