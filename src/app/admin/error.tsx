"use client";

// AUDIT-FIX: Added admin error boundary

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: "#080D1A", color: "#F1F5F9" }}
    >
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-3">Admin error</h2>
        <p className="text-sm mb-6" style={{ color: "#64748B" }}>
          {error.message || "An unexpected error occurred in the admin panel."}
        </p>
        <button
          onClick={reset}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#14B8A6" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
