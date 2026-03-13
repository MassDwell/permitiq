"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getStatusBadge, PERMIT_CATEGORY_LABELS } from "./permit-workflow-card";

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "on_hold", label: "On Hold" },
] as const;

const COMMENT_TYPE_OPTIONS = [
  { value: "note", label: "Note" },
  { value: "rejection", label: "Rejection Reason" },
  { value: "approval_comment", label: "Approval Comment" },
  { value: "internal", label: "Internal" },
] as const;

interface PermitDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permitWorkflowId: string | null;
  projectId: string;
}

export function PermitDetailDialog({
  open,
  onOpenChange,
  permitWorkflowId,
  projectId,
}: PermitDetailDialogProps) {
  const utils = trpc.useUtils();

  const { data: workflow, isLoading } = trpc.permitWorkflows.getById.useQuery(
    { id: permitWorkflowId! },
    { enabled: !!permitWorkflowId && open }
  );

  // Editable details state
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editAssignedToEmail, setEditAssignedToEmail] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editEstimatedFee, setEditEstimatedFee] = useState("");
  const [editPermitNumber, setEditPermitNumber] = useState("");
  const [editDueDate, setEditDueDate] = useState<Date | undefined>();
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [detailsEdited, setDetailsEdited] = useState(false);

  // Status state
  const [newStatus, setNewStatus] = useState("");
  const [newPermitNumber, setNewPermitNumber] = useState("");

  // Comment state
  const [commentContent, setCommentContent] = useState("");
  const [commentType, setCommentType] = useState<"note" | "rejection" | "approval_comment" | "internal">("note");
  const [commentSource, setCommentSource] = useState("");

  // Initialize edit fields when workflow loads
  const initEdit = (wf: typeof workflow) => {
    if (!wf) return;
    setEditAssignedTo(wf.assignedTo ?? "");
    setEditAssignedToEmail(wf.assignedToEmail ?? "");
    setEditNotes(wf.notes ?? "");
    setEditEstimatedFee(wf.estimatedFee ? String(wf.estimatedFee / 100) : "");
    setEditPermitNumber(wf.permitNumber ?? "");
    setEditDueDate(wf.dueDate ? new Date(wf.dueDate) : undefined);
    setNewStatus(wf.status);
    setNewPermitNumber(wf.permitNumber ?? "");
    setDetailsEdited(false);
  };

  // Reset when workflow data arrives
  if (workflow && editAssignedTo === "" && !detailsEdited && workflow.assignedTo) {
    initEdit(workflow);
  }

  const updateStatus = trpc.permitWorkflows.updateStatus.useMutation({
    onSuccess: () => {
      utils.permitWorkflows.getByProject.invalidate({ projectId });
      utils.permitWorkflows.getById.invalidate({ id: permitWorkflowId! });
      toast.success("Status updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateDetails = trpc.permitWorkflows.update.useMutation({
    onSuccess: () => {
      utils.permitWorkflows.getByProject.invalidate({ projectId });
      utils.permitWorkflows.getById.invalidate({ id: permitWorkflowId! });
      toast.success("Details saved");
      setDetailsEdited(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteWorkflow = trpc.permitWorkflows.delete.useMutation({
    onSuccess: () => {
      utils.permitWorkflows.getByProject.invalidate({ projectId });
      toast.success("Permit deleted");
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const addComment = trpc.permitWorkflows.addComment.useMutation({
    onSuccess: () => {
      utils.permitWorkflows.getById.invalidate({ id: permitWorkflowId! });
      setCommentContent("");
      setCommentSource("");
      toast.success("Comment added");
    },
    onError: (e) => toast.error(e.message),
  });

  function handleSaveStatus() {
    if (!permitWorkflowId || !newStatus) return;
    updateStatus.mutate({
      id: permitWorkflowId,
      status: newStatus as Parameters<typeof updateStatus.mutate>[0]["status"],
      permitNumber: newPermitNumber || null,
    });
  }

  function handleSaveDetails() {
    if (!permitWorkflowId) return;
    updateDetails.mutate({
      id: permitWorkflowId,
      assignedTo: editAssignedTo || undefined,
      assignedToEmail: editAssignedToEmail || null,
      dueDate: editDueDate ?? null,
      notes: editNotes || null,
      estimatedFee: editEstimatedFee ? Math.round(parseFloat(editEstimatedFee) * 100) : null,
      permitNumber: editPermitNumber || null,
    });
  }

  function handleAddComment() {
    if (!permitWorkflowId || !commentContent.trim()) return;
    addComment.mutate({
      permitWorkflowId,
      content: commentContent.trim(),
      commentType,
      source: commentSource.trim() || undefined,
    });
  }

  function handleDelete() {
    if (!permitWorkflowId) return;
    if (confirm("Delete this permit? This cannot be undone.")) {
      deleteWorkflow.mutate({ id: permitWorkflowId });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) initEdit(undefined); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading || !workflow ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <DialogTitle className="text-xl">{workflow.permitName}</DialogTitle>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-sm text-gray-500">
                      {PERMIT_CATEGORY_LABELS[workflow.permitCategory] ?? workflow.permitCategory}
                    </span>
                    {workflow.jurisdiction && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-500">{workflow.jurisdiction}</span>
                      </>
                    )}
                    {getStatusBadge(workflow.status)}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 mt-2">
              {/* Status Update */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Status</h3>
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label>Update Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {(newStatus === "approved" || newStatus === "submitted" || newStatus === "under_review") && (
                    <div className="flex-1 space-y-1.5">
                      <Label>Permit Number</Label>
                      <Input
                        className="text-base"
                        value={newPermitNumber}
                        onChange={(e) => setNewPermitNumber(e.target.value)}
                        placeholder="e.g. ISD-2024-001234"
                      />
                    </div>
                  )}
                  <Button
                    onClick={handleSaveStatus}
                    disabled={updateStatus.isPending || newStatus === workflow.status}
                  >
                    {updateStatus.isPending ? "Saving..." : "Save Status"}
                  </Button>
                </div>

                {workflow.submittedAt && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    Submitted: {format(new Date(workflow.submittedAt), "MMM d, yyyy")}
                    {workflow.approvedAt && ` · Approved: ${format(new Date(workflow.approvedAt), "MMM d, yyyy")}`}
                  </p>
                )}
              </div>

              <Separator />

              {/* Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Assigned To</Label>
                    <Input
                      className="text-base"
                      value={editAssignedTo}
                      onChange={(e) => { setEditAssignedTo(e.target.value); setDetailsEdited(true); }}
                      placeholder="Me, Architect, GC..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      className="text-base"
                      type="email"
                      value={editAssignedToEmail}
                      onChange={(e) => { setEditAssignedToEmail(e.target.value); setDetailsEdited(true); }}
                      placeholder="contact@firm.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Due Date</Label>
                    <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !editDueDate && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editDueDate ? format(editDueDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={editDueDate}
                          onSelect={(d) => { setEditDueDate(d); setDueDateOpen(false); setDetailsEdited(true); }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estimated Fee ($)</Label>
                    <Input
                      className="text-base"
                      type="number"
                      value={editEstimatedFee}
                      onChange={(e) => { setEditEstimatedFee(e.target.value); setDetailsEdited(true); }}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Notes</Label>
                    <Textarea
                      className="text-base"
                      value={editNotes}
                      onChange={(e) => { setEditNotes(e.target.value); setDetailsEdited(true); }}
                      placeholder="Notes about this permit..."
                      rows={2}
                    />
                  </div>
                </div>
                {detailsEdited && (
                  <div className="flex justify-end mt-3">
                    <Button
                      size="sm"
                      onClick={handleSaveDetails}
                      disabled={updateDetails.isPending}
                    >
                      {updateDetails.isPending ? "Saving..." : "Save Details"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Requirements Checklist */}
              {workflow.requirementsSummary && workflow.requirementsSummary.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Requirements Checklist
                    </h3>
                    <div className="space-y-2">
                      {workflow.requirementsSummary.map((req, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Checkbox className="mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{req}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Informational checklist — check off as you complete each item.</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Activity / Comments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Activity & Comments
                  {workflow.comments.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">{workflow.comments.length}</Badge>
                  )}
                </h3>

                {workflow.comments.length > 0 ? (
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {[...workflow.comments].reverse().map((comment) => (
                      <div key={comment.id} className="rounded-lg border p-3 bg-gray-50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-700 capitalize">
                            {comment.commentType.replace(/_/g, " ")}
                          </span>
                          {comment.source && (
                            <Badge variant="outline" className="text-xs py-0">{comment.source}</Badge>
                          )}
                          <span className="text-xs text-gray-400 ml-auto">
                            {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mb-4">No comments yet.</p>
                )}

                {/* Add comment form */}
                <div className="space-y-3 border rounded-lg p-3 bg-gray-50">
                  <Textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Add a note, rejection reason, or internal comment..."
                    rows={2}
                    className="bg-white text-base"
                  />
                  <div className="flex items-center gap-2">
                    <Select
                      value={commentType}
                      onValueChange={(v) => setCommentType(v as typeof commentType)}
                    >
                      <SelectTrigger className="w-44 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMENT_TYPE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={commentSource}
                      onChange={(e) => setCommentSource(e.target.value)}
                      placeholder="Source (ISD, ZBA...)"
                      className="h-8 text-base"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!commentContent.trim() || addComment.isPending}
                      className="ml-auto"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Post
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Danger zone */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Delete Permit</p>
                  <p className="text-xs text-gray-500">This will permanently remove this permit and all its comments.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={deleteWorkflow.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
