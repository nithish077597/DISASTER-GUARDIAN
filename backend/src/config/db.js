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
      lat REAL NULL,
      lng REAL NULL,
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
      name TEXT,
      last_active TEXT
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
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'team',
      escalation_level INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_member_id INTEGER NOT NULL,
      channel TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      FOREIGN KEY (team_member_id) REFERENCES team_members(id)
    );
    CREATE TABLE IF NOT EXISTS alert_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      severity TEXT NOT NULL,
      channels TEXT NOT NULL,
      team_member_ids TEXT NOT NULL,
      escalation_delay_minutes INTEGER DEFAULT 15,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS alert_acknowledgments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alert_id INTEGER NOT NULL,
      team_member_id INTEGER NOT NULL,
      acknowledged_at TEXT NOT NULL,
      note TEXT,
      FOREIGN KEY (alert_id) REFERENCES alerts(id),
      FOREIGN KEY (team_member_id) REFERENCES team_members(id)
    );
    CREATE TABLE IF NOT EXISTS alert_escalations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alert_id INTEGER NOT NULL,
      from_level INTEGER NOT NULL,
      to_level INTEGER NOT NULL,
      triggered_at TEXT NOT NULL,
      reason TEXT,
      FOREIGN KEY (alert_id) REFERENCES alerts(id)
    );
    CREATE TABLE IF NOT EXISTS sos_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER,
      disaster_type TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      radius_km REAL NOT NULL,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      triggered_at TEXT NOT NULL,
      affected_count INTEGER DEFAULT 0,
      source TEXT DEFAULT 'SYSTEM'
    );
    CREATE TABLE IF NOT EXISTS sos_affected_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sos_event_id INTEGER NOT NULL,
      user_id TEXT,
      name TEXT,
      phone TEXT,
      distance_km REAL,
      channels TEXT,
      FOREIGN KEY (sos_event_id) REFERENCES sos_events(id)
    );
  `);

  // Add new emergency-case fields to existing reports table
  const newColumns = [
    ['report_type', "TEXT DEFAULT 'CITIZEN_REPORT'"],
    ['location_status', "TEXT DEFAULT 'KNOWN'"],
    ['location_description', 'TEXT'],
    ['location_source', 'TEXT'],
    ['people_count', 'INTEGER'],
    ['injury_status', "TEXT DEFAULT 'UNKNOWN'"],
    ['situation', 'TEXT'],
    ['priority_score', 'INTEGER DEFAULT 0'],
    ['priority_level', "TEXT DEFAULT 'UNKNOWN'"],
    ['verification_level', "TEXT DEFAULT 'REPORTED'"]
  ];

  const existingColumnsResult = database.exec('PRAGMA table_info(reports)');
  const existingColumns = new Set(
    (existingColumnsResult[0]?.values || []).map(row => row[1])
  );

  for (const [columnName, columnDefinition] of newColumns) {
    if (!existingColumns.has(columnName)) {
      database.run(
        `ALTER TABLE reports ADD COLUMN ${columnName} ${columnDefinition}`
      );
    }
  }

  persist();

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

  // Ensure last_active column exists
  try {
    database.run('ALTER TABLE users ADD COLUMN last_active TEXT');
  } catch (e) {
    // Column already exists
  }

  // Ensure users.location column exists (citizen registered location name)
  const userColumnsResult = database.exec('PRAGMA table_info(users)');
  const userColumns = new Set((userColumnsResult[0]?.values || []).map(row => row[1]));
  if (!userColumns.has('location')) {
    try {
      database.run('ALTER TABLE users ADD COLUMN location TEXT');
      persist();
    } catch (e) {
      // Column already exists
    }
  }

  // Emergency category columns for reports (NORMAL / HIGH / RISK / CRITICAL)
  const reportEmergencyColumns = [
    ['category', "TEXT DEFAULT 'NORMAL'"],
    ['news_published', 'INTEGER DEFAULT 0'],
    ['distinct_reporters', 'INTEGER DEFAULT 1'],
    ['photo_verified', 'INTEGER DEFAULT 0']
  ];

  const existingReportColumnsResult = database.exec('PRAGMA table_info(reports)');
  const existingReportColumns = new Set(
    (existingReportColumnsResult[0]?.values || []).map(row => row[1])
  );

  for (const [columnName, columnDefinition] of reportEmergencyColumns) {
    if (!existingReportColumns.has(columnName)) {
      try {
        database.run(`ALTER TABLE reports ADD COLUMN ${columnName} ${columnDefinition}`);
        persist();
      } catch (e) {
        // Column already exists
      }
    }
  }

  // Clear legacy mock users if present
  try {
    database.run("DELETE FROM users WHERE id = 'u1' OR id = 'u2' OR id = 'u3' OR id = 'u4' OR id = 'u5' OR id = 'u6'");
    persist();
  } catch (err) {
    // Ignore error
  }

  // Seed demo citizens ONLY when the users table is empty, so the SOS
  // danger-zone identification has real citizens to evaluate against.
  try {
    const userCountResult = database.exec('SELECT COUNT(*) as count FROM users');
    const userCount = userCountResult[0]?.values[0]?.[0] || 0;
    if (userCount === 0) {
      const demoCitizens = [
        ['c1', 28.620, 77.210, '+919876543210', 'Aarav Sharma', 'Sulur Sector 4'],
        ['c2', 28.615, 77.205, '+919876543211', 'Priya Nair', 'Kallar Pass'],
        ['c3', 28.612, 77.216, '+919876543212', 'Vikram Singh', 'Sulur Sector 4'],
        ['c4', 28.625, 77.200, '+919876543213', 'Meera Reddy', 'Kallar Valley'],
        ['c5', 28.640, 77.230, '+919876543214', 'Karthik Kumar', 'Upper Slope'],
        ['c6', 28.700, 77.300, '+919999999999', 'Far Citizen', 'Outside Zone'],
      ];
      for (const c of demoCitizens) {
        database.run(
          'INSERT INTO users (id, lat, lng, phone, name, location) VALUES (?, ?, ?, ?, ?, ?)',
          c
        );
      }
      persist();
    }
  } catch (err) {
    // Ignore seeding errors
  }
};

export { getDb, init, persist };
