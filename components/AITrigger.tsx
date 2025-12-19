"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AIStatus } from "@/types";

interface AITriggerProps {
  entryId: string;
  aiStatus: AIStatus;
}

export function AITrigger({ entryId, aiStatus }: AITriggerProps) {
  const router = useRouter();
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // Only trigger if status is pending and we haven't triggered yet
    if (aiStatus === "pending" && !hasTriggered) {
      setHasTriggered(true);

      console.log("Triggering AI processing for entry:", entryId);

      // Trigger AI processing via API route (not during render!)
      fetch("/api/process-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("AI processing result:", data);
          // Refresh the page to show updated status
          router.refresh();
        })
        .catch((error) => {
          console.error("Failed to trigger AI processing:", error);
          // Still refresh to show any error state
          router.refresh();
        });
    }
  }, [entryId, aiStatus, hasTriggered, router]);

  // This component doesn't render anything visible
  return null;
}

