import { getDb, persist } from './src/config/db.js';

const db = await getDb();

db.run('DROP TABLE reports');

db.run(`
  CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    disaster_type TEXT NOT NULL,
    lat REAL,
    lng REAL,
    description TEXT,
    timestamp TEXT NOT NULL,
    photo_url TEXT,
    reporter_id TEXT NOT NULL,
    confidence_score INTEGER DEFAULT 0,
    severity TEXT DEFAULT 'LOW_CONFIDENCE',
    status TEXT DEFAULT 'PENDING',
    report_type TEXT DEFAULT 'CITIZEN_REPORT',
    location_status TEXT DEFAULT 'KNOWN',
    location_description TEXT,
    location_source TEXT,
    people_count INTEGER,
    injury_status TEXT DEFAULT 'UNKNOWN',
    situation TEXT,
    priority_score INTEGER DEFAULT 0,
    priority_level TEXT DEFAULT 'UNKNOWN',
    verification_level TEXT DEFAULT 'REPORTED'
  );
`);

persist();

console.log('Reports table recreated successfully');