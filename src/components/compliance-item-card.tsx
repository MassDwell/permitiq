"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Paperclip,
  X,
  Upload,
  FileText,
  ChevronRight,
  Check,
  Clock,
  AlertCircle,
  Circle,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

type ComplianceStatus =
  | "pending"
  | "in_progress"
  | "met"
  | "overdue"
  | "not_applicable";

interface AttachedDocument {
  document: {
    id: string;
    filename: string;
    storageUrl: string;
    docType: string | null;
  };
}

interface ProjectDocument {
  id: string;
  filename: string;
}

interface ComplianceItemCardProps {
  item: {
    id: string;
    description: string;
    requirementType: string;
    status: ComplianceStatus;
    deadline: Date | null;
    jurisdiction: string | null;
    notes: string | null;
    attachedDocuments?: AttachedDocument[];
  };
  projectId: string;
  projectDocuments: ProjectDocument[];
  onStatusChange?: (itemId: string, newStatus: ComplianceStatus) => void;
  onUploadClick?: () => void;
}

const statusConfig: Record<
  ComplianceStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  pending: {
    label: "Pending",
    icon: <Circle className="h-3.5 w-3.5" />,
    className: "bg-slate-700 text-slate-200",
  },
  in_progress: {
    label: "Working on it",
    icon: <Clock className="h-3.5 w-3.5" />,
    className: "bg-blue-900/50 text-blue-300 border-blue-700",
  },
  met: {
    label: "Done",
    icon: <Check className="h-3.5 w-3.5" />,
    className: "bg-green-900/50 text-green-300 border-green-700",
  },
  overdue: {
    label: "Past due",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    className: "bg-red-900/50 text-red-300 border-red-700",
  },
  not_applicable: {
    label: "Skip",
    icon: <Minus className="h-3.5 w-3.5" />,
    className: "bg-slate-800 text-slate-400",
  },
};

export function ComplianceItemCard({
  item,
  projectId,
  projectDocuments,
  onStatusChange,
  onUploadClick,
}: ComplianceItemCardProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingDocId, setPendingDocId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const attachMutation = trpc.compliance.attachDocument.useMutation({
    onSuccess: () => {
      utils.compliance.getItemsWithDocuments.invalidate({ projectId });
      utils.compliance.listForProject.invalidate({ projectId });
      toast.success("Document attached");
      setIsPopoverOpen(false);

      // Show prompt to mark as in progress if currently pending
      if (item.status === "pending") {
        setShowPrompt(true);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to attach document");
    },
  });

  const detachMutation = trpc.compliance.detachDocument.useMutation({
    onSuccess: () => {
      utils.compliance.getItemsWithDocuments.invalidate({ projectId });
      utils.compliance.listForProject.invalidate({ projectId });
      toast.success("Document detached");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to detach document");
    },
  });

  const handleAttachDocument = (documentId: string) => {
    setPendingDocId(documentId);
    attachMutation.mutate({
      complianceItemId: item.id,
      documentId,
    });
  };

  const handleDetachDocument = (documentId: string) => {
    detachMutation.mutate({
      complianceItemId: item.id,
      documentId,
    });
  };

  const handlePromptResponse = (markInProgress: boolean) => {
    setShowPrompt(false);
    setPendingDocId(null);
    if (markInProgress && onStatusChange) {
      onStatusChange(item.id, "in_progress");
    }
  };

  const attachedDocIds = new Set(
    item.attachedDocuments?.map((ad) => ad.document.id) ?? []
  );
  const availableDocuments = projectDocuments.filter(
    (doc) => !attachedDocIds.has(doc.id)
  );

  const config = statusConfig[item.status];

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-start gap-3">
          {/* Status indicator */}
          <div className="mt-0.5">
            <Badge
              variant="outline"
              className={cn("gap-1 text-xs", config.className)}
            >
              {config.icon}
              {config.label}
            </Badge>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-100 font-medium">
              {item.description}
            </p>
            {item.deadline && (
              <p className="text-xs text-slate-400 mt-1">
                Due:{" "}
                {new Date(item.deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}

            {/* Attached document chips */}
            {item.attachedDocuments && item.attachedDocuments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.attachedDocuments.map((ad) => (
                  <span
                    key={ad.document.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-teal-900/30 text-teal-300 border border-teal-700/50"
                  >
                    <FileText className="h-3 w-3" />
                    <span className="max-w-[120px] truncate">
                      {ad.document.filename}
                    </span>
                    <button
                      onClick={() => handleDetachDocument(ad.document.id)}
                      className="hover:text-red-400 transition-colors ml-0.5"
                      title="Remove document"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-teal-400 hover:bg-slate-700"
                  title="Attach document"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-64 p-0 bg-slate-800 border-slate-700"
                align="end"
              >
                <div className="p-3 border-b border-slate-700">
                  <h4 className="text-sm font-medium text-slate-100">
                    Attach Document
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Link a document to this requirement
                  </p>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {availableDocuments.length > 0 ? (
                    <div className="p-1">
                      {availableDocuments.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => handleAttachDocument(doc.id)}
                          disabled={attachMutation.isPending}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded-md transition-colors text-left disabled:opacity-50"
                        >
                          <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="truncate">{doc.filename}</span>
                          <ChevronRight className="h-4 w-4 text-slate-500 ml-auto shrink-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="p-3 text-xs text-slate-400 text-center">
                      {projectDocuments.length === 0
                        ? "No documents uploaded yet"
                        : "All documents already attached"}
                    </p>
                  )}
                </div>
                <div className="p-2 border-t border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-700"
                    onClick={() => {
                      setIsPopoverOpen(false);
                      onUploadClick?.();
                    }}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Upload new document
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </Card>

      {/* Mark as In Progress prompt */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 max-w-sm mx-4">
            <h3 className="text-base font-medium text-slate-100 mb-2">
              Mark step as In Progress?
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              You attached a document to this step. Would you like to mark it as
              "Working on it"?
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePromptResponse(false)}
                className="border-slate-600 text-slate-300"
              >
                No
              </Button>
              <Button
                size="sm"
                onClick={() => handlePromptResponse(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Yes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
