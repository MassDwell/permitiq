"use client";

// AUDIT-FIX: Added dashboard error boundary — prevents unhandled tRPC/DB errors from leaking stack traces to users

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: "#0F172A", color: "#F1F5F9" }}
    >
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-3">Something went wrong</h2>
        <p className="text-sm mb-6" style={{ color: "#64748B" }}>
          An error occurred loading this page. Your data is safe.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #14B8A6, #0EA5E9)" }}
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#94A3B8" }}
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
