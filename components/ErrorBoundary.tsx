"use client";

import { Component, type ReactNode } from "react";
import { logger } from "@/lib/utils/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("Error boundary caught error", error, {
      component: "ErrorBoundary",
      componentStack: errorInfo.componentStack,
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          An unexpected error occurred. Don't worry, your data is safe.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
              Error details (development only)
            </summary>
            <pre className="text-xs bg-gray-50 p-4 rounded border border-gray-200 overflow-auto max-h-40">
              {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact error fallback for smaller components
 */
export function CompactErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">Error</h3>
          <p className="text-sm text-red-700 mb-3">
            {process.env.NODE_ENV === "development"
              ? error.message
              : "Something went wrong loading this component."}
          </p>
          <button
            onClick={reset}
            className="text-sm text-red-900 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

