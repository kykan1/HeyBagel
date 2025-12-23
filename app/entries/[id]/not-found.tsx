import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entry Not Found - Hey Bagel",
  description: "This journal entry doesn't exist.",
};

/**
 * Not Found page for individual entry routes
 * Shown when an entry ID doesn't exist in the database
 */
export default function EntryNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="text-7xl mb-6">📝</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Entry Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          This journal entry doesn't exist. It may have been deleted, or the link might be incorrect.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            View All Entries
          </Link>
          <Link
            href="/entries/new"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Create New Entry
          </Link>
        </div>
      </div>
    </div>
  );
}

