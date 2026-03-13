"use client";

import { trpc } from "@/lib/trpc/client";

/**
 * Returns whether the current user is an account owner (owns at least one project)
 * vs a collaborator-only user (invited to projects but doesn't own any).
 *
 * Billing, API keys, and subscription management are owner-only features.
 */
export function useIsOwner() {
  const { data, isLoading } = trpc.settings.isOwnerStatus.useQuery();

  return {
    isOwner: data?.isOwner ?? true, // default true so we don't flash-hide content on load
    ownerEmail: data?.ownerEmail ?? null,
    isLoading,
  };
}
