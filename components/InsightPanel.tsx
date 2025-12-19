"use client";

import type { Entry } from "@/types";
import { retryAIAnalysis, regenerateAIAnalysis } from "@/actions/ai-actions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface InsightPanelProps {
  entry: Entry;
}

const sentimentEmoji: Record<string, string> = {
  positive: "😊",
  negative: "😔",
  neutral: "😐",
  mixed: "🤔",
};

export function InsightPanel({ entry }: InsightPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const router = useRouter();

  // Countdown timer for rate limit retry
  useEffect(() => {
    if (retryCountdown && retryCountdown > 0) {
      const timer = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [retryCountdown]);

  const handleRetry = async () => {
    setIsProcessing(true);
    setActionError(null);
    
    const result = await retryAIAnalysis(entry.id);
    
    if (!result.success && result.retryAfter) {
      setRetryCountdown(result.retryAfter);
      setActionError(result.error);
    } else if (!result.success) {
      setActionError(result.error);
    }
    
    router.refresh();
    setIsProcessing(false);
  };

  const handleRegenerate = async () => {
    setIsProcessing(true);
    setActionError(null);
    
    const result = await regenerateAIAnalysis(entry.id);
    
    if (!result.success) {
      setActionError(result.error);
    }
    
    router.refresh();
    setIsProcessing(false);
  };

  // Pending state
  if (entry.aiStatus === "pending") {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-6 animate-pulse">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <div>
            <h3 className="font-semibold text-gray-900">AI Analysis Pending</h3>
            <p className="text-sm text-gray-600">
              Your entry will be analyzed shortly. This usually takes 3-5 seconds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Processing state
  if (entry.aiStatus === "processing") {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-2xl animate-bounce">🤖</span>
            <div className="absolute inset-0 animate-ping opacity-20">🤖</div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">AI Analyzing...</h3>
            <p className="text-sm text-blue-700">
              Reading your entry and generating personalized insights...
            </p>
            <div className="mt-2 flex gap-1">
              <div className="h-1 w-8 bg-blue-400 rounded animate-pulse" style={{ animationDelay: "0ms" }}></div>
              <div className="h-1 w-8 bg-blue-400 rounded animate-pulse" style={{ animationDelay: "150ms" }}></div>
              <div className="h-1 w-8 bg-blue-400 rounded animate-pulse" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (entry.aiStatus === "failed") {
    const isRateLimited = entry.aiError?.includes("rate limit") || entry.aiError?.includes("Rate limit");
    const isAPIKeyIssue = entry.aiError?.includes("API key") || entry.aiError?.includes("Invalid");
    const canRetryNow = !retryCountdown || retryCountdown <= 0;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">AI Analysis Failed</h3>
            <p className="text-sm text-red-700 mt-1 leading-relaxed">
              {entry.aiError || "Something went wrong during analysis."}
            </p>
            
            {actionError && actionError !== entry.aiError && (
              <p className="text-sm text-red-600 mt-2 italic">
                {actionError}
              </p>
            )}

            {/* Helpful tips based on error type */}
            {isRateLimited && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                💡 Tip: Rate limits reset after a short time. Please wait before retrying.
              </div>
            )}
            {isAPIKeyIssue && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                💡 Tip: Check that your OPENAI_API_KEY environment variable is set correctly.
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRetry}
            disabled={isProcessing || !canRetryNow}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Retrying...
              </>
            ) : retryCountdown && retryCountdown > 0 ? (
              `Retry in ${retryCountdown}s`
            ) : (
              "Retry Analysis"
            )}
          </button>
          
          {!canRetryNow && (
            <div className="flex items-center px-3 py-2 bg-amber-100 text-amber-800 text-xs rounded-lg">
              ⏰ Please wait {retryCountdown}s
            </div>
          )}
        </div>
      </div>
    );
  }

  // Success state - show insights
  if (entry.aiStatus === "success" && entry.aiSummary) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>✨</span>
            AI Insights
          </h3>
          <button
            onClick={handleRegenerate}
            disabled={isProcessing}
            className="px-3 py-1 text-xs bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? "Regenerating..." : "Regenerate"}
          </button>
        </div>

        {/* Summary */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Summary</h4>
          <p className="text-gray-800 leading-relaxed">{entry.aiSummary}</p>
        </div>

        {/* Sentiment */}
        {entry.aiSentiment && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sentiment</h4>
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {sentimentEmoji[entry.aiSentiment.label] || "😐"}
              </span>
              <div>
                <p className="font-medium capitalize text-gray-800">
                  {entry.aiSentiment.label}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        entry.aiSentiment.score > 0.3
                          ? "bg-green-500"
                          : entry.aiSentiment.score < -0.3
                          ? "bg-red-500"
                          : "bg-gray-400"
                      }`}
                      style={{
                        width: `${Math.abs(entry.aiSentiment.score) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {entry.aiSentiment.score.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Themes */}
        {entry.aiThemes && entry.aiThemes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Key Themes</h4>
            <div className="flex flex-wrap gap-2">
              {entry.aiThemes.map((theme, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border border-gray-200"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

