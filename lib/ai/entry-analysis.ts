/**
 * Entry Analysis Module
 * 
 * Uses GPT-4o-mini to analyze individual journal entries.
 * Extracts summary, sentiment, and themes from entry content.
 * 
 * Cost: ~$0.001 per entry
 * Timeout: 30 seconds
 */

import { getOpenAI } from "./client";
import type { AISentiment } from "@/types";
import { validateEntryContent, classifyAIError } from "./errors";

/**
 * Result of AI analysis on a single entry
 */
export interface EntryAnalysisResult {
  summary: string;
  sentiment: AISentiment;
  themes: string[];
}

/**
 * Timeout for AI requests (30 seconds)
 * Prevents hanging requests and controls costs
 */
const AI_TIMEOUT_MS = 30000;

/**
 * Wraps a promise with a timeout
 * Rejects if the promise doesn't resolve within the specified time
 * 
 * @param promise - Promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise that rejects on timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Request timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Analyze a journal entry using OpenAI GPT-4o-mini
 * 
 * Extracts:
 * - Summary: 2-3 sentence overview
 * - Sentiment: Score (-1 to 1) and label
 * - Themes: 3-5 key topics
 * 
 * @param content - Journal entry text (10-10,000 characters)
 * @returns Analysis result with summary, sentiment, and themes
 * @throws {Error} If content is invalid or AI request fails
 * 
 * @example
 * const result = await analyzeEntry("Today was amazing...");
 * // { summary: "...", sentiment: { score: 0.8, label: "positive" }, themes: ["joy", "gratitude"] }
 */
export async function analyzeEntry(content: string): Promise<EntryAnalysisResult> {
  // Validate content before sending
  const validationError = validateEntryContent(content);
  if (validationError) {
    throw new Error(validationError.userMessage);
  }

  const openai = getOpenAI();

  const systemPrompt = `You are a thoughtful journaling assistant. Analyze the user's journal entry and provide:
1. A brief 2-3 sentence summary
2. Overall sentiment (score from -1 to 1, and a label)
3. 3-5 key themes or topics

Be empathetic, non-judgmental, and focus on understanding rather than advising.

Respond in JSON format:
{
  "summary": "...",
  "sentiment": {
    "score": 0.5,
    "label": "positive" | "negative" | "neutral" | "mixed"
  },
  "themes": ["theme1", "theme2", "theme3"]
}`;

  try {
    // Wrap OpenAI call with timeout
    const completion = await withTimeout(
      openai.chat.completions.create(
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: content },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          timeout: AI_TIMEOUT_MS, // OpenAI SDK timeout in options
        }
      ),
      AI_TIMEOUT_MS // Our wrapper timeout
    );

    const result = completion.choices[0]?.message?.content;

    if (!result) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(result);

    // Validate the response structure
    if (!parsed.summary || !parsed.sentiment || !parsed.themes) {
      throw new Error("Invalid response structure from OpenAI");
    }

    return {
      summary: parsed.summary,
      sentiment: {
        score: parsed.sentiment.score,
        label: parsed.sentiment.label,
      },
      themes: parsed.themes,
    };
  } catch (error) {
    // Classify the error for better user messaging
    const classified = classifyAIError(error);
    console.error("Error analyzing entry:", {
      type: classified.type,
      message: classified.message,
    });
    
    // Re-throw with user-friendly message
    const enhancedError = new Error(classified.userMessage);
    (enhancedError as any).classified = classified;
    throw enhancedError;
  }
}

/**
 * Test function to verify OpenAI connection
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const result = await analyzeEntry("Today was a good day. I felt happy and productive.");
    console.log("OpenAI connection test successful:", result);
    return true;
  } catch (error) {
    console.error("OpenAI connection test failed:", error);
    return false;
  }
}

