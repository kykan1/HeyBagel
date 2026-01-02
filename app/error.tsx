"use client";

import { useEffect } from "react";
import { logger } from "@/lib/utils/logger";

/**
 * Root error boundary for the entire application
 * Catches errors in page components and provides recovery options
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Application error", error, {
      component: "RootErrorBoundary",
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
        <div className="text-6xl mb-4">💥</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Oops! Something broke
        </h1>
        <p className="text-gray-600 mb-6">
          Don't worry—your journal entries are safe. This is just a temporary hiccup.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2 font-medium">
              🔍 Developer Info
            </summary>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-mono text-red-600 mb-2">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 mb-2">
                  Error ID: {error.digest}
                </p>
              )}
              <pre className="text-xs text-gray-700 overflow-auto max-h-40 whitespace-pre-wrap">
                {error.stack}
              </pre>
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Go to Home
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          If this keeps happening, try refreshing the page or clearing your browser cache.
        </p>
      </div>
    </div>
  );
}

