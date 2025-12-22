"use client";

import { useState } from "react";
import type { Insight } from "@/types";
import { retryInsight } from "@/actions/ai-actions";
import { format } from "date-fns";

interface InsightCardProps {
  insight: Insight;
  isExpanded?: boolean;
}

export function InsightCard({ insight, isExpanded = false }: InsightCardProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showFullContent, setShowFullContent] = useState(isExpanded);
  const [showError, setShowError] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryInsight(insight.id);
    } catch (error) {
      console.error("Failed to retry insight:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  const startDate = new Date(insight.startDate);
  const endDate = new Date(insight.endDate);
  const dateRange = `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;

  const typeLabel = insight.insightType === "weekly" ? "Weekly" : "Monthly";
  const typeColor = insight.insightType === "weekly" ? "blue" : "purple";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${
                  typeColor === "blue"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }
              `}
            >
              {typeLabel} Insight
            </span>
            {insight.aiStatus === "processing" && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            )}
            {insight.aiStatus === "success" && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                ✓ Complete
              </span>
            )}
            {insight.aiStatus === "failed" && (
              <span className="text-sm text-red-600 flex items-center gap-1">
                ⚠ Failed
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">{dateRange}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        {insight.aiStatus === "pending" && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-gray-600">Waiting to process...</p>
          </div>
        )}

        {insight.aiStatus === "processing" && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3 animate-bounce">🤖</div>
            <p className="text-gray-600">AI is analyzing your entries...</p>
            <p className="text-sm text-gray-500 mt-2">This may take up to 60 seconds</p>
          </div>
        )}

        {insight.aiStatus === "failed" && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">❌</div>
            <div className="mb-4">
              <button
                onClick={() => setShowError(!showError)}
                className="text-sm text-red-600 font-medium hover:text-red-700 underline"
              >
                {showError ? "Hide error details" : "Show error details"}
              </button>
              {showError && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    {insight.aiError || "Failed to generate insight"}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? "Retrying..." : "Retry"}
            </button>
          </div>
        )}

        {insight.aiStatus === "success" && insight.content && (
          <div>
            {/* Reflection */}
            <div className="prose prose-lg max-w-none mb-6">
              {insight.content.length > 500 && !showFullContent ? (
                <div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {insight.content.slice(0, 500)}...
                  </p>
                  <button
                    onClick={() => setShowFullContent(true)}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Read more →
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {insight.content}
                  </p>
                  {insight.content.length > 500 && (
                    <button
                      onClick={() => setShowFullContent(false)}
                      className="mt-3 text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Show less ↑
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* Themes */}
            {insight.themes && insight.themes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Recurring Themes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {insight.themes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sentiment Trend */}
            {insight.sentimentTrend && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Emotional Trajectory
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {insight.sentimentTrend.trajectory === "improving" && "📈"}
                      {insight.sentimentTrend.trajectory === "declining" && "📉"}
                      {insight.sentimentTrend.trajectory === "stable" && "➡️"}
                    </span>
                    <span className="text-sm text-gray-600 capitalize">
                      {insight.sentimentTrend.trajectory}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {insight.sentimentTrend.overall}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

