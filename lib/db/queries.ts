/**
 * Database Query Functions (Postgres)
 * 
 * Provides type-safe async CRUD operations for entries and insights.
 * All queries use parameterized statements via postgres template literals.
 */

import { getDb, ensureInitialized } from "./client";
import type {
  Entry,
  AISentiment,
  AIStatus,
  Mood,
  Insight,
  InsightType,
  SentimentTrend,
} from "@/types";

/**
 * Database row types (Postgres returns slightly different types)
 */
interface EntryRow {
  id: string;
  user_id: string;
  date: Date;
  content: string;
  mood: string | null;
  ai_summary: string | null;
  ai_sentiment: AISentiment | null; // JSONB auto-parses
  ai_themes: string[] | null; // JSONB auto-parses
  ai_status: string;
  ai_error: string | null;
  created_at: Date;
  updated_at: Date;
}

interface InsightRow {
  id: string;
  user_id: string;
  insight_type: string;
  start_date: Date;
  end_date: Date;
  content: string | null;
  themes: string[] | null; // JSONB auto-parses
  sentiment_trend: SentimentTrend | null; // JSONB auto-parses
  ai_status: string;
  ai_error: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Convert database row to Entry type
 * Postgres DATE/TIMESTAMP types are returned as Date objects
 */
function rowToEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date instanceof Date ? row.date.toISOString().split("T")[0] : row.date,
    content: row.content,
    mood: row.mood as Mood | null,
    aiSummary: row.ai_summary,
    aiSentiment: row.ai_sentiment, // Already parsed from JSONB
    aiThemes: row.ai_themes, // Already parsed from JSONB
    aiStatus: row.ai_status as AIStatus,
    aiError: row.ai_error,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

/**
 * Convert database row to Insight type
 */
function rowToInsight(row: InsightRow): Insight {
  return {
    id: row.id,
    userId: row.user_id,
    insightType: row.insight_type as InsightType,
    startDate: row.start_date instanceof Date ? row.start_date.toISOString().split("T")[0] : row.start_date,
    endDate: row.end_date instanceof Date ? row.end_date.toISOString().split("T")[0] : row.end_date,
    content: row.content,
    themes: row.themes, // Already parsed from JSONB
    sentimentTrend: row.sentiment_trend, // Already parsed from JSONB
    aiStatus: row.ai_status as AIStatus,
    aiError: row.ai_error,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

// ============================================================================
// ENTRY QUERIES
// ============================================================================

/**
 * Get all entries for a user, sorted by date (newest first)
 */
export async function getAllEntries(userId: string): Promise<Entry[]> {
  await ensureInitialized();
  const sql = getDb();
  const rows = await sql<EntryRow[]>`
    SELECT * FROM entries
    WHERE user_id = ${userId}
    ORDER BY date DESC, created_at DESC
  `;
  return rows.map(rowToEntry);
}

/**
 * Get recent entries with pagination
 */
export async function getRecentEntries(
  limit: number = 20,
  userId: string
): Promise<Entry[]> {
  await ensureInitialized();
  const sql = getDb();
  const rows = await sql<EntryRow[]>`
    SELECT * FROM entries
    WHERE user_id = ${userId}
    ORDER BY date DESC, created_at DESC
    LIMIT ${limit}
  `;
  return rows.map(rowToEntry);
}

/**
 * Get a single entry by ID
 */
export async function getEntryById(
  id: string,
  userId: string
): Promise<Entry | null> {
  await ensureInitialized();
  const sql = getDb();
  const rows = await sql<EntryRow[]>`
    SELECT * FROM entries
    WHERE id = ${id} AND user_id = ${userId}
    LIMIT 1
  `;
  return rows.length > 0 ? rowToEntry(rows[0]) : null;
}

/**
 * Create a new journal entry
 */
export async function createEntry(
  id: string,
  content: string,
  date: string,
  mood: Mood | null = null,
  userId: string
): Promise<Entry> {
  await ensureInitialized();
  const sql = getDb();

  await sql`
    INSERT INTO entries (
      id, user_id, date, content, mood, ai_status
    ) VALUES (
      ${id}, ${userId}, ${date}, ${content}, ${mood}, 'pending'
    )
  `;

  const entry = await getEntryById(id, userId);
  if (!entry) {
    throw new Error("Failed to create entry");
  }

  return entry;
}

/**
 * Update entry content and/or mood
 */
export async function updateEntry(
  id: string,
  updates: {
    content?: string;
    mood?: Mood | null;
  },
  userId: string
): Promise<Entry | null> {
  await ensureInitialized();
  const sql = getDb();

  // If nothing to update, return current entry
  if (updates.content === undefined && updates.mood === undefined) {
    return getEntryById(id, userId);
  }

  // Handle different update combinations
  if (updates.content !== undefined && updates.mood !== undefined) {
    await sql`
      UPDATE entries
      SET content = ${updates.content}, mood = ${updates.mood}, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
    `;
  } else if (updates.content !== undefined) {
    await sql`
      UPDATE entries
      SET content = ${updates.content}, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
    `;
  } else if (updates.mood !== undefined) {
    await sql`
      UPDATE entries
      SET mood = ${updates.mood}, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
    `;
  }

  return getEntryById(id, userId);
}

/**
 * Delete an entry
 */
export async function deleteEntry(
  id: string,
  userId: string
): Promise<boolean> {
  await ensureInitialized();
  const sql = getDb();
  const result = await sql`
    DELETE FROM entries
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return result.count > 0;
}

/**
 * Update AI analysis results for an entry
 */
export async function updateEntryAI(
  id: string,
  aiData: {
    aiStatus: AIStatus;
    aiSummary?: string | null;
    aiSentiment?: AISentiment | null;
    aiThemes?: string[] | null;
    aiError?: string | null;
  },
  userId: string
): Promise<Entry | null> {
  await ensureInitialized();
  const sql = getDb();

  await sql`
    UPDATE entries
    SET
      ai_status = ${aiData.aiStatus},
      ai_summary = ${aiData.aiSummary ?? null},
      ai_sentiment = ${aiData.aiSentiment ? sql.json(aiData.aiSentiment as any) : null},
      ai_themes = ${aiData.aiThemes ? sql.json(aiData.aiThemes as any) : null},
      ai_error = ${aiData.aiError ?? null},
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
  `;

  return getEntryById(id, userId);
}

// ============================================================================
// INSIGHT QUERIES
// ============================================================================

/**
 * Get all insights for a user
 */
export async function getAllInsights(userId: string): Promise<Insight[]> {
  await ensureInitialized();
  const sql = getDb();
  const rows = await sql<InsightRow[]>`
    SELECT * FROM insights
    WHERE user_id = ${userId}
    ORDER BY start_date DESC, created_at DESC
  `;
  return rows.map(rowToInsight);
}

/**
 * Get a single insight by ID
 */
export async function getInsightById(
  id: string,
  userId: string
): Promise<Insight | null> {
  await ensureInitialized();
  const sql = getDb();
  const rows = await sql<InsightRow[]>`
    SELECT * FROM insights
    WHERE id = ${id} AND user_id = ${userId}
    LIMIT 1
  `;
  return rows.length > 0 ? rowToInsight(rows[0]) : null;
}

/**
 * Create a new insight (batch reflection)
 */
export async function createInsight(
  id: string,
  insightType: InsightType,
  startDate: string,
  endDate: string,
  userId: string
): Promise<Insight> {
  await ensureInitialized();
  const sql = getDb();

  await sql`
    INSERT INTO insights (
      id, user_id, insight_type, start_date, end_date, ai_status
    ) VALUES (
      ${id}, ${userId}, ${insightType}, ${startDate}, ${endDate}, 'pending'
    )
  `;

  const insight = await getInsightById(id, userId);
  if (!insight) {
    throw new Error("Failed to create insight");
  }

  return insight;
}

/**
 * Update AI-generated insight content
 */
export async function updateInsightAI(
  id: string,
  aiData: {
    aiStatus: AIStatus;
    content?: string | null;
    themes?: string[] | null;
    sentimentTrend?: SentimentTrend | null;
    aiError?: string | null;
  },
  userId: string
): Promise<Insight | null> {
  await ensureInitialized();
  const sql = getDb();

  await sql`
    UPDATE insights
    SET
      ai_status = ${aiData.aiStatus},
      content = ${aiData.content ?? null},
      themes = ${aiData.themes ? sql.json(aiData.themes as any) : null},
      sentiment_trend = ${aiData.sentimentTrend ? sql.json(aiData.sentimentTrend as any) : null},
      ai_error = ${aiData.aiError ?? null},
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
  `;

  return getInsightById(id, userId);
}

/**
 * Get entries within a date range (for generating insights)
 */
export async function getEntriesByDateRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<Entry[]> {
  await ensureInitialized();
  const sql = getDb();
  const rows = await sql<EntryRow[]>`
    SELECT * FROM entries
    WHERE user_id = ${userId}
      AND date >= ${startDate}
      AND date <= ${endDate}
    ORDER BY date ASC
  `;
  return rows.map(rowToEntry);
}
