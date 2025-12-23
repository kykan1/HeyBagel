import { LoadingSpinner } from "@/components/LoadingSpinner";

/**
 * Loading state for entry detail page
 */
export default function EntryLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      <div className="space-y-6">
        {/* Entry detail skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 animate-pulse">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>

        {/* Insight panel skeleton */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 animate-pulse">
          <div className="h-5 bg-blue-200 rounded w-32 mb-4"></div>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" text="Loading insights..." />
          </div>
        </div>
      </div>
    </div>
  );
}

