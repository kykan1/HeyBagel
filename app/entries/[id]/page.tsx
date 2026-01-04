import { notFound } from "next/navigation";
import Link from "next/link";
import { getEntryById } from "@/lib/db/queries";
import { EntryDetail } from "@/components/EntryDetail";
import { InsightPanel } from "@/components/InsightPanel";
import { AITrigger } from "@/components/AITrigger";
import { formatDate } from "@/lib/utils/date";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
interface EntryPageProps {
  params: Promise<{ id: string }>;
}


export async function generateMetadata({ params }: EntryPageProps): Promise<Metadata> {
  const { id } = await params;
  const userId = "default_user"; // TODO: Replace with session.user.id after auth
  const entry = await getEntryById(id, userId);

  if (!entry) {
    return {
      title: "Entry Not Found - Hey Bagel",
      description: "This journal entry could not be found.",
    };
  }

  const preview = entry.content.slice(0, 100);
  return {
    title: `Entry from ${formatDate(entry.date)} - Hey Bagel`,
    description: preview + (entry.content.length > 100 ? "..." : ""),
  };
}

export default async function EntryPage({ params }: EntryPageProps) {
  const { id } = await params;
  const userId = "default_user"; // TODO: Replace with session.user.id after auth
  const entry = await getEntryById(id, userId);

  if (!entry) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          aria-label="Back to journal (shortcut: h)"
        >
          ← Back to Journal
        </Link>
        
        {/* Helpful tip */}
        <div className="text-xs text-gray-500 hidden sm:block">
          Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded font-mono text-xs">n</kbd> for new entry
        </div>
      </div>

      <div className="space-y-6">
        <EntryDetail entry={entry} />
        <InsightPanel entry={entry} />
      </div>

      {/* Trigger AI processing if status is pending */}
      <AITrigger entryId={entry.id} aiStatus={entry.aiStatus} />
    </div>
  );
}

