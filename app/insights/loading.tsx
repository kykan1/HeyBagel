import { InsightCardSkeleton } from "@/components/LoadingSpinner";

/**
 * Loading state for insights page
 */
export default function InsightsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-96"></div>
        </div>

        {/* Generate section skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="flex gap-3">
            <div className="h-10 bg-blue-200 rounded-lg w-32"></div>
            <div className="h-10 bg-purple-200 rounded-lg w-32"></div>
          </div>
        </div>

        {/* Insight cards skeleton */}
        <div className="space-y-6">
          <InsightCardSkeleton />
          <InsightCardSkeleton />
        </div>
      </div>
    </div>
  );
}

