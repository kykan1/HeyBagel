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
            <span className={`text-xs font-mono transition-colors ${
              contentLength === 0 ? "text-gray-400" :
              !isValid ? "text-red-600 font-bold animate-pulse" :
              !isGoodLength ? "text-amber-600 font-medium" :
              "text-green-600 font-medium"
            }`}>
              {contentLength} / {MAX_CONTENT_LENGTH}
            </span>
          </div>
        </div>
        <div className="relative">
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
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:border-transparent resize-none transition-all ${
              showValidation && !isValid
                ? "border-red-400 focus:ring-red-500 bg-red-50"
                : contentLength > 0 && isGoodLength
                ? "border-green-200 focus:ring-green-500"
                : "border-gray-300 focus:ring-gray-900"
            }`}
            aria-describedby="content-hint"
            aria-invalid={showValidation && !isValid}
          />
          {/* Real-time feedback badge */}
          {contentLength > 0 && contentLength < RECOMMENDED_MIN_LENGTH && contentLength >= MIN_CONTENT_LENGTH && (
            <div className="absolute bottom-3 right-3 bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium">
              ✨ Add more for better insights
            </div>
          )}
          {isGoodLength && (
            <div className="absolute bottom-3 right-3 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
              ✓ Perfect length
            </div>
          )}
        </div>
        
        {/* Error messages */}
        {showValidation && contentLength < MIN_CONTENT_LENGTH && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <span className="text-red-600 text-lg">⚠</span>
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">
                Entry too short
              </p>
              <p className="text-xs text-red-700 mt-1">
                Please write at least {MIN_CONTENT_LENGTH} characters. You have {contentLength}.
              </p>
            </div>
          </div>
        )}
        {showValidation && contentLength > MAX_CONTENT_LENGTH && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <span className="text-red-600 text-lg">⚠</span>
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">
                Entry too long
              </p>
              <p className="text-xs text-red-700 mt-1">
                Please keep it under {MAX_CONTENT_LENGTH} characters. You have {contentLength}.
              </p>
            </div>
          </div>
        )}
        
        {/* Helpful hint when first starting */}
        {!showValidation && contentLength === 0 && (
          <p id="content-hint" className="mt-2 text-xs text-gray-500 flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>Write about your day, feelings, or thoughts. AI will analyze your entry automatically.</span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mood (optional)
          <span className="ml-2 text-xs text-gray-500 font-normal">— How are you feeling right now?</span>
        </label>
        <div className="grid grid-cols-4 gap-3">
          {(
            [
              { value: "positive", emoji: "😊", label: "Positive" },
              { value: "neutral", emoji: "😐", label: "Neutral" },
              { value: "negative", emoji: "😔", label: "Negative" },
              { value: "mixed", emoji: "🤔", label: "Mixed" },
            ] as const
          ).map((m) => (
            <label
              key={m.value}
              className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all hover:shadow-md ${
                mood === m.value
                  ? "border-gray-900 bg-gray-900 text-white shadow-lg scale-105"
                  : "border-gray-200 hover:border-gray-400 bg-white"
              }`}
              title={`Select ${m.label} mood`}
            >
              <input
                type="radio"
                name="mood"
                value={m.value}
                checked={mood === m.value}
                onChange={(e) => setMood(e.target.value as Mood)}
                className="sr-only"
              />
              <div className="text-2xl mb-1">{m.emoji}</div>
              <span className="text-xs font-medium">{m.label}</span>
            </label>
          ))}
        </div>
        {mood && (
          <p className="mt-2 text-xs text-gray-600 flex items-center gap-1">
            <span>✓</span>
            <span>Mood selected: <strong className="capitalize">{mood}</strong></span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="text-xs">
          {isGoodLength ? (
            <span className="text-green-600 font-medium flex items-center gap-1">
              <span className="text-base">✓</span>
              Ready for AI analysis
            </span>
          ) : contentLength >= MIN_CONTENT_LENGTH ? (
            <span className="text-amber-600 font-medium flex items-center gap-1">
              <span className="text-base">⚡</span>
              Minimum reached—add more for better insights
            </span>
          ) : (
            <span className="text-gray-500 flex items-center gap-1">
              <span className="text-base">📝</span>
              Write at least {MIN_CONTENT_LENGTH} characters to save
            </span>
          )}
        </div>
        <SubmitButton label={submitLabel} isValid={isValid} />
      </div>
    </form>
  );
}

