"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList } from "lucide-react";
import { PermitWorkflowCard } from "./permit-workflow-card";
import { AddPermitDialog } from "./add-permit-dialog";
import { PermitDetailDialog } from "./permit-detail-dialog";

interface PermitWorkflowTabProps {
  projectId: string;
  projectJurisdiction?: string | null;
}

export function PermitWorkflowTab({ projectId, projectJurisdiction }: PermitWorkflowTabProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: workflows = [], isLoading } = trpc.permitWorkflows.getByProject.useQuery({
    projectId,
  });

  function handleViewDetails(id: string) {
    setDetailId(id);
    setDetailOpen(true);
  }

  const total = workflows.length;
  const approved = workflows.filter((w) => w.status === "approved").length;
  const inProgress = workflows.filter((w) =>
    ["in_progress", "submitted", "under_review"].includes(w.status)
  ).length;
  const notStarted = workflows.filter((w) => w.status === "not_started").length;
  const issues = workflows.filter((w) =>
    ["rejected", "on_hold"].includes(w.status)
  ).length;

  if (isLoading) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm">Loading permits...</div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Permit Workflow</h2>
          <p className="text-sm text-gray-500">Track all permits required for this project</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Permit
        </Button>
      </div>

      {/* Summary row */}
      {total > 0 && (
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <span className="text-sm text-gray-500">{total} total</span>
          {approved > 0 && (
            <span className="text-sm font-medium text-green-600">{approved} approved</span>
          )}
          {inProgress > 0 && (
            <span className="text-sm font-medium text-blue-600">{inProgress} in progress</span>
          )}
          {notStarted > 0 && (
            <span className="text-sm font-medium text-gray-500">{notStarted} not started</span>
          )}
          {issues > 0 && (
            <span className="text-sm font-medium text-red-600">{issues} need attention</span>
          )}
        </div>
      )}

      {/* Permit list */}
      {workflows.length > 0 ? (
        <div className="space-y-3">
          {workflows.map((workflow) => (
            <PermitWorkflowCard
              key={workflow.id}
              workflow={workflow}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-medium text-gray-900 mb-1">No permits tracked yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Add your first permit to start tracking the workflow.
          </p>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Permit
          </Button>
        </div>
      )}

      <AddPermitDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        projectId={projectId}
        defaultJurisdiction={projectJurisdiction}
      />

      <PermitDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        permitWorkflowId={detailId}
        projectId={projectId}
      />
    </div>
  );
}
