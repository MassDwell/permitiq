"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Plus, FileDown, ClipboardList } from "lucide-react";
import { toast } from "sonner";

interface QuickActionsPanelProps {
  projectId: string;
  onUploadClick: () => void;
  onAddComplianceItem: () => void;
  onAddPermit: () => void;
}

export function QuickActionsPanel({
  projectId,
  onUploadClick,
  onAddComplianceItem,
  onAddPermit,
}: QuickActionsPanelProps) {
  const handleExportChecklist = async () => {
    try {
      const res = await fetch(`/api/export/checklist?projectId=${projectId}`);
      if (!res.ok) {
        toast.error("Failed to export checklist");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compliance-checklist-${projectId.slice(0, 8)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Checklist exported");
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 px-4 bg-white border-b sticky top-0 z-10 shadow-sm">
      <span className="text-xs font-medium text-gray-500 mr-1 hidden sm:inline">Quick Actions:</span>
      <Button size="sm" onClick={onUploadClick} className="gap-1.5">
        <Upload className="h-3.5 w-3.5" />
        Upload Document
      </Button>
      <Button size="sm" variant="outline" onClick={onAddComplianceItem} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        Add Requirement
      </Button>
      <Button size="sm" variant="outline" onClick={onAddPermit} className="gap-1.5">
        <ClipboardList className="h-3.5 w-3.5" />
        Add Permit
      </Button>
      <Button size="sm" variant="outline" onClick={handleExportChecklist} className="gap-1.5">
        <FileDown className="h-3.5 w-3.5" />
        Export CSV
      </Button>
    </div>
  );
}
