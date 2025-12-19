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

  return (
    <Link href={`/entries/${entry.id}`}>
      <article className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <time className="text-sm text-gray-500">{formatDate(entry.date)}</time>
            <span className="text-xs" title={`AI: ${entry.aiStatus}`}>
              {aiStatusIcon[entry.aiStatus]}
            </span>
          </div>
          {entry.mood && (
            <span className="text-xl" title={entry.mood}>
              {moodEmoji[entry.mood]}
            </span>
          )}
        </div>
        <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">{preview}</p>
      </article>
    </Link>
  );
}

