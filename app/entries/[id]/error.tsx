"use client";

import { useEffect } from "react";
import Link from "next/link";
import { logger } from "@/lib/utils/logger";

/**
 * Error boundary for individual entry pages
 */
export default function EntryError({
  error,
  reset,
  
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Entry page error", error, {
      component: "EntryErrorBoundary",
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-8 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Couldn't load this entry
        </h2>
        <p className="text-gray-600 mb-6">
          There was a problem loading this journal entry. Your data is safe.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
              Error details
            </summary>
            <pre className="text-xs bg-gray-50 p-4 rounded border border-gray-200 overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
          >
            Back to Journal
          </Link>
        </div>
      </div>
    </div>
  );
}

