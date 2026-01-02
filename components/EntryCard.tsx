import Link from "next/link";
import type { Entry } from "@/types";
import { formatDate } from "@/lib/utils/date";

interface EntryCardProps {
  entry: Entry;
}

const moodEmoji: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😔",
  mixed: "🤔",
};

const aiStatusIcon: Record<string, string> = {
  pending: "⏳",
  processing: "🤖",
  success: "✨",
  failed: "⚠️",
};

export function EntryCard({ entry }: EntryCardProps) {
  const preview = entry.content.slice(0, 150) + (entry.content.length > 150 ? "..." : "");
  const aiStatusLabel = {
    pending: "AI analysis pending",
    processing: "AI analyzing",
    success: "AI analysis complete",
    failed: "AI analysis failed",
  }[entry.aiStatus];

  return (
    <Link 
      href={`/entries/${entry.id}`}
      aria-label={`View entry from ${formatDate(entry.date)}`}
    >
      <article className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-gray-900 focus-within:ring-offset-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <time 
              className="text-sm text-gray-500"
              dateTime={entry.date}
            >
              {formatDate(entry.date)}
            </time>
            <span 
              className="text-xs" 
              role="status"
              aria-label={aiStatusLabel}
              title={aiStatusLabel}
            >
              {aiStatusIcon[entry.aiStatus]}
            </span>
          </div>
          {entry.mood && (
            <span 
              className="text-xl" 
              role="img"
              aria-label={`Mood: ${entry.mood}`}
              title={`Mood: ${entry.mood}`}
            >
              {moodEmoji[entry.mood]}
            </span>
          )}
        </div>
        <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">{preview}</p>
      </article>
    </Link>
  );
}

