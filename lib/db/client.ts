/**
 * Database Client (Postgres)
 * 
 * Manages connection to Neon Postgres database with connection pooling.
 * Uses the 'postgres' library for lightweight, Vercel-compatible connections.
 */

import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

let sql: ReturnType<typeof postgres> | null = null;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Get or create Postgres connection
 * Uses connection pooling for efficiency
 */
export function getDb(): ReturnType<typeof postgres> {
  if (sql) {
    return sql;
  }

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Add your Neon Postgres connection string to .env.local"
    );
  }

  // Create connection with pooling
  sql = postgres(connectionString, {
    max: 10, // Maximum 10 connections in pool
    idle_timeout: 20, // Close idle connections after 20s
    connect_timeout: 10, // Timeout connection attempts after 10s
    prepare: true, // Use prepared statements for performance
  });

  console.log("✅ Postgres connection established");

  return sql;
}

/**
 * Initialize database schema
 * Runs migrations from schema.sql file
 * Safe to call multiple times - uses CREATE IF NOT EXISTS
 */
async function runSchemaInit(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    const sql = getDb();
    const schemaPath = join(process.cwd(), "lib/db/schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");
    
    // Run schema (idempotent - uses CREATE IF NOT EXISTS)
    await sql.unsafe(schema);
    
    isInitialized = true;
    console.log("✅ Database schema initialized");
  } catch (error) {
    console.error("❌ Failed to initialize database schema:", error);
    throw error;
  }
}

/**
 * Ensure database schema is initialized
 * Returns a promise that resolves when initialization is complete
 * Multiple calls return the same promise (no duplicate initialization)
 */
export function ensureInitialized(): Promise<void> {
  if (isInitialized) {
    return Promise.resolve();
  }

  if (!initPromise) {
    initPromise = runSchemaInit();
  }

  return initPromise;
}

/**
 * Close database connection
 * Call this during graceful shutdown
 */
export async function closeDb(): Promise<void> {
  if (sql) {
    await sql.end({ timeout: 5 });
    sql = null;
    isInitialized = false;
    console.log("🔌 Database connection closed");
  }
}
