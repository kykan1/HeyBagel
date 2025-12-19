import { getRecentEntries } from "@/lib/db/queries";
import { EntryList } from "@/components/EntryList";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const entries = await getRecentEntries(20);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Journal</h1>
        <p className="text-gray-600">
          A private space for reflection and growth.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Start Your Journaling Journey
          </h2>
          <p className="text-gray-600 mb-6">
            Write your first entry and begin tracking your thoughts and feelings.
          </p>
          <Link
            href="/entries/new"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create First Entry
          </Link>
        </div>
      ) : (
        <EntryList entries={entries} />
      )}
    </div>
  );
}

