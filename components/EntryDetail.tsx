"use client";

import type { Entry } from "@/types";
import { formatDate } from "@/lib/utils/date";
import { AIStatusBadge } from "./AIStatusBadge";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EntryDetailProps {
  entry: Entry;
}

const moodEmoji: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😔",
  mixed: "🤔",
};

// Character limit for collapsed view
const COLLAPSED_CHAR_LIMIT = 500;

export function EntryDetail({ entry }: EntryDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldCollapse = entry.content.length > COLLAPSED_CHAR_LIMIT;
  const displayContent = shouldCollapse && !isExpanded 
    ? entry.content.slice(0, COLLAPSED_CHAR_LIMIT) + "..."
    : entry.content;

  return (
    <article className="bg-white rounded-lg border border-gray-200 p-8">
      <header className="mb-6 border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between mb-3">
          <time className="text-gray-500">{formatDate(entry.date)}</time>
          <div className="flex items-center gap-3">
            {entry.mood && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{moodEmoji[entry.mood]}</span>
                <span className="text-sm text-gray-600 capitalize">{entry.mood}</span>
              </div>
            )}
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Link
                href={`/entries/${entry.id}/edit`}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5 font-medium"
                title="Edit this entry"
              >
                <span>✏️</span>
                Edit
              </Link>
              <DeleteButton entryId={entry.id} />
            </div>
          </div>
        </div>
        <AIStatusBadge status={entry.aiStatus} />
      </header>

      <div className="prose prose-gray max-w-none">
        <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
          {displayContent}
        </p>
        
        {shouldCollapse && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {isExpanded ? "See less ↑" : "See more ↓"}
          </button>
        )}
      </div>

      <footer className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400">
        Created {new Date(entry.createdAt).toLocaleString()}
      </footer>
    </article>
  );
}

/**
 * Delete Button with Confirmation
 * Shows inline confirmation before deleting
 */
function DeleteButton({ entryId }: { entryId: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        // Redirect to home after successful deletion
        router.push("/");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete entry. Please try again.");
        setIsDeleting(false);
        setShowConfirm(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete entry. Please try again.");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border-2 border-red-300 rounded-lg px-3 py-1.5 animate-pulse">
        <span className="text-sm text-red-900 font-semibold">Delete forever?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-1 text-xs bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isDeleting ? "Deleting..." : "Yes, Delete"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="px-3 py-1 text-xs bg-white text-gray-700 border border-gray-300 rounded font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5 font-medium"
      title="Delete this entry permanently"
    >
      <span>🗑️</span>
      Delete
    </button>
  );
}

