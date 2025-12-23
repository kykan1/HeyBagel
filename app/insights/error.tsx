"use client";

import { useEffect } from "react";
import Link from "next/link";
import { logger } from "@/lib/utils/logger";

/**
 * Error boundary for insights page
 */
export default function InsightsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Insights page error", error, {
      component: "InsightsErrorBoundary",
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Couldn't load insights
          </h2>
          <p className="text-gray-600 mb-6">
            There was a problem loading your insights. Don't worry, your journal entries are safe.
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

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              Back to Journal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

