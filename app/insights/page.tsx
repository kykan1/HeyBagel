import { getAllInsights } from "@/lib/db/queries";
import { InsightCard } from "@/components/InsightCard";
import { OlderInsightsSection } from "@/components/OlderInsightsSection";
import { GenerateInsightButton } from "@/components/GenerateInsightButton";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Insights - Hey Bagel",
  description: "View AI-powered weekly and monthly reflections on your journaling journey.",
};

export default async function InsightsPage() {
  const allInsights = await getAllInsights();
  
  // Separate weekly and monthly insights
  const weeklyInsights = allInsights.filter(i => i.insightType === "weekly");
  const monthlyInsights = allInsights.filter(i => i.insightType === "monthly");
  
  // Get most recent of each type
  const latestWeekly = weeklyInsights[0] || null;
  const latestMonthly = monthlyInsights[0] || null;
  
  // Get older insights (skip the first one for each type)
  const olderWeekly = weeklyInsights.slice(1);
  const olderMonthly = monthlyInsights.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block"
          >
            ← Back to entries
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Insights
          </h1>
          <p className="text-lg text-gray-600">
            Deeper reflections on your journaling journey
          </p>
        </div>

        {/* Generate New Insight Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Generate New Insight
          </h2>
          <p className="text-gray-600 mb-4">
            Generate a reflection on your recent entries. AI will analyze
            patterns, themes, and emotional trajectories.
          </p>
          <div className="flex gap-3">
            <GenerateInsightButton type="weekly" />
            <GenerateInsightButton type="monthly" />
          </div>
        </div>

        {/* Most Recent Insights */}
        {!latestWeekly && !latestMonthly ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No insights yet
            </h3>
            <p className="text-gray-600 mb-6">
              Generate your first weekly or monthly insight to see patterns in
              your journaling.
            </p>
            <p className="text-sm text-gray-500">
              Tip: Write at least 3-5 entries before generating insights for
              better results.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Latest Weekly */}
            {latestWeekly && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Latest Weekly Insight
                </h2>
                <InsightCard insight={latestWeekly} isExpanded={false} />
              </div>
            )}

            {/* Latest Monthly */}
            {latestMonthly && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Latest Monthly Insight
                </h2>
                <InsightCard insight={latestMonthly} isExpanded={false} />
              </div>
            )}

            {/* Older Insights */}
            {(olderWeekly.length > 0 || olderMonthly.length > 0) && (
              <OlderInsightsSection 
                weeklyInsights={olderWeekly} 
                monthlyInsights={olderMonthly} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

