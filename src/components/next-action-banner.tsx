"use client";

import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CheckCircle, ArrowRight, Search } from "lucide-react";

interface ComplianceItem {
  id: string;
  description: string;
  status: "pending" | "in_progress" | "met" | "overdue" | "not_applicable";
  createdAt: Date;
}

interface NextActionBannerProps {
  projectId: string;
  complianceItems: ComplianceItem[];
  onFindRequirements?: () => void;
  onViewStep?: (itemId: string) => void;
}

type BannerState =
  | { type: "overdue"; item: ComplianceItem }
  | { type: "in_progress"; item: ComplianceItem }
  | { type: "pending"; item: ComplianceItem }
  | { type: "all_done" }
  | { type: "no_items" };

function getBannerState(items: ComplianceItem[]): BannerState {
  // Filter out completed and skipped items
  const activeItems = items.filter(
    (i) => i.status !== "met" && i.status !== "not_applicable"
  );

  // Sort by createdAt to get the first/earliest item
  const sortedActive = [...activeItems].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Check for overdue first (highest priority)
  const overdueItem = sortedActive.find((i) => i.status === "overdue");
  if (overdueItem) {
    return { type: "overdue", item: overdueItem };
  }

  // Check for in_progress
  const inProgressItem = sortedActive.find((i) => i.status === "in_progress");
  if (inProgressItem) {
    return { type: "in_progress", item: inProgressItem };
  }

  // Check for pending (next action)
  const pendingItem = sortedActive.find((i) => i.status === "pending");
  if (pendingItem) {
    return { type: "pending", item: pendingItem };
  }

  // If we have items but none are active, all are done
  if (items.length > 0) {
    return { type: "all_done" };
  }

  // No items at all
  return { type: "no_items" };
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "\u2026";
}

const BANNER_CONFIG = {
  overdue: {
    borderColor: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.05)",
    textColor: "#FCA5A5",
    labelColor: "#EF4444",
    Icon: AlertTriangle,
  },
  in_progress: {
    borderColor: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.05)",
    textColor: "#93C5FD",
    labelColor: "#3B82F6",
    Icon: Clock,
  },
  pending: {
    borderColor: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.05)",
    textColor: "#FDE68A",
    labelColor: "#F59E0B",
    Icon: ArrowRight,
  },
  all_done: {
    borderColor: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.05)",
    textColor: "#6EE7B7",
    labelColor: "#10B981",
    Icon: CheckCircle,
  },
  no_items: {
    borderColor: "#14B8A6",
    bgColor: "rgba(20, 184, 166, 0.05)",
    textColor: "#5EEAD4",
    labelColor: "#14B8A6",
    Icon: Search,
  },
};

export function NextActionBanner({
  projectId,
  complianceItems,
  onFindRequirements,
  onViewStep,
}: NextActionBannerProps) {
  const utils = trpc.useUtils();

  const updateComplianceItem = trpc.compliance.update.useMutation({
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await utils.projects.get.cancel({ id: projectId });

      // Snapshot previous value
      const previousProject = utils.projects.get.getData({ id: projectId });

      // Optimistically update
      if (previousProject) {
        utils.projects.get.setData({ id: projectId }, {
          ...previousProject,
          complianceItems: previousProject.complianceItems.map((item) =>
            item.id === id ? { ...item, status: status! } : item
          ),
        });
      }

      return { previousProject };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousProject) {
        utils.projects.get.setData({ id: projectId }, context.previousProject);
      }
      toast.error("Failed to update status");
    },
    onSuccess: () => {
      toast.success("Status updated");
    },
    onSettled: () => {
      utils.projects.get.invalidate({ id: projectId });
    },
  });

  const bannerState = getBannerState(complianceItems);
  const config = BANNER_CONFIG[bannerState.type];
  const { borderColor, bgColor, textColor, labelColor } = config;

  const handleMarkInProgress = (itemId: string) => {
    updateComplianceItem.mutate({ id: itemId, status: "in_progress" });
  };

  const handleMarkDone = (itemId: string) => {
    updateComplianceItem.mutate({ id: itemId, status: "met" });
  };

  const handleViewStep = (itemId: string) => {
    onViewStep?.(itemId);
  };

  // Render based on state
  if (bannerState.type === "no_items") {
    return (
      <div
        style={{
          borderLeft: `4px solid ${borderColor}`,
          background: bgColor,
          borderRadius: "0 8px 8px 0",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: labelColor,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 14, color: textColor, fontWeight: 500 }}>
            Find your permit requirements to get started.
          </span>
        </div>
        <Button
          size="sm"
          onClick={onFindRequirements}
          className="bg-[#14B8A6] hover:bg-[#0D9488] text-white"
        >
          <Search className="h-4 w-4 mr-2" />
          Find My Requirements
        </Button>
      </div>
    );
  }

  if (bannerState.type === "all_done") {
    return (
      <div
        style={{
          borderLeft: `4px solid ${borderColor}`,
          background: bgColor,
          borderRadius: "0 8px 8px 0",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: labelColor,
            flexShrink: 0,
          }}
        />
        <CheckCircle
          style={{ width: 18, height: 18, color: labelColor, flexShrink: 0 }}
        />
        <span style={{ fontSize: 14, color: textColor, fontWeight: 500 }}>
          All steps complete — permit ready to submit.
        </span>
      </div>
    );
  }

  // Active item states: overdue, in_progress, pending
  const { item } = bannerState;
  const description = truncate(item.description, 80);

  let label: string;
  if (bannerState.type === "overdue") {
    label = "Past due:";
  } else if (bannerState.type === "in_progress") {
    label = "Working on:";
  } else {
    label = "Next step:";
  }

  return (
    <div
      style={{
        borderLeft: `4px solid ${borderColor}`,
        background: bgColor,
        borderRadius: "0 8px 8px 0",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: labelColor,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 14, color: textColor }}>
          <span style={{ fontWeight: 600, color: labelColor }}>{label}</span>{" "}
          {description}
          {bannerState.type === "overdue" && (
            <span style={{ marginLeft: 8, fontWeight: 600, color: "#EF4444" }}>
              Action needed.
            </span>
          )}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {bannerState.type === "pending" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMarkInProgress(item.id)}
            disabled={updateComplianceItem.isPending}
            style={{
              borderColor: "rgba(245, 158, 11, 0.3)",
              color: "#FDE68A",
              background: "rgba(245, 158, 11, 0.1)",
            }}
          >
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Start Working
          </Button>
        )}

        {(bannerState.type === "in_progress" || bannerState.type === "overdue") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMarkDone(item.id)}
            disabled={updateComplianceItem.isPending}
            style={{
              borderColor: "rgba(16, 185, 129, 0.3)",
              color: "#6EE7B7",
              background: "rgba(16, 185, 129, 0.1)",
            }}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            Mark Done
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleViewStep(item.id)}
          style={{ color: "#94A3B8" }}
        >
          View step
        </Button>
      </div>
    </div>
  );
}
