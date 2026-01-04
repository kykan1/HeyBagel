-- Hey Bagel Database Schema (Postgres)
-- This schema supports multi-user authentication via Auth.js

-- Users table (managed by Auth.js, but defined here for reference)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  email_verified TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert default user for development (before auth is added)
-- This uses ON CONFLICT DO NOTHING so it's safe to run multiple times
INSERT INTO users (id, email, name) 
VALUES ('default_user', 'user@heybagel.local', 'Default User')
ON CONFLICT (id) DO NOTHING;

-- Journal entries table
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('positive', 'neutral', 'negative', 'mixed')),
  ai_summary TEXT,
  ai_sentiment JSONB,
  ai_themes JSONB,
  ai_status TEXT NOT NULL DEFAULT 'pending' CHECK (ai_status IN ('pending', 'processing', 'success', 'failed')),
  ai_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for entries
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_ai_status ON entries(ai_status) WHERE ai_status IN ('pending', 'processing');

-- AI-generated insights table (weekly/monthly reflections)
CREATE TABLE IF NOT EXISTS insights (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('weekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  content TEXT,
  themes JSONB,
  sentiment_trend JSONB,
  ai_status TEXT NOT NULL DEFAULT 'pending' CHECK (ai_status IN ('pending', 'processing', 'success', 'failed')),
  ai_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for insights
CREATE INDEX IF NOT EXISTS idx_insights_user_date ON insights(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_insights_type ON insights(insight_type);

