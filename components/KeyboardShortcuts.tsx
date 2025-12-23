"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Global keyboard shortcuts for the application
 * 
 * Shortcuts:
 * - n: New entry
 * - h: Home
 * - i: Insights
 * - ?: Show keyboard shortcuts help
 * - Esc: Close help modal
 */
export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Esc to close help even in inputs
        if (e.key === "Escape" && showHelp) {
          setShowHelp(false);
        }
        return;
      }

      // Handle shortcuts
      switch (e.key) {
        case "n":
          e.preventDefault();
          router.push("/entries/new");
          break;
        case "h":
          e.preventDefault();
          router.push("/");
          break;
        case "i":
          e.preventDefault();
          router.push("/insights");
          break;
        case "?":
          e.preventDefault();
          setShowHelp(true);
          break;
        case "Escape":
          if (showHelp) {
            e.preventDefault();
            setShowHelp(false);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, showHelp]);

  if (!showHelp) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowHelp(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="shortcuts-title" className="text-xl font-bold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setShowHelp(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close shortcuts help"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <ShortcutRow shortcut="n" description="New entry" />
          <ShortcutRow shortcut="h" description="Home" />
          <ShortcutRow shortcut="i" description="Insights" />
          <ShortcutRow shortcut="?" description="Show this help" />
          <ShortcutRow shortcut="Esc" description="Close dialogs" />
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Shortcuts work when not typing in a text field
          </p>
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({
  shortcut,
  description,
}: {
  shortcut: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-700">{description}</span>
      <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg shadow-sm">
        {shortcut}
      </kbd>
    </div>
  );
}

