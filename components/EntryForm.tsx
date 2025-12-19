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

const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 10000;
const RECOMMENDED_MIN_LENGTH = 50;

function SubmitButton({ label, isValid }: { label: string; isValid: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || !isValid}
      className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
    >
      {pending && <span className="inline-block animate-spin">⏳</span>}
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
  const [content, setContent] = useState(initialContent);
  const [showValidation, setShowValidation] = useState(false);

  const contentLength = content.trim().length;
  const isValid = contentLength >= MIN_CONTENT_LENGTH && contentLength <= MAX_CONTENT_LENGTH;
  const isGoodLength = contentLength >= RECOMMENDED_MIN_LENGTH;

  return (
    <form 
      action={action} 
      className="space-y-6"
      onSubmit={(e) => {
        if (!isValid) {
          e.preventDefault();
          setShowValidation(true);
        }
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            How are you feeling today?
          </label>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${
              contentLength === 0 ? "text-gray-400" :
              !isValid ? "text-red-600 font-medium" :
              !isGoodLength ? "text-amber-600" :
              "text-gray-500"
            }`}>
              {contentLength} / {MAX_CONTENT_LENGTH} characters
            </span>
            {contentLength > 0 && contentLength < RECOMMENDED_MIN_LENGTH && (
              <span className="text-xs text-amber-600">✨ Add more for better AI insights</span>
            )}
          </div>
        </div>
        <textarea
          id="content"
          name="content"
          rows={12}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (showValidation) {
              setShowValidation(false);
            }
          }}
          required
          placeholder="Write freely... Share your thoughts, feelings, or what happened today."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent resize-none transition-colors ${
            showValidation && !isValid
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-gray-900"
          }`}
        />
        {showValidation && contentLength < MIN_CONTENT_LENGTH && (
          <p className="mt-1 text-sm text-red-600">
            Please write at least {MIN_CONTENT_LENGTH} characters (you have {contentLength})
          </p>
        )}
        {showValidation && contentLength > MAX_CONTENT_LENGTH && (
          <p className="mt-1 text-sm text-red-600">
            Entry is too long. Please keep it under {MAX_CONTENT_LENGTH} characters.
          </p>
        )}
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

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {isGoodLength ? (
            <span className="text-green-600">✓ Ready for AI analysis</span>
          ) : contentLength >= MIN_CONTENT_LENGTH ? (
            <span className="text-amber-600">Works, but more detail helps AI insights</span>
          ) : (
            <span>Write at least {MIN_CONTENT_LENGTH} characters to save</span>
          )}
        </div>
        <SubmitButton label={submitLabel} isValid={isValid} />
      </div>
    </form>
  );
}

