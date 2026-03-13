"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export function PublicNavAuth() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    // Render placeholder to avoid layout shift
    return <div className="w-20 h-7" />;
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-[#E2E8F0] hover:text-white transition-colors"
        >
          Dashboard
        </Link>
        <UserButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/sign-in"
        className="text-sm text-[#E2E8F0] hover:text-white transition-colors"
      >
        Sign In
      </Link>
      <Link
        href="/sign-up"
        className="text-sm px-4 py-1.5 rounded-lg font-medium bg-[#14B8A6] text-white hover:bg-[#0D9488] transition-colors"
      >
        Get Started
      </Link>
    </div>
  );
}
