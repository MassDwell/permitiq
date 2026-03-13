"use client";

// AUDIT-FIX: Added root error boundary — previously missing, causing unhandled errors to show raw Next.js error page

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to monitoring service in production
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#080D1A", color: "#F1F5F9" }}
    >
      <div className="text-center max-w-md px-4">
        <h2 className="text-2xl font-bold mb-3">Something went wrong</h2>
        <p className="text-sm mb-6" style={{ color: "#64748B" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #14B8A6, #0EA5E9)" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
