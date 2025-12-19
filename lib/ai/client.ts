import OpenAI from "openai";

let openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (openai) {
    return openai;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Please add it to your .env.local file."
    );
  }

  openai = new OpenAI({
    apiKey,
  });

  return openai;
}

export function hasOpenAIKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

