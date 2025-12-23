import type { Metadata } from "next";
import Link from "next/link";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Hey Bagel",
    default: "Hey Bagel - Private Journaling with AI Insights",
  },
  description: "A minimalist, private journaling app with AI-powered insights. Reflect on your thoughts, track your mood, and discover patterns in your life.",
  keywords: ["journaling", "journal", "diary", "AI insights", "mood tracking", "reflection", "mindfulness"],
  authors: [{ name: "Hey Bagel" }],
  creator: "Hey Bagel",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Hey Bagel - Private Journaling",
    description: "A minimalist, private journaling app with AI-powered insights",
    siteName: "Hey Bagel",
  },
  robots: {
    index: false, // Private journaling app - don't index
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-200" role="banner">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <Link 
                href="/" 
                className="text-xl font-semibold text-gray-900"
                aria-label="Hey Bagel - Home"
              >
                Hey Bagel 🥯
              </Link>
              <nav className="flex items-center gap-3" role="navigation" aria-label="Main navigation">
                <Link
                  href="/insights"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  aria-label="View insights (shortcut: i)"
                >
                  Insights
                </Link>
                <Link
                  href="/entries/new"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  aria-label="Create new entry (shortcut: n)"
                >
                  New Entry
                </Link>
              </nav>
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-4 py-8" role="main">
            {children}
          </main>

          <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500" role="contentinfo">
            <p>Press <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">?</kbd> for keyboard shortcuts</p>
          </footer>

          <KeyboardShortcuts />
        </div>
      </body>
    </html>
  );
}

