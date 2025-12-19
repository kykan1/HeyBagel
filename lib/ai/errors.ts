/**
 * AI Error Classification and Handling
 * Provides detailed error types and user-friendly messages
 */

export enum AIErrorType {
  TIMEOUT = "timeout",
  RATE_LIMIT = "rate_limit",
  INVALID_API_KEY = "invalid_api_key",
  INSUFFICIENT_QUOTA = "insufficient_quota",
  NETWORK_ERROR = "network_error",
  INVALID_RESPONSE = "invalid_response",
  CONTENT_TOO_SHORT = "content_too_short",
  CONTENT_TOO_LONG = "content_too_long",
  UNKNOWN = "unknown",
}

export interface ClassifiedError {
  type: AIErrorType;
  message: string;
  userMessage: string;
  canRetry: boolean;
  retryAfter?: number; // seconds to wait before retry
}

/**
 * Classify an error from OpenAI or network issues
 */
export function classifyAIError(error: unknown): ClassifiedError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();

  // API Key Issues
  if (
    errorString.includes("api key") ||
    errorString.includes("unauthorized") ||
    errorString.includes("401")
  ) {
    return {
      type: AIErrorType.INVALID_API_KEY,
      message: errorMessage,
      userMessage:
        "Invalid OpenAI API key. Please check your configuration.",
      canRetry: false,
    };
  }

  // Rate Limiting
  if (
    errorString.includes("rate limit") ||
    errorString.includes("429") ||
    errorString.includes("too many requests")
  ) {
    // Try to extract retry-after from error
    const retryAfterMatch = errorMessage.match(/retry[- ]after[:\s]+(\d+)/i);
    const retryAfter = retryAfterMatch ? parseInt(retryAfterMatch[1]) : 60;

    return {
      type: AIErrorType.RATE_LIMIT,
      message: errorMessage,
      userMessage: `Rate limit reached. Please wait ${retryAfter} seconds before retrying.`,
      canRetry: true,
      retryAfter,
    };
  }

  // Quota/Billing Issues
  if (
    errorString.includes("quota") ||
    errorString.includes("insufficient") ||
    errorString.includes("billing") ||
    errorString.includes("credits")
  ) {
    return {
      type: AIErrorType.INSUFFICIENT_QUOTA,
      message: errorMessage,
      userMessage:
        "OpenAI account has insufficient credits. Please check your billing settings.",
      canRetry: false,
    };
  }

  // Timeout
  if (
    errorString.includes("timeout") ||
    errorString.includes("timed out") ||
    errorString.includes("ETIMEDOUT")
  ) {
    return {
      type: AIErrorType.TIMEOUT,
      message: errorMessage,
      userMessage:
        "Request timed out. The AI service may be slow. Please try again.",
      canRetry: true,
    };
  }

  // Network Errors
  if (
    errorString.includes("network") ||
    errorString.includes("ECONNREFUSED") ||
    errorString.includes("ENOTFOUND") ||
    errorString.includes("fetch failed")
  ) {
    return {
      type: AIErrorType.NETWORK_ERROR,
      message: errorMessage,
      userMessage:
        "Network error. Please check your internet connection and try again.",
      canRetry: true,
    };
  }

  // Invalid Response Structure
  if (
    errorString.includes("invalid response") ||
    errorString.includes("json") ||
    errorString.includes("parse")
  ) {
    return {
      type: AIErrorType.INVALID_RESPONSE,
      message: errorMessage,
      userMessage:
        "Received an unexpected response from AI. Please try again.",
      canRetry: true,
    };
  }

  // Unknown error
  return {
    type: AIErrorType.UNKNOWN,
    message: errorMessage,
    userMessage:
      "An unexpected error occurred during AI analysis. Please try again.",
    canRetry: true,
  };
}

/**
 * Validate entry content before sending to AI
 */
export function validateEntryContent(content: string): ClassifiedError | null {
  const trimmed = content.trim();

  if (trimmed.length < 10) {
    return {
      type: AIErrorType.CONTENT_TOO_SHORT,
      message: "Content is too short for meaningful analysis",
      userMessage:
        "Entry is too short for AI analysis. Please write at least 10 characters.",
      canRetry: false,
    };
  }

  if (trimmed.length > 10000) {
    return {
      type: AIErrorType.CONTENT_TOO_LONG,
      message: "Content exceeds maximum length",
      userMessage:
        "Entry is too long for AI analysis. Please keep it under 10,000 characters.",
      canRetry: false,
    };
  }

  return null;
}

/**
 * Format error for display with retry guidance
 */
export function formatErrorForDisplay(
  classifiedError: ClassifiedError
): string {
  let message = classifiedError.userMessage;

  if (classifiedError.canRetry) {
    if (classifiedError.retryAfter) {
      message += ` You can retry in ${classifiedError.retryAfter} seconds.`;
    } else {
      message += " Click 'Retry' to try again.";
    }
  } else {
    message += " Please resolve the issue before retrying.";
  }

  return message;
}

