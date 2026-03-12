"use client";

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc/client";

export interface DocumentPollerResult {
  status: string | null;
  extractedCount: number;
  error: string | null;
}

export function useDocumentProcessingPoller(
  documentId: string | null,
  enabled: boolean
): DocumentPollerResult {
  const [status, setStatus] = useState<string | null>(null);
  const [extractedCount, setExtractedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !documentId) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const poll = async () => {
      try {
        const result = await utils.documents.getStatus.fetch({ id: documentId });
        setStatus(result.processingStatus);

        if (result.processingError) {
          setError(result.processingError);
        }

        if (result.extractedData) {
          const count =
            (result.extractedData.deadlines?.length ?? 0) +
            (result.extractedData.requiredInspections?.length ?? 0) +
            (result.extractedData.complianceRequirements?.length ?? 0);
          setExtractedCount(count);
        }

        // Stop polling when terminal state reached
        if (result.processingStatus === "completed" || result.processingStatus === "failed") {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch {
        setError("Failed to check processing status");
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    // Poll immediately, then every 3 seconds
    poll();
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [documentId, enabled]);

  return { status, extractedCount, error };
}
