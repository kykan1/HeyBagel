import { EntryForm } from "@/components/EntryForm";
import { createEntryAndRedirect } from "@/actions/entry-actions";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Entry - Hey Bagel",
  description: "Write a new journal entry and receive AI-powered insights.",
};

export default function NewEntryPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Entry</h1>
          <p className="text-gray-600">Write freely. Your thoughts are private.</p>
        </div>
        <Link
          href="/"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <EntryForm action={createEntryAndRedirect} />
      </div>
    </div>
  );
}

