/**
 * Database Query Functions
 * 
 * Provides type-safe CRUD operations for entries and insights.
 * All queries use parameterized statements to prevent SQL injection.
 */

import { getDb } from "./client";
import type { Entry, AISentiment, AIStatus, Mood, Insight, InsightType, SentimentTrend } from "@/types";

/**
 * Convert database row to Entry type
 * Handles JSON parsing for complex fields
 */
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

/**
 * Convert database row to Insight type
 * Handles JSON parsing for themes and sentiment trend
 */
function rowToInsight(row: any): Insight {
  return {
    id: row.id,
    userId: row.user_id,
    insightType: row.insight_type as InsightType,
    startDate: row.start_date,
    endDate: row.end_date,
    content: row.content,
    themes: row.themes ? JSON.parse(row.themes) : null,
    sentimentTrend: row.sentiment_trend ? JSON.parse(row.sentiment_trend) : null,
    aiStatus: row.ai_status as AIStatus,
    aiError: row.ai_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get all entries for a user, sorted by date (newest first)
 * 
 * @param userId - User ID (defaults to "default_user" for MVP)
 * @returns Array of entries
 */
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

/**
 * Get recent entries with pagination
 * 
 * @param limit - Maximum number of entries to return
 * @param userId - User ID
 * @returns Array of recent entries
 */
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

/**
 * Get a single entry by ID
 * 
 * @param id - Entry ID
 * @param userId - User ID
 * @returns Entry or null if not found
 */
export function getEntryById(id: string, userId: string = "default_user"): Entry | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM entries
    WHERE id = ? AND user_id = ?
  `);
  const row = stmt.get(id, userId);
  return row ? rowToEntry(row) : null;
}

/**
 * Create a new journal entry
 * 
 * @param id - Unique entry ID (UUID)
 * @param content - Entry content (journal text)
 * @param date - ISO date string (YYYY-MM-DD)
 * @param mood - Optional mood indicator
 * @param userId - User ID
 * @returns Created entry
 */
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

// ============================================================================
// INSIGHT QUERIES
// ============================================================================

export function getAllInsights(userId: string = "default_user"): Insight[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM insights
    WHERE user_id = ?
    ORDER BY start_date DESC, created_at DESC
  `);
  const rows = stmt.all(userId);
  return rows.map(rowToInsight);
}

export function getInsightById(id: string, userId: string = "default_user"): Insight | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM insights
    WHERE id = ? AND user_id = ?
  `);
  const row = stmt.get(id, userId);
  return row ? rowToInsight(row) : null;
}

export function createInsight(
  id: string,
  insightType: InsightType,
  startDate: string,
  endDate: string,
  userId: string = "default_user"
): Insight {
  const db = getDb();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO insights (
      id, user_id, insight_type, start_date, end_date,
      ai_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
  `);

  stmt.run(id, userId, insightType, startDate, endDate, now, now);

  const insight = getInsightById(id, userId);
  if (!insight) {
    throw new Error("Failed to create insight");
  }

  return insight;
}

export function updateInsightAI(
  id: string,
  aiData: {
    aiStatus: AIStatus;
    content?: string | null;
    themes?: string[] | null;
    sentimentTrend?: SentimentTrend | null;
    aiError?: string | null;
  },
  userId: string = "default_user"
): Insight | null {
  const db = getDb();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    UPDATE insights
    SET
      ai_status = ?,
      content = ?,
      themes = ?,
      sentiment_trend = ?,
      ai_error = ?,
      updated_at = ?
    WHERE id = ? AND user_id = ?
  `);

  stmt.run(
    aiData.aiStatus,
    aiData.content ?? null,
    aiData.themes ? JSON.stringify(aiData.themes) : null,
    aiData.sentimentTrend ? JSON.stringify(aiData.sentimentTrend) : null,
    aiData.aiError ?? null,
    now,
    id,
    userId
  );

  return getInsightById(id, userId);
}

export function getEntriesByDateRange(
  startDate: string,
  endDate: string,
  userId: string = "default_user"
): Entry[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM entries
    WHERE user_id = ? AND date >= ? AND date <= ?
    ORDER BY date ASC
  `);
  const rows = stmt.all(userId, startDate, endDate);
  return rows.map(rowToEntry);
}

