import express from 'express';
import { getDb, persist } from '../config/db.js';

const router = express.Router();

const rowToObj = (cols, row) => Object.fromEntries(cols.map((c, i) => [c, row[i]]));

// Get all active live users
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    let result;
    try {
      result = db.exec('SELECT * FROM users ORDER BY last_active DESC');
    } catch {
      result = db.exec('SELECT * FROM users');
    }
    if (!result || result.length === 0) return res.json([]);
    const cols = result[0].columns;
    const users = result[0].values.map(row => rowToObj(cols, row));
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Register or Log in a live user
router.post('/login', async (req, res) => {
  try {
    const db = await getDb();
    let { id, name, phone, lat, lng } = req.body;

    if (!name || lat == null || lng == null) {
      return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
    }

    if (!id) {
      id = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    const now = new Date().toISOString();

    // Check if user exists
    const existing = db.exec(`SELECT * FROM users WHERE id = '${id}'`);
    if (existing && existing.length > 0 && existing[0].values.length > 0) {
      const stmt = db.prepare('UPDATE users SET name = ?, phone = ?, lat = ?, lng = ?, last_active = ? WHERE id = ?');
      stmt.run([name, phone || '', Number(lat), Number(lng), now, id]);
    } else {
      const stmt = db.prepare('INSERT INTO users (id, name, phone, lat, lng, last_active) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run([id, name, phone || '', Number(lat), Number(lng), now]);
    }

    persist();

    const userResult = db.exec(`SELECT * FROM users WHERE id = '${id}'`);
    const cols = userResult[0]?.columns;
    const row = userResult[0]?.values[0];
    const user = row ? rowToObj(cols, row) : { id, name, phone, lat, lng, last_active: now };

    res.status(200).json(user);
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ error: 'Failed to login user' });
  }
});

// Update location for active live user
router.put('/location', async (req, res) => {
  try {
    const db = await getDb();
    const { id, lat, lng } = req.body;

    if (!id || lat == null || lng == null) {
      return res.status(400).json({ error: 'User ID, latitude, and longitude are required' });
    }

    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE users SET lat = ?, lng = ?, last_active = ? WHERE id = ?');
    stmt.run([Number(lat), Number(lng), now, id]);
    persist();

    res.json({ success: true, id, lat, lng, last_active: now });
  } catch (error) {
    console.error('Error updating user location:', error);
    res.status(500).json({ error: 'Failed to update user location' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`SELECT * FROM users WHERE id = '${req.params.id}'`);
    if (!result || result.length === 0 || !result[0].values[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    const cols = result[0].columns;
    const user = rowToObj(cols, result[0].values[0]);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error getting user' });
  }
});

// Logout / delete live user session
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    db.run(`DELETE FROM users WHERE id = '${req.params.id}'`);
    persist();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user session' });
  }
});

export default router;
