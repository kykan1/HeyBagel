"use server";

import { revalidatePath } from "next/cache";
import { analyzeEntry } from "@/lib/ai/entry-analysis";
import { generateBatchInsight } from "@/lib/ai/batch-insights";
import { 
  getEntryById, 
  updateEntryAI, 
  createInsight, 
  updateInsightAI, 
  getEntriesByDateRange,
  getInsightById
} from "@/lib/db/queries";
import { classifyAIError, type ClassifiedError } from "@/lib/ai/errors";
import type { InsightType } from "@/types";
import { randomBytes } from "crypto";

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; errorType?: string; canRetry?: boolean; retryAfter?: number };

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
      // Classify the error for better handling
      const classified: ClassifiedError = (aiError as any).classified || classifyAIError(aiError);
      
      // Store the user-friendly error message
      await updateEntryAI(entryId, {
        aiStatus: "failed",
        aiError: classified.userMessage,
      });

      revalidatePath(`/entries/${entryId}`);

      console.error("AI analysis failed:", {
        type: classified.type,
        message: classified.message,
        canRetry: classified.canRetry,
      });

      return { 
        success: false, 
        error: classified.userMessage,
        errorType: classified.type,
        canRetry: classified.canRetry,
        retryAfter: classified.retryAfter,
      };
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

/**
 * Generate a batch insight (weekly or monthly reflection)
 */
export async function generateInsight(
  insightType: InsightType,
  startDate: string,
  endDate: string
): Promise<ActionResult<{ insightId: string }>> {
  try {
    // Get entries for the date range
    const entries = await getEntriesByDateRange(startDate, endDate);

    if (entries.length === 0) {
      return {
        success: false,
        error: `No entries found between ${startDate} and ${endDate}`,
      };
    }

    // Create insight record
    const insightId = randomBytes(16).toString("hex");
    await createInsight(insightId, insightType, startDate, endDate);

    // Update to processing
    await updateInsightAI(insightId, {
      aiStatus: "processing",
    });

    revalidatePath("/insights");

    // Generate the batch insight
    try {
      const result = await generateBatchInsight(entries, insightType);

      // Store the results
      await updateInsightAI(insightId, {
        aiStatus: "success",
        content: result.content,
        themes: result.themes,
        sentimentTrend: result.sentimentTrend,
        aiError: null,
      });

      revalidatePath("/insights");

      return { success: true, data: { insightId } };
    } catch (aiError) {
      // Classify the error
      const classified: ClassifiedError = (aiError as any).classified || classifyAIError(aiError);

      // Store the error
      await updateInsightAI(insightId, {
        aiStatus: "failed",
        aiError: classified.userMessage,
      });

      revalidatePath("/insights");

      console.error("Batch insight generation failed:", {
        type: classified.type,
        message: classified.message,
        canRetry: classified.canRetry,
      });

      return {
        success: false,
        error: classified.userMessage,
        errorType: classified.type,
        canRetry: classified.canRetry,
        retryAfter: classified.retryAfter,
      };
    }
  } catch (error) {
    console.error("Error in generateInsight:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate insight"
    };
  }
}

/**
 * Retry generating an insight that failed
 */
export async function retryInsight(insightId: string): Promise<ActionResult> {
  try {
    const insight = await getInsightById(insightId);
    
    if (!insight) {
      return { success: false, error: "Insight not found" };
    }

    // Reset to pending
    await updateInsightAI(insightId, {
      aiStatus: "pending",
      aiError: null,
    });

    revalidatePath("/insights");

    // Get entries for the date range
    const entries = await getEntriesByDateRange(insight.startDate, insight.endDate);

    if (entries.length === 0) {
      return {
        success: false,
        error: `No entries found for this insight`,
      };
    }

    // Update to processing
    await updateInsightAI(insightId, {
      aiStatus: "processing",
    });

    revalidatePath("/insights");

    // Generate the batch insight
    try {
      const result = await generateBatchInsight(entries, insight.insightType);

      // Store the results
      await updateInsightAI(insightId, {
        aiStatus: "success",
        content: result.content,
        themes: result.themes,
        sentimentTrend: result.sentimentTrend,
        aiError: null,
      });

      revalidatePath("/insights");

      return { success: true, data: undefined };
    } catch (aiError) {
      // Classify the error
      const classified: ClassifiedError = (aiError as any).classified || classifyAIError(aiError);

      // Store the error
      await updateInsightAI(insightId, {
        aiStatus: "failed",
        aiError: classified.userMessage,
      });

      revalidatePath("/insights");

      return {
        success: false,
        error: classified.userMessage,
        errorType: classified.type,
        canRetry: classified.canRetry,
        retryAfter: classified.retryAfter,
      };
    }
  } catch (error) {
    console.error("Error retrying insight:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to retry insight"
    };
  }
}

