import { getOpenAI } from "./client";
import type { Entry, SentimentTrend } from "@/types";

export interface BatchInsightResult {
  content: string;
  themes: string[];
  sentimentTrend: SentimentTrend;
}

/**
 * Generate a batch insight (weekly or monthly reflection) from multiple entries
 * Uses GPT-4o for higher quality longitudinal analysis
 */
export async function generateBatchInsight(
  entries: Entry[],
  insightType: "weekly" | "monthly"
): Promise<BatchInsightResult> {
  if (entries.length === 0) {
    throw new Error("Cannot generate insight from zero entries");
  }

  const openai = getOpenAI();

  // Prepare entries for analysis
  const entriesText = entries
    .map((entry, idx) => {
      const sentiment = entry.aiSentiment
        ? `(Sentiment: ${entry.aiSentiment.label})`
        : "";
      return `Entry ${idx + 1} - ${entry.date} ${sentiment}:\n${entry.content}`;
    })
    .join("\n\n---\n\n");

  const timeFrame = insightType === "weekly" ? "week" : "month";
  const startDate = entries[0].date;
  const endDate = entries[entries.length - 1].date;

  const prompt = `You are analyzing a series of ${entries.length} journal entries from a ${timeFrame} (${startDate} to ${endDate}).

Provide a thoughtful, longitudinal reflection that:
1. Identifies patterns and themes across the entries
2. Notes any changes or developments over time
3. Highlights significant moments or realizations
4. Offers a compassionate, non-judgmental perspective
5. Identifies 3-5 recurring themes

Your response MUST be valid JSON matching this exact structure:
{
  "reflection": "A 2-3 paragraph reflection on the entries, written in second person (you). Be warm, insightful, and focus on patterns over time.",
  "themes": ["theme1", "theme2", "theme3"],
  "sentimentAnalysis": {
    "overall": "A one-sentence summary of the emotional trajectory",
    "average": 0.5,
    "trajectory": "improving"
  }
}

Notes:
- "average" should be a number between -1 (very negative) and 1 (very positive)
- "trajectory" must be one of: "improving", "declining", or "stable"
- Keep the reflection conversational and warm, not clinical
- Focus on growth, patterns, and insights rather than just summarizing

Here are the entries:

${entriesText}`;

  try {
    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a compassionate journal reflection assistant. You help people understand patterns and growth in their journaling practice. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      },
      {
        timeout: 60000, // 60 second timeout for batch processing
      }
    );

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const parsed = JSON.parse(content);

    // Validate the response structure
    if (
      !parsed.reflection ||
      !parsed.themes ||
      !Array.isArray(parsed.themes) ||
      !parsed.sentimentAnalysis
    ) {
      throw new Error("Invalid response structure from AI");
    }

    return {
      content: parsed.reflection,
      themes: parsed.themes,
      sentimentTrend: {
        overall: parsed.sentimentAnalysis.overall,
        average: parsed.sentimentAnalysis.average,
        trajectory: parsed.sentimentAnalysis.trajectory,
      },
    };
  } catch (error) {
    console.error("Error generating batch insight:", error);
    throw error;
  }
}

