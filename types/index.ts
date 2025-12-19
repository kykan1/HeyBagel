export type AIStatus = "pending" | "processing" | "success" | "failed";

export type Mood = "positive" | "neutral" | "negative" | "mixed";

export interface Entry {
  id: string;
  userId: string;
  date: string; // ISO 8601 date string
  content: string;
  mood: Mood | null;
  aiSummary: string | null;
  aiSentiment: AISentiment | null;
  aiThemes: string[] | null;
  aiStatus: AIStatus;
  aiError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AISentiment {
  score: number; // -1 to 1
  label: string;
}

export interface CreateEntryInput {
  content: string;
  mood?: Mood;
  date?: string; // Optional, defaults to today
}

export interface UpdateEntryInput {
  content?: string;
  mood?: Mood;
}

