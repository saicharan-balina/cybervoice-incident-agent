import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../dev.db');
const resolvedDbPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);

// Ensure directory exists
const dbDir = path.dirname(resolvedDbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new sqlite3.Database(resolvedDbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at ${resolvedDbPath}`);
  }
});

// Enable WAL mode and foreign keys for performance and reliability
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  db.run('PRAGMA journal_mode = WAL');

  db.run(`
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      incidentType TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'voice_agent',
      suspiciousUrl TEXT,
      clickedLink INTEGER NOT NULL DEFAULT 0,
      sharedCredentials INTEGER NOT NULL DEFAULT 0,
      sharedFinancialInformation INTEGER NOT NULL DEFAULT 0,
      openedAttachment INTEGER NOT NULL DEFAULT 0,
      urgency TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'new',
      conversationId TEXT,
      timeline TEXT,
      recommendedActions TEXT,
      metadata TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_incidents_urgency ON incidents(urgency);
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(incidentType);
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_incidents_createdAt ON incidents(createdAt DESC);
  `);
});

// Helper promisified queries
export function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

export function dbGet<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

export function dbRun(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
