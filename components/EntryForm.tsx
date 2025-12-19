"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";
import type { Mood } from "@/types";

interface EntryFormProps {
  action: (formData: FormData) => Promise<void>;
  initialContent?: string;
  initialMood?: Mood | null;
  submitLabel?: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function EntryForm({ 
  action, 
  initialContent = "", 
  initialMood = null,
  submitLabel = "Save Entry" 
}: EntryFormProps) {
  const [mood, setMood] = useState<Mood | null>(initialMood);

  return (
    <form action={action} className="space-y-6">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          How are you feeling today?
        </label>
        <textarea
          id="content"
          name="content"
          rows={12}
          defaultValue={initialContent}
          required
          placeholder="Write freely..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mood (optional)
        </label>
        <div className="flex gap-3">
          {(["positive", "neutral", "negative", "mixed"] as const).map((m) => (
            <label
              key={m}
              className={`flex-1 cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                mood === m
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="mood"
                value={m}
                checked={mood === m}
                onChange={(e) => setMood(e.target.value as Mood)}
                className="sr-only"
              />
              <span className="capitalize">{m}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

