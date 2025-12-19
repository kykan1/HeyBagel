"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { AIStatus } from "@/types";

interface AITriggerProps {
  entryId: string;
  aiStatus: AIStatus;
}

// Exponential backoff configuration
const MAX_AUTO_RETRIES = 2;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 10000; // 10 seconds

export function AITrigger({ entryId, aiStatus }: AITriggerProps) {
  const router = useRouter();
  const [hasTriggered, setHasTriggered] = useState(false);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only trigger if status is pending and we haven't triggered yet
    if (aiStatus === "pending" && !hasTriggered) {
      setHasTriggered(true);
      retryCountRef.current = 0;
      triggerAIProcessing();
    }

    // Cleanup timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [entryId, aiStatus, hasTriggered]);

  const triggerAIProcessing = async () => {
    try {
      console.log(
        `Triggering AI processing for entry: ${entryId} (attempt ${retryCountRef.current + 1}/${MAX_AUTO_RETRIES + 1})`
      );

      const response = await fetch("/api/process-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId }),
      });

      const data = await response.json();

      if (!data.success && data.canRetry !== false && retryCountRef.current < MAX_AUTO_RETRIES) {
        // Calculate exponential backoff delay
        const delay = Math.min(
          INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current),
          MAX_RETRY_DELAY
        );

        console.log(
          `AI processing failed (${data.errorType || "unknown"}). Auto-retrying in ${delay}ms...`
        );

        retryCountRef.current++;

        // Schedule automatic retry
        retryTimeoutRef.current = setTimeout(() => {
          triggerAIProcessing();
        }, delay);
      } else {
        // Success or no more retries - refresh to show final state
        console.log("AI processing completed:", data.success ? "success" : "failed");
        
        // Use aggressive refresh strategy for Next.js 15
        router.refresh();
        
        // Poll for updates to ensure the page refreshes
        let pollCount = 0;
        const pollInterval = setInterval(() => {
          router.refresh();
          pollCount++;
          if (pollCount >= 5) {
            // Stop polling after 5 attempts (10 seconds)
            clearInterval(pollInterval);
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to trigger AI processing:", error);

      // Network error - try to retry if under limit
      if (retryCountRef.current < MAX_AUTO_RETRIES) {
        const delay = Math.min(
          INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current),
          MAX_RETRY_DELAY
        );

        console.log(`Network error. Auto-retrying in ${delay}ms...`);
        retryCountRef.current++;

        retryTimeoutRef.current = setTimeout(() => {
          triggerAIProcessing();
        }, delay);
      } else {
        // No more retries - refresh to show error state
        router.refresh();
      }
    }
  };

  // This component doesn't render anything visible
  return null;
}

