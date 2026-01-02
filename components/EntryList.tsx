import type { Entry } from "@/types";
import { EntryCard } from "./EntryCard";
import Link from "next/link";

interface EntryListProps {
  entries: Entry[];
}

/**
 * Entry List Component
 * Displays journal entries or helpful empty state
 */
export function EntryList({ entries }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-12 text-center">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Icon */}
          <div className="text-8xl animate-pulse">📝</div>
          
          {/* Heading */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Your Journey Starts Here
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Welcome to Hey Bagel! This is your private space for reflection, growth, and self-discovery.
            </p>
            <p className="text-gray-600">
              Write your first journal entry and let AI help you uncover patterns and insights.
            </p>
          </div>

          {/* Call to Action */}
          <Link
            href="/entries/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span>✨</span>
            Write Your First Entry
            <span>→</span>
          </Link>

          {/* Tips */}
          <div className="pt-6 mt-6 border-t border-blue-200">
            <div className="grid md:grid-cols-3 gap-4 text-left">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="text-2xl mb-2">🤖</div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm">AI Insights</h4>
                <p className="text-xs text-gray-600">
                  Get summaries, sentiment analysis, and theme extraction
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Completely Private</h4>
                <p className="text-xs text-gray-600">
                  Your thoughts stay yours. No sharing, no tracking
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="text-2xl mb-2">📈</div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Track Patterns</h4>
                <p className="text-xs text-gray-600">
                  Weekly and monthly reflections reveal your journey
                </p>
              </div>
            </div>
          </div>

          {/* Quick tip */}
          <p className="text-sm text-gray-500 italic">
            💡 Tip: Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">n</kbd> anytime to create a new entry
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

