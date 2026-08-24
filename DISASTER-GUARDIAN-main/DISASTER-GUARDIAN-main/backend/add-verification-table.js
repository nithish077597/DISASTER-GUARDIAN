import { getDb, persist } from './src/config/db.js';

const db = await getDb();

db.run(`
  CREATE TABLE IF NOT EXISTS verification_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    verification_level TEXT NOT NULL,
    verified_by TEXT,
    source TEXT,
    evidence TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES reports(id)
  );
`);

persist();

console.log('Verification history table created successfully');