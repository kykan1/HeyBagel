import type { Entry } from "@/types";
import { EntryCard } from "./EntryCard";

interface EntryListProps {
  entries: Entry[];
}

export function EntryList({ entries }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No entries yet. Start journaling!</p>
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

