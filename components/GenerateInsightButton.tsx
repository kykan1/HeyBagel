"use client";

import { useState } from "react";
import { generateInsight } from "@/actions/ai-actions";
import type { InsightType } from "@/types";

interface GenerateInsightButtonProps {
  type: InsightType;
}

export function GenerateInsightButton({ type }: GenerateInsightButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      if (type === "weekly") {
        startDate.setDate(endDate.getDate() - 7);
      } else {
        startDate.setDate(endDate.getDate() - 30);
      }

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const result = await generateInsight(type, startDateStr, endDateStr);

      if (!result.success) {
        setError(result.error);
      }
      // Success - page will revalidate and show the new insight
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate insight");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all
          ${
            type === "weekly"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2
        `}
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <span>{type === "weekly" ? "📅" : "📆"}</span>
            {type === "weekly" ? "Weekly" : "Monthly"} Insight
          </>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}

