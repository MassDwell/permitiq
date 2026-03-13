"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

export type Plan = "starter" | "professional" | "enterprise";

const PLAN_RANK: Record<Plan, number> = {
  starter: 0,
  professional: 1,
  enterprise: 2,
};

/**
 * Gate a feature by the user's current subscription plan.
 *
 * @param requiredPlan - Minimum plan required to access the feature.
 * @returns `allowed` - true if the user's plan meets the requirement.
 *          `upgradeOpen` - state for the upgrade modal.
 *          `setUpgradeOpen` - setter for the upgrade modal.
 *          `upgrade` - call this to open the upgrade modal when a gated action is triggered.
 */
export function usePlanGate(requiredPlan: Plan) {
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const currentPlan = (profile?.plan ?? "starter") as Plan;
  const allowed = PLAN_RANK[currentPlan] >= PLAN_RANK[requiredPlan];

  const upgrade = () => {
    if (!allowed) setUpgradeOpen(true);
  };

  return { allowed, upgradeOpen, setUpgradeOpen, upgrade };
}
