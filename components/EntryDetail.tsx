"use client";

import type { Entry } from "@/types";
import { formatDate } from "@/lib/utils/date";
import { AIStatusBadge } from "./AIStatusBadge";
import { useState } from "react";

interface EntryDetailProps {
  entry: Entry;
}

const moodEmoji: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😔",
  mixed: "🤔",
};

// Character limit for collapsed view
const COLLAPSED_CHAR_LIMIT = 500;

export function EntryDetail({ entry }: EntryDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldCollapse = entry.content.length > COLLAPSED_CHAR_LIMIT;
  const displayContent = shouldCollapse && !isExpanded 
    ? entry.content.slice(0, COLLAPSED_CHAR_LIMIT) + "..."
    : entry.content;

  return (
    <article className="bg-white rounded-lg border border-gray-200 p-8">
      <header className="mb-6 border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between mb-3">
          <time className="text-gray-500">{formatDate(entry.date)}</time>
          {entry.mood && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{moodEmoji[entry.mood]}</span>
              <span className="text-sm text-gray-600 capitalize">{entry.mood}</span>
            </div>
          )}
        </div>
        <AIStatusBadge status={entry.aiStatus} />
      </header>

      <div className="prose prose-gray max-w-none">
        <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
          {displayContent}
        </p>
        
        {shouldCollapse && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {isExpanded ? "See less ↑" : "See more ↓"}
          </button>
        )}
      </div>

      <footer className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400">
        Created {new Date(entry.createdAt).toLocaleString()}
      </footer>
    </article>
  );
}

