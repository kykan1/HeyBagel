import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db: Database.Database | null = null;
let isInitialized = false;

function initializeDatabase(): void {
  if (isInitialized) return;

  const database = getDb();

  // Run migrations
  database.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default_user',
      date TEXT NOT NULL,
      content TEXT NOT NULL,
      mood TEXT,
      ai_summary TEXT,
      ai_sentiment TEXT,
      ai_themes TEXT,
      ai_status TEXT NOT NULL DEFAULT 'pending',
      ai_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date DESC);
    CREATE INDEX IF NOT EXISTS idx_entries_ai_status ON entries(ai_status);
    CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries(user_id, date DESC);
  `);

  isInitialized = true;
  console.log("Database initialized successfully");
}

export function getDb(): Database.Database {
  if (db) {
    return db;
  }

  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "heybagel.db");
  const dbDir = path.dirname(dbPath);

  // Ensure the directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Initialize database schema
  initializeDatabase();

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

