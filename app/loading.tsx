import { EntryCardSkeleton } from "@/components/LoadingSpinner";

/**
 * Loading state for home page (entry list)
 */
export default function HomeLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
      </div>

      <div className="space-y-4">
        <EntryCardSkeleton />
        <EntryCardSkeleton />
        <EntryCardSkeleton />
      </div>
    </div>
  );
}

