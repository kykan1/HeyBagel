"use client";

import { useState } from "react";
import type { Insight } from "@/types";
import { InsightCard } from "./InsightCard";

interface OlderInsightsSectionProps {
  weeklyInsights: Insight[];
  monthlyInsights: Insight[];
}

export function OlderInsightsSection({
  weeklyInsights,
  monthlyInsights,
}: OlderInsightsSectionProps) {
  const [showWeekly, setShowWeekly] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);

  const hasWeekly = weeklyInsights.length > 0;
  const hasMonthly = monthlyInsights.length > 0;

  if (!hasWeekly && !hasMonthly) {
    return null;
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Older Insights
      </h2>

      {/* Older Weekly Insights */}
      {hasWeekly && (
        <div className="mb-6">
          <button
            onClick={() => setShowWeekly(!showWeekly)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <span className="font-medium text-gray-900">
              Previous Weekly Insights ({weeklyInsights.length})
            </span>
            <span className="text-gray-500">
              {showWeekly ? "▼" : "▶"}
            </span>
          </button>
          
          {showWeekly && (
            <div className="mt-4 space-y-4">
              {weeklyInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Older Monthly Insights */}
      {hasMonthly && (
        <div>
          <button
            onClick={() => setShowMonthly(!showMonthly)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
          >
            <span className="font-medium text-gray-900">
              Previous Monthly Insights ({monthlyInsights.length})
            </span>
            <span className="text-gray-500">
              {showMonthly ? "▼" : "▶"}
            </span>
          </button>
          
          {showMonthly && (
            <div className="mt-4 space-y-4">
              {monthlyInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


