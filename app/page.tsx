import { auth } from "@/lib/auth/config";
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
  const session = await auth();

  // Show landing page for unauthenticated users
  if (!session?.user?.id) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Hey Bagel 🥯
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Your private journal with AI-powered insights
            </p>
            <p className="text-gray-500">
              Reflect on your thoughts, track your mood, and discover patterns in your life.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="inline-block px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-lg"
            >
              Get Started
            </Link>
            <p className="text-sm text-gray-500">
              Sign in with your Google account to start journaling
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 text-left">
            <div>
              <div className="text-2xl mb-2">✨</div>
              <h3 className="font-semibold text-gray-900 mb-1">AI Insights</h3>
              <p className="text-sm text-gray-600">
                Get personalized insights and patterns from your entries
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-1">Private</h3>
              <p className="text-sm text-gray-600">
                Your journal is completely private and secure
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900 mb-1">Track Mood</h3>
              <p className="text-sm text-gray-600">
                Monitor your emotional journey over time
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show entries for authenticated user
  const entries = await getRecentEntries(20, session.user.id);

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

