import { getDb } from "./client";
import type { Entry, AISentiment, AIStatus, Mood } from "@/types";

// Helper to convert DB row to Entry type
function rowToEntry(row: any): Entry {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    content: row.content,
    mood: row.mood as Mood | null,
    aiSummary: row.ai_summary,
    aiSentiment: row.ai_sentiment ? JSON.parse(row.ai_sentiment) : null,
    aiThemes: row.ai_themes ? JSON.parse(row.ai_themes) : null,
    aiStatus: row.ai_status as AIStatus,
    aiError: row.ai_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAllEntries(userId: string = "default_user"): Entry[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM entries
    WHERE user_id = ?
    ORDER BY date DESC, created_at DESC
  `);
  const rows = stmt.all(userId);
  return rows.map(rowToEntry);
}

export function getRecentEntries(limit: number = 20, userId: string = "default_user"): Entry[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM entries
    WHERE user_id = ?
    ORDER BY date DESC, created_at DESC
    LIMIT ?
  `);
  const rows = stmt.all(userId, limit);
  return rows.map(rowToEntry);
}

export function getEntryById(id: string, userId: string = "default_user"): Entry | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM entries
    WHERE id = ? AND user_id = ?
  `);
  const row = stmt.get(id, userId);
  return row ? rowToEntry(row) : null;
}

export function createEntry(
  id: string,
  content: string,
  date: string,
  mood: Mood | null = null,
  userId: string = "default_user"
): Entry {
  const db = getDb();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO entries (
      id, user_id, date, content, mood,
      ai_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
  `);

  stmt.run(id, userId, date, content, mood, now, now);

  const entry = getEntryById(id, userId);
  if (!entry) {
    throw new Error("Failed to create entry");
  }

  return entry;
}

export function updateEntry(
  id: string,
  updates: {
    content?: string;
    mood?: Mood | null;
  },
  userId: string = "default_user"
): Entry | null {
  const db = getDb();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.content !== undefined) {
    fields.push("content = ?");
    values.push(updates.content);
  }

  if (updates.mood !== undefined) {
    fields.push("mood = ?");
    values.push(updates.mood);
  }

  if (fields.length === 0) {
    return getEntryById(id, userId);
  }

  fields.push("updated_at = ?");
  values.push(now);
  values.push(id);
  values.push(userId);

  const stmt = db.prepare(`
    UPDATE entries
    SET ${fields.join(", ")}
    WHERE id = ? AND user_id = ?
  `);

  stmt.run(...values);

  return getEntryById(id, userId);
}

export function deleteEntry(id: string, userId: string = "default_user"): boolean {
  const db = getDb();
  const stmt = db.prepare(`
    DELETE FROM entries
    WHERE id = ? AND user_id = ?
  `);
  const result = stmt.run(id, userId);
  return result.changes > 0;
}

export function updateEntryAI(
  id: string,
  aiData: {
    aiStatus: AIStatus;
    aiSummary?: string | null;
    aiSentiment?: AISentiment | null;
    aiThemes?: string[] | null;
    aiError?: string | null;
  },
  userId: string = "default_user"
): Entry | null {
  const db = getDb();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    UPDATE entries
    SET
      ai_status = ?,
      ai_summary = ?,
      ai_sentiment = ?,
      ai_themes = ?,
      ai_error = ?,
      updated_at = ?
    WHERE id = ? AND user_id = ?
  `);

  stmt.run(
    aiData.aiStatus,
    aiData.aiSummary ?? null,
    aiData.aiSentiment ? JSON.stringify(aiData.aiSentiment) : null,
    aiData.aiThemes ? JSON.stringify(aiData.aiThemes) : null,
    aiData.aiError ?? null,
    now,
    id,
    userId
  );

  return getEntryById(id, userId);
}

