"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { PERMIT_CATEGORY_LABELS } from "./permit-workflow-card";

type PermitCategory =
  | "building"
  | "demolition"
  | "electrical"
  | "plumbing"
  | "gas"
  | "hvac"
  | "zba_variance"
  | "article_80_small"
  | "article_80_large"
  | "bpda_review"
  | "foundation"
  | "excavation"
  | "certificate_of_occupancy"
  | "other";

const DEFAULT_NAMES: Record<PermitCategory, string> = {
  building: "Building Permit - New Construction",
  demolition: "Demolition Permit",
  electrical: "Electrical Permit",
  plumbing: "Plumbing Permit",
  gas: "Gas Permit",
  hvac: "HVAC Permit",
  zba_variance: "ZBA Variance Application",
  article_80_small: "Article 80 Small Project Review",
  article_80_large: "Article 80 Large Project Review",
  bpda_review: "BPDA Development Review",
  foundation: "Foundation Permit",
  excavation: "Excavation Permit",
  certificate_of_occupancy: "Certificate of Occupancy",
  other: "Other Permit",
};

interface AddPermitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  defaultJurisdiction?: string | null;
}

export function AddPermitDialog({
  open,
  onOpenChange,
  projectId,
  defaultJurisdiction,
}: AddPermitDialogProps) {
  const [permitCategory, setPermitCategory] = useState<PermitCategory | "">("");
  const [permitName, setPermitName] = useState("");
  const [jurisdiction, setJurisdiction] = useState(defaultJurisdiction ?? "");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedToEmail, setAssignedToEmail] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const utils = trpc.useUtils();

  const createWorkflow = trpc.permitWorkflows.create.useMutation({
    onSuccess: () => {
      utils.permitWorkflows.getByProject.invalidate({ projectId });
      toast.success("Permit added successfully");
      resetAndClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function resetAndClose() {
    setPermitCategory("");
    setPermitName("");
    setJurisdiction(defaultJurisdiction ?? "");
    setAssignedTo("");
    setAssignedToEmail("");
    setDueDate(undefined);
    setNotes("");
    onOpenChange(false);
  }

  function handleCategoryChange(value: string) {
    const cat = value as PermitCategory;
    setPermitCategory(cat);
    setPermitName(DEFAULT_NAMES[cat] ?? "");
  }

  function handleSubmit() {
    if (!permitCategory || !permitName.trim()) return;

    createWorkflow.mutate({
      projectId,
      permitCategory,
      permitName: permitName.trim(),
      jurisdiction: jurisdiction.trim() || undefined,
      assignedTo: assignedTo.trim() || undefined,
      assignedToEmail: assignedToEmail.trim() || undefined,
      dueDate,
      notes: notes.trim() || undefined,
    });
  }

  const isValid = permitCategory !== "" && permitName.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Permit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="permitCategory">Permit Type *</Label>
            <Select value={permitCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger id="permitCategory">
                <SelectValue placeholder="Select permit type..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PERMIT_CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="permitName">Permit Name *</Label>
            <Input
              id="permitName"
              className="text-base"
              value={permitName}
              onChange={(e) => setPermitName(e.target.value)}
              placeholder="e.g. Building Permit - New Construction"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="jurisdiction">Jurisdiction</Label>
            <Input
              id="jurisdiction"
              className="text-base"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="e.g. Boston ISD, Cambridge, Brookline"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                className="text-base"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Me, Architect, GC..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assignedToEmail">Email (optional)</Label>
              <Input
                id="assignedToEmail"
                className="text-base"
                type="email"
                value={assignedToEmail}
                onChange={(e) => setAssignedToEmail(e.target.value)}
                placeholder="contact@firm.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Due Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              className="text-base"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this permit..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose} disabled={createWorkflow.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || createWorkflow.isPending}>
            {createWorkflow.isPending ? "Adding..." : "Add Permit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
