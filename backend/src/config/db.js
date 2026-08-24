import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../disaster_guardian.db');

let dbInstance = null;

const getDb = async () => {
  if (!dbInstance) {
    const SQL = await initSqlJs();
    const data = fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : null;
    dbInstance = new SQL.Database(data);
  }
  return dbInstance;
};

const persist = () => {
  const data = dbInstance.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
};

const init = async () => {
  const database = await getDb();
  database.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disaster_type TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      description TEXT,
      timestamp TEXT NOT NULL,
      photo_url TEXT,
      reporter_id TEXT NOT NULL,
      confidence_score INTEGER DEFAULT 0,
      severity TEXT DEFAULT 'LOW_CONFIDENCE',
      status TEXT DEFAULT 'PENDING'
    );
    CREATE TABLE IF NOT EXISTS shelters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      capacity INTEGER NOT NULL,
      current_occupancy INTEGER DEFAULT 0,
      disaster_types TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      phone TEXT,
      name TEXT
    );
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      severity TEXT NOT NULL,
      channels TEXT NOT NULL,
      message TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES reports(id)
    );
  `);

  const shelterCount = database.exec('SELECT COUNT(*) as count FROM shelters');
  const count = shelterCount[0]?.values[0]?.[0] || 0;
  if (count === 0) {
    const shelters = [
      ['Central Relief Camp', 28.6139, 77.2090, 500, 120, 'FLOOD,LANDSLIDE'],
      ['North Hills Shelter', 28.7041, 77.1025, 200, 45, 'LANDSLIDE'],
      ['Riverbank Safe Zone', 28.6304, 77.2177, 300, 80, 'FLOOD'],
      ['Highland Community Hall', 28.6692, 77.4538, 150, 30, 'FLOOD,LANDSLIDE'],
    ];
    for (const s of shelters) {
      database.run('INSERT INTO shelters (name, lat, lng, capacity, current_occupancy, disaster_types) VALUES (?, ?, ?, ?, ?, ?)', s);
    }
    persist();
  }

  const userCount = database.exec('SELECT COUNT(*) as count FROM users');
  const ucount = userCount[0]?.values[0]?.[0] || 0;
  if (ucount === 0) {
    const mockUsers = [
      ['u1', 28.6140, 77.2095, '+919876543210', 'Rahul'],
      ['u2', 28.6135, 77.2085, '+919876543211', 'Priya'],
      ['u3', 28.7045, 77.1030, '+919876543212', 'Amit'],
      ['u4', 28.7040, 77.1020, '+919876543213', 'Sneha'],
      ['u5', 28.6310, 77.2180, '+919876543214', 'Vikram'],
      ['u6', 28.6300, 77.2160, '+919876543215', 'Anita'],
    ];
    for (const u of mockUsers) {
      database.run('INSERT INTO users (id, lat, lng, phone, name) VALUES (?, ?, ?, ?, ?)', u);
    }
    persist();
  }
};

export { getDb, init, persist };
