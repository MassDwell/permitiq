"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { UpgradeModal } from "@/components/upgrade-modal";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const projectTypes = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "adu", label: "ADU (Accessory Dwelling Unit)" },
  { value: "mixed_use", label: "Mixed Use" },
  { value: "renovation", label: "Renovation" },
];

// Static Boston-area jurisdiction options — always shown as primary options
const BOSTON_AREA_JURISDICTIONS = [
  { value: "BOSTON_ISD", label: "Boston, MA (ISD)" },
  { value: "BOSTON_BPDA", label: "Boston, MA (BPDA)" },
  { value: "BOSTON_ZBA", label: "Boston, MA (ZBA)" },
  { value: "CAMBRIDGE_MA", label: "Cambridge, MA" },
  { value: "SOMERVILLE_MA", label: "Somerville, MA" },
  { value: "NEWTON_MA", label: "Newton, MA" },
  { value: "BROOKLINE_MA", label: "Brookline, MA" },
  { value: "QUINCY_MA", label: "Quincy, MA" },
  { value: "MA_GENERIC", label: "Generic MA" },
];
const STATIC_JURISDICTION_CODES = new Set(BOSTON_AREA_JURISDICTIONS.map((j) => j.value));

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [projectType, setProjectType] = useState<
    "residential" | "commercial" | "adu" | "mixed_use" | "renovation"
  >("residential");
  const [description, setDescription] = useState("");
  const [unitCount, setUnitCount] = useState("");
  const [grossFloorArea, setGrossFloorArea] = useState("");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Compute Article 80 track from GFA + unit count + jurisdiction for live badge
  const gfa = grossFloorArea ? parseInt(grossFloorArea, 10) : 0;
  const units = unitCount ? parseInt(unitCount, 10) : 0;
  const isBoston = jurisdiction.toUpperCase().includes("BOSTON");
  const article80Badge = isBoston && (gfa > 0 || units > 0)
    ? gfa >= 50000 ? { label: "LPR Required", color: "#EF4444" }
    : (gfa >= 20000 || units >= 15) ? { label: "SPR Required", color: "#F59E0B" }
    : { label: "No Article 80", color: "#22C55E" }
    : null;

  const { data: jurisdictions } = trpc.compliance.getJurisdictions.useQuery();

  const createProject = trpc.projects.create.useMutation({
    onSuccess: (project) => {
      toast.success("Project created successfully!");
      utils.projects.list.invalidate();
      onOpenChange(false);
      router.push(`/projects/${project.id}`);
      // Reset form
      setName("");
      setAddress("");
      setJurisdiction("");
      setProjectType("residential");
      setDescription("");
      setUnitCount("");
      setGrossFloorArea("");
    },
    onError: (error) => {
      // Show upgrade modal for plan limit errors
      if (error.data?.code === "FORBIDDEN" || error.message.includes("plan allows")) {
        onOpenChange(false);
        setUpgradeModalOpen(true);
      } else {
        toast.error(error.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }
    createProject.mutate({
      name: name.trim(),
      address: address.trim() || undefined,
      jurisdiction: jurisdiction || undefined,
      projectType,
      description: description.trim() || undefined,
      unitCount: unitCount ? parseInt(unitCount, 10) : undefined,
      grossFloorArea: grossFloorArea ? parseInt(grossFloorArea, 10) : undefined,
      articleEightyTrack: isBoston && (gfa > 0 || units > 0)
        ? gfa >= 50000 ? "lpr" : (gfa >= 20000 || units >= 15) ? "spr" : "none"
        : undefined,
    });
  };

  return (
    <>
    <UpgradeModal
      open={upgradeModalOpen}
      onOpenChange={setUpgradeModalOpen}
      title="You've reached your project limit"
      description="Your current plan allows a limited number of active projects. Upgrade to Professional for unlimited projects."
    />
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new construction project to track compliance and deadlines.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="e.g., 123 Main Street Renovation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Full project address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Select
                  value={projectType}
                  onValueChange={(v) => setProjectType(v as typeof projectType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Select value={jurisdiction} onValueChange={setJurisdiction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Static Boston-area options — always visible */}
                    {BOSTON_AREA_JURISDICTIONS.map((j) => (
                      <SelectItem key={j.value} value={j.value}>
                        {j.label}
                      </SelectItem>
                    ))}
                    {/* Additional DB jurisdictions not already in the static list */}
                    {jurisdictions
                      ?.filter((j) => !STATIC_JURISDICTION_CODES.has(j.jurisdictionCode))
                      .map((j) => (
                        <SelectItem key={j.id} value={j.jurisdictionCode}>
                          {j.jurisdictionName}
                        </SelectItem>
                      ))}
                    <SelectItem value="other">Other / Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(projectType === "residential" || projectType === "mixed_use") && (
              <div className="space-y-2">
                <Label htmlFor="unitCount">Number of Units <span style={{ color: "#64748B", fontWeight: 400 }}>(optional)</span></Label>
                <Input
                  id="unitCount"
                  type="number"
                  min="1"
                  placeholder="e.g. 12"
                  value={unitCount}
                  onChange={(e) => setUnitCount(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="grossFloorArea">
                  Gross Floor Area (sq ft){" "}
                  <span style={{ color: "#64748B", fontWeight: 400 }}>(optional)</span>
                </Label>
                {article80Badge && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${article80Badge.color}20`,
                      color: article80Badge.color,
                      border: `1px solid ${article80Badge.color}40`,
                    }}
                  >
                    Article 80: {article80Badge.label}
                  </span>
                )}
              </div>
              <Input
                id="grossFloorArea"
                type="number"
                min="1"
                placeholder="e.g. 25000"
                value={grossFloorArea}
                onChange={(e) => setGrossFloorArea(e.target.value)}
              />
              <p className="text-xs" style={{ color: "#64748B" }}>
                Used to determine Article 80 BPDA review — required for 20,000+ sq ft Boston projects (SPR ≥20K, LPR ≥50K)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief project description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
