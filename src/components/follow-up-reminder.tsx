"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Copy, CheckCircle, Clock, Mail } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { AHJ_DATA, getFilledEmailTemplate } from "@/lib/ahj-data";

interface FollowUpItem {
  id: string;
  description: string;
  submittedAt: Date | null;
  requirementType: string;
  project: {
    id: string;
    name: string;
    address: string | null;
    jurisdiction: string | null;
  };
}

interface FollowUpReminderProps {
  items: FollowUpItem[];
}

function getDaysSince(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getAHJKeyForRequirement(
  jurisdiction: string | null,
  requirementType: string
): string {
  const jLower = (jurisdiction || "").toLowerCase();
  const reqLower = requirementType.toLowerCase();

  // Check for specific requirement types first
  if (
    reqLower.includes("article_85") ||
    reqLower.includes("demolition") ||
    reqLower.includes("blc")
  ) {
    return "boston_blc";
  }
  if (
    reqLower.includes("article_80") ||
    reqLower.includes("bpda") ||
    reqLower.includes("spr") ||
    reqLower.includes("lpr")
  ) {
    return "boston_bpda";
  }

  // Fall back to jurisdiction-based lookup
  if (jLower.includes("cambridge")) return "cambridge";
  if (jLower.includes("brookline")) return "brookline";
  return "boston";
}

function FollowUpItemCard({
  item,
  onMarkDone,
  onSnooze,
}: {
  item: FollowUpItem;
  onMarkDone: () => void;
  onSnooze: () => void;
}) {
  const daysSince = item.submittedAt ? getDaysSince(new Date(item.submittedAt)) : 0;
  const ahjKey = getAHJKeyForRequirement(
    item.project.jurisdiction,
    item.requirementType
  );
  const ahj = AHJ_DATA[ahjKey];

  const copyEmailTemplate = () => {
    if (!ahj?.emailTemplate) {
      toast.error("No email template available for this AHJ");
      return;
    }
    const filled = getFilledEmailTemplate(
      ahjKey,
      item.project.address || item.project.name
    );
    navigator.clipboard.writeText(filled);
    toast.success("Email template copied to clipboard");
  };

  return (
    <div className="rounded-lg border border-amber-700/50 bg-amber-950/30 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-100">
            It has been <span className="font-semibold">{daysSince} days</span> since
            you submitted{" "}
            <span className="font-medium">{item.description}</span>. Time to
            follow up?
          </p>
          {ahj && (
            <p className="text-xs text-amber-400/70 mt-1 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {ahj.email || ahj.name}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={copyEmailTemplate}
          className="bg-amber-900/30 border-amber-700 text-amber-200 hover:bg-amber-900/50 hover:text-amber-100"
        >
          <Copy className="h-3.5 w-3.5 mr-1.5" />
          Copy email template
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkDone}
          className="bg-green-900/30 border-green-700 text-green-300 hover:bg-green-900/50 hover:text-green-200"
        >
          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
          Mark Done
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSnooze}
          className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-200"
        >
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          Snooze 7 days
        </Button>
      </div>
    </div>
  );
}

export function FollowUpReminder({ items }: FollowUpReminderProps) {
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.compliance.update.useMutation({
    onSuccess: () => {
      utils.compliance.getPendingFollowUps.invalidate();
      utils.compliance.listForProject.invalidate();
      toast.success("Marked as done");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const snoozeMutation = trpc.compliance.snoozeFollowUp.useMutation({
    onSuccess: () => {
      utils.compliance.getPendingFollowUps.invalidate();
      toast.success("Snoozed for 7 days");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to snooze");
    },
  });

  const handleMarkDone = (itemId: string) => {
    updateStatusMutation.mutate({ id: itemId, status: "met" });
  };

  const handleSnooze = (itemId: string) => {
    snoozeMutation.mutate({ complianceItemId: itemId, days: 7 });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="bg-amber-950/20 border-amber-800/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-amber-200 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Follow-Up Needed
        </CardTitle>
        <p className="text-sm text-amber-300/70">
          These items were submitted over 7 days ago and may need a follow-up
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <FollowUpItemCard
            key={item.id}
            item={item}
            onMarkDone={() => handleMarkDone(item.id)}
            onSnooze={() => handleSnooze(item.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
