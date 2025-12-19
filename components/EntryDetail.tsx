import type { Entry } from "@/types";
import { formatDate } from "@/lib/utils/date";
import { AIStatusBadge } from "./AIStatusBadge";

interface EntryDetailProps {
  entry: Entry;
}

const moodEmoji: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😔",
  mixed: "🤔",
};

export function EntryDetail({ entry }: EntryDetailProps) {
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
          {entry.content}
        </p>
      </div>

      <footer className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400">
        Created {new Date(entry.createdAt).toLocaleString()}
      </footer>
    </article>
  );
}

