import { getRecentEntries } from "@/lib/db/queries";
import { EntryList } from "@/components/EntryList";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Journal - Hey Bagel",
  description: "View and manage your private journal entries with AI-powered insights.",
};

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
      <EntryList entries={entries} />
    </div>
  );
}

