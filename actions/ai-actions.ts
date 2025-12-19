"use server";

import { revalidatePath } from "next/cache";
import { analyzeEntry } from "@/lib/ai/entry-analysis";
import { getEntryById, updateEntryAI } from "@/lib/db/queries";

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Process AI analysis for a journal entry
 * This is called asynchronously after entry creation
 */
export async function processEntryAI(
  entryId: string
): Promise<ActionResult> {
  try {
    // Get the entry
    const entry = await getEntryById(entryId);

    if (!entry) {
      return { success: false, error: "Entry not found" };
    }

    // Update status to processing
    await updateEntryAI(entryId, {
      aiStatus: "processing",
    });

    // Note: No revalidatePath here - it causes errors during render phase
    // We only revalidate after AI completes (success or failure)

    // Analyze the entry with OpenAI
    try {
      const result = await analyzeEntry(entry.content);

      // Store the results
      await updateEntryAI(entryId, {
        aiStatus: "success",
        aiSummary: result.summary,
        aiSentiment: result.sentiment,
        aiThemes: result.themes,
        aiError: null,
      });

      revalidatePath(`/entries/${entryId}`);
      revalidatePath("/");

      return { success: true, data: undefined };
    } catch (aiError) {
      // AI failed - store the error
      const errorMessage = aiError instanceof Error 
        ? aiError.message 
        : "Unknown AI error";

      await updateEntryAI(entryId, {
        aiStatus: "failed",
        aiError: errorMessage,
      });

      revalidatePath(`/entries/${entryId}`);

      console.error("AI analysis failed:", aiError);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error("Error in processEntryAI:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to process AI analysis" 
    };
  }
}

/**
 * Retry AI analysis for a failed entry
 */
export async function retryAIAnalysis(entryId: string): Promise<ActionResult> {
  return processEntryAI(entryId);
}

/**
 * Regenerate AI analysis for a successful entry
 * (User wants fresh insights)
 */
export async function regenerateAIAnalysis(entryId: string): Promise<ActionResult> {
  try {
    // Reset to pending first
    await updateEntryAI(entryId, {
      aiStatus: "pending",
      aiError: null,
    });

    // No revalidatePath here - processEntryAI will handle it at the end

    // Then process
    return processEntryAI(entryId);
  } catch (error) {
    console.error("Error regenerating AI analysis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to regenerate analysis"
    };
  }
}

