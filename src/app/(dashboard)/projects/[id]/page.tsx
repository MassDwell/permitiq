"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  Trash2,
  Calendar,
  MapPin,
  Building2,
  Plus,
  Loader2,
  ExternalLink,
  Info,
  Search,
  Settings,
  Save,
  Share2,
  Copy,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { DocumentUploadZone } from "@/components/document-upload-zone";
import { AddComplianceItemDialog } from "@/components/add-compliance-item-dialog";
import { DocumentChat } from "@/components/document-chat";
import { PermitWorkflowTab } from "@/components/permit-workflow/permit-workflow-tab";
import { ComplianceReadinessScore } from "@/components/compliance-readiness-score";
import { SubmissionPrepChecklist } from "@/components/submission-prep-checklist";
import { PermitRequirementsPanel } from "@/components/permit-requirements-panel";
import { Article80Tracker } from "@/components/article80-tracker";
import { AHJContactDirectory } from "@/components/ahj-contact-directory";
import { PermitFeeCalculator } from "@/components/permit-fee-calculator";
import { QuickActionsPanel } from "@/components/quick-actions-panel";
import { AddPermitDialog } from "@/components/permit-workflow/add-permit-dialog";
import { CollaboratorsTab } from "@/components/collaborators-tab";
import { DeadlineForecast } from "@/components/deadline-forecast";
import { HoldCostCalculator } from "@/components/hold-cost-calculator";
import { PermitFeeEstimator } from "@/components/permit-fee-estimator";
import { SoftCostsTab } from "@/components/soft-costs-tab";
import { UpgradeModal } from "@/components/upgrade-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const JURISDICTION_OPTIONS = [
  { value: "BOSTON_ISD", label: "Boston, MA (ISD)" },
  { value: "BOSTON_BPDA", label: "Boston, MA (BPDA)" },
  { value: "BOSTON_ZBA", label: "Boston, MA (ZBA)" },
  { value: "CAMBRIDGE_MA", label: "Cambridge, MA" },
  { value: "SOMERVILLE_MA", label: "Somerville, MA" },
  { value: "NEWTON_MA", label: "Newton, MA" },
  { value: "BROOKLINE_MA", label: "Brookline, MA" },
  { value: "QUINCY_MA", label: "Quincy, MA" },
  { value: "MA_GENERIC", label: "Generic MA" },
  { value: "other", label: "Other / Unknown" },
];

const PROJECT_TYPE_OPTIONS = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "adu", label: "ADU (Accessory Dwelling Unit)" },
  { value: "mixed_use", label: "Mixed Use" },
  { value: "renovation", label: "Renovation" },
];

const PROJECT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "archived", label: "Archived" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "met":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">Met</span>;
    case "pending":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">Pending</span>;
    case "overdue":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">Overdue</span>;
    case "in_progress":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">In Progress</span>;
    case "not_applicable":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-muted-foreground border border-white/10">N/A</span>;
    default:
      return null;
  }
}

function getProcessingBadge(status: string) {
  switch (status) {
    case "completed":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">Processed</span>;
    case "processing":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary border border-secondary/30">Processing...</span>;
    case "failed":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">Failed</span>;
    case "pending":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">Pending</span>;
    default:
      return null;
  }
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>("");
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addPermitOpen, setAddPermitOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [researchPermitType, setResearchPermitType] = useState("");
  const [activeTab, setActiveTab] = useState("permits");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLabel, setShareLabel] = useState("");
  const [generatedShareUrl, setGeneratedShareUrl] = useState("");
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const toggleItemExpand = (id: string) => setExpandedItems((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalConfig, setUpgradeModalConfig] = useState<{ title: string; description: string }>({
    title: "Upgrade to Professional",
    description: "Upgrade to access this feature.",
  });

  // Settings form state
  const [settingsName, setSettingsName] = useState("");
  const [settingsAddress, setSettingsAddress] = useState("");
  const [settingsJurisdiction, setSettingsJurisdiction] = useState("");
  const [settingsProjectType, setSettingsProjectType] = useState<
    "residential" | "commercial" | "adu" | "mixed_use" | "renovation"
  >("residential");
  const [settingsStatus, setSettingsStatus] = useState<
    "active" | "completed" | "on_hold" | "archived"
  >("active");
  const [settingsDescription, setSettingsDescription] = useState("");
  const [settingsUnitCount, setSettingsUnitCount] = useState("");
  const [settingsGrossFloorArea, setSettingsGrossFloorArea] = useState("");
  const [settingsInitialized, setSettingsInitialized] = useState(false);

  const utils = trpc.useUtils();

  const { data: project, isLoading, error } = trpc.projects.get.useQuery(
    { id: projectId },
    { staleTime: 30_000, retry: 2 }
  );
  const { data: profile } = trpc.settings.getProfile.useQuery(
    undefined,
    { staleTime: 60_000 }
  );
  const isStarterPlan = !profile?.plan || profile.plan === "starter";

  const showUpgradeModal = (title: string, description: string) => {
    setUpgradeModalConfig({ title, description });
    setUpgradeModalOpen(true);
  };

  // Initialize settings form when project data loads
  if (project && !settingsInitialized) {
    setSettingsName(project.name);
    setSettingsAddress(project.address ?? "");
    setSettingsJurisdiction(project.jurisdiction ?? "");
    setSettingsProjectType(project.projectType);
    setSettingsStatus(project.status);
    setSettingsDescription(project.description ?? "");
    setSettingsUnitCount(project.unitCount ? String(project.unitCount) : "");
    setSettingsGrossFloorArea(project.grossFloorArea ? String(project.grossFloorArea) : "");
    setSettingsInitialized(true);
  }

  const updateComplianceItem = trpc.compliance.update.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ id: projectId });
      toast.success("Status updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteDocument = trpc.documents.delete.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ id: projectId });
      toast.success("Document deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const processDocument = trpc.documents.processDocument.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ id: projectId });
      toast.success("Document processed successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateProject = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ id: projectId });
      utils.projects.list.invalidate();
      toast.success("Project settings saved");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const researchRequirements = trpc.compliance.researchRequirements.useMutation({
    onSuccess: (data) => {
      utils.projects.get.invalidate({ id: projectId });
      setResearchOpen(false);
      toast.success(
        `Added ${data.items.length} requirements for ${data.jurisdiction}`
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createShare = trpc.shares.create.useMutation({
    onSuccess: (data) => {
      setGeneratedShareUrl(data.url);
      utils.shares.getByProject.invalidate({ projectId });
      toast.success("Shareable link created");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data: existingShares } = trpc.shares.getByProject.useQuery(
    { projectId },
    { enabled: shareDialogOpen }
  );

  const revokeShare = trpc.shares.revoke.useMutation({
    onSuccess: () => {
      utils.shares.getByProject.invalidate({ projectId });
      toast.success("Link revoked");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCopyShareUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2000);
  };

  const updateItem = updateComplianceItem;

  // Group compliance items by permit process
  const getPermitGroup = (item: { ruleId: string | null; source: string | null; requirementType: string; document?: { filename: string } | null }): string => {
    const ruleId = item.ruleId ?? "";
    if (ruleId.startsWith("boston-isd-demo") || /demolition/i.test(item.requirementType)) return "Demolition Permit";
    if (ruleId.startsWith("boston-isd-building")) return "Building Permit";
    if (ruleId.startsWith("boston-isd-trade")) return "Trade Permits";
    if (ruleId.startsWith("boston-isd-article-80-large") || ruleId.startsWith("boston-article-80-large")) return "Article 80 Large Project Review";
    if (ruleId.startsWith("boston-isd-article-80-small") || ruleId.startsWith("boston-article-80-small")) return "Article 80 Small Project Review";
    if (ruleId.startsWith("cambridge")) return "Cambridge Building Permit";
    if (ruleId.startsWith("brookline")) return "Brookline Building Permit";
    if (ruleId.startsWith("salem")) return "Salem Building Permit";
    if (ruleId.startsWith("lowell")) return "Lowell Building Permit";
    if (ruleId.startsWith("springfield")) return "Springfield Building Permit";
    if (ruleId.startsWith("ma-state") || ruleId.startsWith("ma_state") || ruleId.startsWith("ma-statewide")) return "Massachusetts State Requirements";
    if (item.source === "extracted") return item.document?.filename ? `From: ${item.document.filename}` : "Uploaded Documents";
    if (item.source === "manual") return "Custom Requirements";
    return "Other Requirements";
  };

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group); else next.add(group);
      return next;
    });
  };

  const handleStatusChange = (itemId: string, newStatus: string) => {
    updateComplianceItem.mutate({ id: itemId, status: newStatus as "pending" | "in_progress" | "met" | "overdue" | "not_applicable" });
  };

  const toggleArticle80Step = trpc.compliance.toggleArticle80Step.useMutation({
    onSuccess: () => {
      void utils.projects.get.invalidate({ id: projectId });
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to update step");
    },
  });

  const handleArticle80StepClick = (stepId: string, currentStatus: "pending" | "in_progress" | "met", stepDescription: string) => {
    toggleArticle80Step.mutate({ projectId, stepId, stepDescription, currentStatus });
  };

  const handleSettingsSave = () => {
    const gfaValue = settingsGrossFloorArea ? parseInt(settingsGrossFloorArea, 10) : null;
    const unitCountValue = settingsUnitCount ? parseInt(settingsUnitCount, 10) : null;
    const isBoston = (settingsJurisdiction || "").toUpperCase().includes("BOSTON");
    const gfa = gfaValue ?? 0;
    const units = unitCountValue ?? 0;
    const articleEightyTrack = isBoston && (gfa > 0 || units > 0)
      ? gfa >= 50000 ? "lpr" as const : (gfa >= 20000 || units >= 15) ? "spr" as const : "none" as const
      : null;

    updateProject.mutate({
      id: projectId,
      name: settingsName.trim() || project!.name,
      address: settingsAddress.trim() || undefined,
      jurisdiction: settingsJurisdiction || undefined,
      projectType: settingsProjectType,
      status: settingsStatus,
      description: settingsDescription.trim() || undefined,
      unitCount: unitCountValue,
      grossFloorArea: gfaValue,
      articleEightyTrack: articleEightyTrack,
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div
          className="text-center rounded-2xl p-10 max-w-md w-full"
          style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(239,68,68,0.1)' }}
          >
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-[#F1F5F9] mb-2">
            {error ? "Failed to load project" : "Project not found"}
          </h1>
          <p className="text-[#475569] text-sm mb-6">
            {error
              ? "There was a problem loading this project. Please try again."
              : "This project doesn't exist or you don't have access to it."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {error && (
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#94A3B8' }}
              >
                Try Again
              </Button>
            )}
            <Link href="/dashboard">
              <Button className="bg-[#14B8A6] hover:bg-[#0D9488] text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Quick Actions sticky bar */}
      <QuickActionsPanel
        projectId={projectId}
        onUploadClick={() => setActiveTab("documents")}
        onAddComplianceItem={() => setAddItemOpen(true)}
        onAddPermit={() => setAddPermitOpen(true)}
      />

      <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-3">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
            {project.healthStatus === "green" && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-400 border border-teal-500/30">On Track</span>
            )}
            {project.healthStatus === "yellow" && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">Needs Attention</span>
            )}
            {project.healthStatus === "red" && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">At Risk</span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            {project.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {project.address}
              </span>
            )}
            {project.jurisdiction && (
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {project.jurisdiction}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Created {format(new Date(project.createdAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShareDialogOpen(true);
              setGeneratedShareUrl("");
              setShareLabel("");
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Report
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to delete this project? This cannot be undone."
                    )
                  ) {
                    deleteProject.mutate({ id: projectId });
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
          style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#CBD5E1]">Compliance Score</p>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(20,184,166,0.12)', boxShadow: '0 0 12px rgba(20,184,166,0.1)' }}>
              <CheckCircle className="h-4 w-4 text-[#14B8A6]" />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight text-[#14B8A6]">{project.healthScore}%</p>
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full bg-[#14B8A6]" style={{ width: `${project.healthScore}%` }} />
          </div>
        </div>

        <div className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px] cursor-pointer select-none"
          onClick={() => { setActiveTab("compliance"); setStatusFilter(statusFilter === "met" ? null : "met"); }}
          style={{ background: '#1E293B', border: statusFilter === "met" ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.1)', boxShadow: statusFilter === "met" ? '0 0 0 2px rgba(16,185,129,0.15)' : '0 1px 3px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#CBD5E1]">Requirements Met</p>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.12)', boxShadow: '0 0 12px rgba(16,185,129,0.1)' }}>
              <CheckCircle className="h-4 w-4 text-[#10B981]" />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight text-[#10B981]">
            {project.metItems}<span className="text-xl text-[#475569]">/{project.totalItems}</span>
          </p>
          {statusFilter === "met" && <p className="text-xs text-[#10B981] mt-2 font-medium">● Filtering</p>}
        </div>

        <div className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px] cursor-pointer select-none"
          onClick={() => { setActiveTab("compliance"); setStatusFilter(statusFilter === "pending" ? null : "pending"); }}
          style={{ background: '#1E293B', border: statusFilter === "pending" ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.1)', boxShadow: statusFilter === "pending" ? '0 0 0 2px rgba(245,158,11,0.15)' : '0 1px 3px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#CBD5E1]">Pending</p>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.12)', boxShadow: '0 0 12px rgba(245,158,11,0.1)' }}>
              <Clock className="h-4 w-4 text-[#F59E0B]" />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight text-[#F59E0B]">{project.pendingItems}</p>
          {statusFilter === "pending" && <p className="text-xs text-[#F59E0B] mt-2 font-medium">● Filtering</p>}
        </div>

        <div className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px] cursor-pointer select-none"
          onClick={() => { setActiveTab("compliance"); setStatusFilter(statusFilter === "overdue" ? null : "overdue"); }}
          style={{ background: '#1E293B', border: statusFilter === "overdue" ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)', boxShadow: statusFilter === "overdue" ? '0 0 0 2px rgba(239,68,68,0.15)' : '0 1px 3px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#CBD5E1]">Overdue</p>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.12)', boxShadow: '0 0 12px rgba(239,68,68,0.1)' }}>
              <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight text-[#EF4444]">{project.overdueItems}</p>
          {statusFilter === "overdue" && <p className="text-xs text-[#EF4444] mt-2 font-medium">● Filtering</p>}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '0' }}>
          <div className="flex px-0 gap-0 overflow-x-auto scrollbar-none" style={{ whiteSpace: 'nowrap' }}>
            {[
              { value: "permits", label: "Permits" },
              { value: "compliance", label: `Compliance (${project.complianceItems.length})` },
              { value: "documents", label: `Documents (${project.documents.length})` },
              { value: "requirements", label: "Requirements" },
              { value: "submission", label: "Submission Prep" },
              { value: "ask-ai", label: "Ask AI" },
              { value: "financials", label: "Financials" },
              { value: "settings", label: "Settings" },
              { value: "team", label: "Team" },
              { value: "inspections", label: "Inspections", href: `/projects/${projectId}/inspections` },
              { value: "response-assistant", label: "Response Assistant", href: `/projects/${projectId}/response-assistant` },
              { value: "audit-trail", label: "Audit Trail", href: `/projects/${projectId}/audit-trail` },
            ].map((tab) => (
              tab.href ? (
                <Link
                  key={tab.value}
                  href={tab.href}
                  className="px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px shrink-0 whitespace-nowrap"
                  style={{
                    color: '#475569',
                    borderBottomColor: 'transparent',
                    background: 'transparent',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  {tab.label}
                </Link>
              ) : (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className="px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px shrink-0 whitespace-nowrap"
                  style={{
                    color: activeTab === tab.value ? '#14B8A6' : '#475569',
                    borderBottomColor: activeTab === tab.value ? '#14B8A6' : 'transparent',
                    background: 'transparent',
                  }}
                >
                  {tab.label}
                </button>
              )
            ))}
          </div>
        </div>
        <TabsList className="hidden">
          <TabsTrigger value="permits">Permits</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="submission">Submission Prep</TabsTrigger>
          <TabsTrigger value="ask-ai">Ask AI</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* PERMITS TAB */}
        <TabsContent value="permits" className="mt-6">
          <div className="space-y-6">
            <DeadlineForecast
              complianceItems={project.complianceItems}
              projectCreatedAt={project.createdAt}
            />
            {/* Article 80 Tracker — show when project has an Article 80 track set */}
            {(project.articleEightyTrack === "spr" || project.articleEightyTrack === "lpr") && (
              <Article80Tracker
                reviewType={project.articleEightyTrack}
                completedStepIds={project.complianceItems
                  .filter((i) => i.status === "met")
                  .map((i) => i.requirementType)}
                activeStepIds={project.complianceItems
                  .filter((i) => i.status === "in_progress")
                  .map((i) => i.requirementType)}
                onStepClick={handleArticle80StepClick}
              />
            )}
            <PermitWorkflowTab
              projectId={projectId}
              projectJurisdiction={project.jurisdiction}
            />
          </div>
        </TabsContent>

        {/* COMPLIANCE TAB */}
        <TabsContent value="compliance" className="mt-6">
          <div className="space-y-5">
            <ComplianceReadinessScore
              healthScore={project.healthScore}
              metItems={project.metItems}
              totalItems={project.totalItems}
              overdueItems={project.overdueItems}
              pendingItems={project.pendingItems}
              documentCount={project.documents.length}
            />

            {/* Header + action buttons */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Permit Requirements</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Complete each step in order to get your permit approved</p>
                </div>
                {statusFilter && (
                  <button onClick={() => setStatusFilter(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                    style={{ background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.3)', color: '#5EEAD4' }}>
                    {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} only
                    <span className="ml-1 opacity-70">✕</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { const lower = project.name.toLowerCase(); setResearchPermitType(/demo(lition)?/.test(lower) ? "demolition" : ""); setResearchOpen(true); }}>
                  <Search className="h-4 w-4 mr-2" />Research Requirements
                </Button>
                <Button size="sm" onClick={() => setAddItemOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />Add Step
                </Button>
              </div>
            </div>

            {project.complianceItems.length > 0 ? (() => {
              const items = statusFilter
                ? project.complianceItems.filter((i) => i.status === statusFilter)
                : project.complianceItems;
              const totalSteps = items.length;
              const completeSteps = items.filter((i) => i.status === "met").length;
              const pct = totalSteps > 0 ? Math.round((completeSteps / totalSteps) * 100) : 0;
              const allDone = completeSteps === totalSteps;
              const nextActionIdx = items.findIndex((i) => i.status !== "met" && i.status !== "not_applicable");
              const hasAiGenerated = items.some((i) => i.source === "ai_generated");
              const onlyStateRules = items.length > 0 && items.filter((i) => i.jurisdiction !== "MA_STATE" && i.jurisdiction !== "Massachusetts (Statewide Requirements)").length === 0;

              return (
                <>
                  {/* Progress card */}
                  <div className="rounded-xl p-5" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {allDone ? (
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.15)' }}>
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-400">All requirements met!</p>
                          <p className="text-sm text-muted-foreground">All {totalSteps} steps complete — ready to submit.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-[#F1F5F9]">
                            Progress: <span className="text-[#14B8A6] font-bold">{completeSteps} of {totalSteps}</span> steps complete
                          </p>
                          <span className="text-sm font-bold text-[#14B8A6]">{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #14B8A6, #0EA5E9)' }} />
                        </div>
                        {nextActionIdx >= 0 && (
                          <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg" style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.25)' }}>
                            <div className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(14,165,233,0.2)' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#38BDF8' }}>{nextActionIdx + 1}</span>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wide mb-0.5">Next Action</p>
                              <p className="text-sm text-[#CBD5E1]">{items[nextActionIdx]!.description}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Confidence badge */}
                  {onlyStateRules ? (
                    <div className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <span className="text-amber-400 mt-0.5">⚠️</span>
                      <div>
                        <span className="text-amber-300 font-medium">No jurisdiction-specific rules found for {project.jurisdiction ?? "this city"}.</span>
                        <span className="text-amber-200/70 ml-2">Showing Massachusetts state requirements only.</span>
                        <button className="ml-2 text-amber-400 hover:text-amber-300 underline underline-offset-2" onClick={() => { setResearchPermitType(""); setResearchOpen(true); }}>
                          Request rules for this jurisdiction →
                        </button>
                      </div>
                    </div>
                  ) : hasAiGenerated ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#FCD34D' }}>
                      <span>🤖</span><span>AI-researched — verify with local authority</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)', color: '#5EEAD4' }}>
                      <span>✅</span><span>Curated rules — verified by MeritLayer</span>
                    </div>
                  )}

                  {/* Grouped steps */}
                  {(() => {
                    // Build ordered groups preserving insertion order
                    const groupMap = new Map<string, typeof items>();
                    for (const item of items) {
                      const g = getPermitGroup(item);
                      if (!groupMap.has(g)) groupMap.set(g, []);
                      groupMap.get(g)!.push(item);
                    }
                    const groups = Array.from(groupMap.entries());
                    const multiGroup = groups.length > 1;
                    return (
                      <div className="space-y-4">
                        {groups.map(([groupName, groupItems]) => {
                          const collapsed = collapsedGroups.has(groupName);
                          const metCount = groupItems.filter((i) => i.status === "met").length;
                          const overdueCount = groupItems.filter((i) => i.status === "overdue").length;
                          return (
                            <div key={groupName}>
                              {multiGroup && (
                                <button
                                  onClick={() => toggleGroup(groupName)}
                                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl mb-2 text-left transition-colors hover:bg-white/5"
                                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-[#F1F5F9]">{groupName}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,255,255,0.07)', color: '#94A3B8' }}>
                                      {groupItems.length} step{groupItems.length !== 1 ? "s" : ""}
                                    </span>
                                    {overdueCount > 0 && (
                                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}>
                                        {overdueCount} overdue
                                      </span>
                                    )}
                                    {metCount === groupItems.length && (
                                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(16,185,129,0.15)', color: '#4ADE80' }}>
                                        ✓ Complete
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[#475569] text-sm">{collapsed ? "▶" : "▼"}</span>
                                </button>
                              )}
                              {!collapsed && (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  {groupItems.map((item, gIdx) => {
                                    const isLast = gIdx === groupItems.length - 1;
                                    const isExp = expandedItems.has(item.id);
                                    const dotColor = item.status === "met" ? '#10B981' : item.status === "overdue" ? '#EF4444' : item.status === "in_progress" ? '#F59E0B' : '#475569';
                                    const lineColor = item.status === "met" ? 'rgba(16,185,129,0.3)' : 'rgba(51,65,85,0.5)';
                                    const labelColor = item.status === "met" ? '#64748B' : item.status === "overdue" ? '#FCA5A5' : item.status === "in_progress" ? '#FDE68A' : '#E2E8F0';
                                    const statusLabel = item.status === "met" ? "Complete" : item.status === "in_progress" ? "In Progress" : item.status === "overdue" ? "Overdue" : item.status === "not_applicable" ? "N/A" : "Pending";
                                    return (
                                      <div key={item.id} style={{ display: 'flex', gap: 12 }}>
                                        {/* Timeline spine */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 20 }}>
                                          <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${dotColor}`, background: item.status === 'met' ? dotColor : `${dotColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                            {item.status === 'met' ? (
                                              <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>
                                            ) : (
                                              <span style={{ color: dotColor, fontSize: 9, fontWeight: 700 }}>{gIdx + 1}</span>
                                            )}
                                          </div>
                                          {!isLast && (
                                            <div style={{ width: 1, flex: 1, minHeight: 12, background: lineColor, margin: '3px 0' }} />
                                          )}
                                        </div>
                                        {/* Content */}
                                        <div style={{ flex: 1, paddingBottom: isLast ? 4 : 14 }}>
                                          {/* Clickable header row */}
                                          <div onClick={() => toggleItemExpand(item.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, minHeight: 24 }}>
                                            <span style={{ fontSize: 13, fontWeight: 500, color: labelColor, textDecoration: item.status === 'met' ? 'line-through' : 'none', flex: 1, lineHeight: '1.45' }}>
                                              {item.description}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginTop: 1 }}>
                                              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: `${dotColor}22`, color: dotColor, whiteSpace: 'nowrap' }}>{statusLabel}</span>
                                              <span style={{ fontSize: 10, color: '#475569', transition: 'transform 0.15s', display: 'inline-block', transform: isExp ? 'rotate(180deg)' : 'none' }}>▼</span>
                                            </div>
                                          </div>
                                          {/* Expanded panel */}
                                          {isExp && (
                                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                              {(item.sourceText ?? item.reasoning) && (
                                                <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10, lineHeight: 1.55 }}>{item.sourceText ?? item.reasoning}</p>
                                              )}
                                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 10, alignItems: 'center' }}>
                                                {item.deadline && (
                                                  <span style={{ fontSize: 11, color: item.status === "overdue" ? '#F87171' : '#64748B' }}>
                                                    📅 Due {format(new Date(item.deadline), "MMM d, yyyy")}
                                                  </span>
                                                )}
                                                {item.sourceUrl && (
                                                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#38BDF8', textDecoration: 'none' }}>
                                                    🔗 Official source
                                                  </a>
                                                )}
                                                {item.document && (
                                                  <span style={{ fontSize: 11, color: '#64748B' }}>📄 {item.document.filename}</span>
                                                )}
                                              </div>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                <span style={{ fontSize: 11, color: '#64748B' }}>Status:</span>
                                                <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                  style={{ fontSize: 12, borderRadius: 6, padding: '3px 8px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#CBD5E1', outline: 'none', cursor: 'pointer' }}>
                                                  <option value="pending">○ Pending</option>
                                                  <option value="in_progress">→ In Progress</option>
                                                  <option value="met">✓ Complete</option>
                                                  <option value="overdue">⚠ Overdue</option>
                                                  <option value="not_applicable">— N/A</option>
                                                </select>
                                              </div>
                                              {editingNoteId === item.id ? (
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                  <textarea autoFocus rows={2} value={noteText} onChange={(e) => setNoteText(e.target.value)}
                                                    placeholder="Add a note..." style={{ flex: 1, fontSize: 12, padding: '6px 10px', borderRadius: 6, resize: 'none', background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)', color: '#F1F5F9', outline: 'none' }}
                                                    onKeyDown={(e) => { if (e.key === 'Escape') setEditingNoteId(null); }} />
                                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                    <button onClick={() => { updateItem.mutate({ id: item.id, notes: noteText }); setEditingNoteId(null); }}
                                                      style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, background: '#14B8A6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                                                    <button onClick={() => setEditingNoteId(null)}
                                                      style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, background: 'rgba(255,255,255,0.07)', color: '#CBD5E1', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                                  </div>
                                                </div>
                                              ) : item.notes ? (
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                                  <p style={{ flex: 1, fontSize: 12, padding: '6px 10px', borderRadius: 6, background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)', color: '#94A3B8', margin: 0 }}>📝 {item.notes}</p>
                                                  <button onClick={() => { setEditingNoteId(item.id); setNoteText(item.notes ?? ''); }}
                                                    style={{ fontSize: 11, color: '#CBD5E1', background: 'none', border: 'none', cursor: 'pointer', marginTop: 2, flexShrink: 0 }}>Edit</button>
                                                </div>
                                              ) : (
                                                <button onClick={() => { setEditingNoteId(item.id); setNoteText(''); }}
                                                  style={{ fontSize: 11, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ Add note</button>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </>
              );
            })() : (
              <div className="rounded-xl p-12 text-center" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)' }}>
                <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <h3 className="text-lg font-medium text-foreground mb-2">No requirements yet</h3>
                <p className="text-muted-foreground mb-5 max-w-xs mx-auto text-sm">Research requirements for your permit type, or add them manually.</p>
                <div className="flex items-center justify-center gap-3">
                  <Button onClick={() => { const lower = project.name.toLowerCase(); setResearchPermitType(/demo(lition)?/.test(lower) ? "demolition" : ""); setResearchOpen(true); }}>
                    <Search className="h-4 w-4 mr-2" />Research Requirements
                  </Button>
                  <Button variant="outline" onClick={() => setAddItemOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />Add Manually
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Upload permits, inspections, and compliance documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUploadZone projectId={projectId} />

              {project.documents.length > 0 && (
                <div className="mt-6 space-y-3">
                  {project.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <FileText className="h-8 w-8 text-red-400/70 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground truncate">{doc.filename}</p>
                          {getProcessingBadge(doc.processingStatus)}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {doc.docType && (
                            <span className="capitalize">
                              {doc.docType.replace(/_/g, " ")}
                            </span>
                          )}
                          <span>
                            Uploaded {format(new Date(doc.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.processingStatus === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              processDocument.mutate({ documentId: doc.id })
                            }
                            disabled={processDocument.isPending}
                          >
                            {processDocument.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Process"
                            )}
                          </Button>
                        )}
                        <a
                          href={doc.storageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this document?"
                              )
                            ) {
                              deleteDocument.mutate({ id: doc.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* REQUIREMENTS TAB */}
        <TabsContent value="requirements" className="mt-6">
          <div className="space-y-6">
            {/* Article 80 tracker — show when Boston project with GFA set */}
            {project.articleEightyTrack && project.articleEightyTrack !== "none" &&
              (project.jurisdiction ?? "").toUpperCase().includes("BOSTON") && (
              <Article80Tracker
                reviewType={project.articleEightyTrack === "lpr" ? "lpr" : "spr"}
                completedStepIds={project.complianceItems
                  .filter((i) => i.status === "met")
                  .map((i) => i.requirementType)}
                activeStepIds={project.complianceItems
                  .filter((i) => i.status === "in_progress")
                  .map((i) => i.requirementType)}
                onStepClick={handleArticle80StepClick}
              />
            )}
            <PermitRequirementsPanel
              projectId={projectId}
              jurisdiction={project.jurisdiction}
              projectType={project.projectType}
            />
            <AHJContactDirectory jurisdiction={project.jurisdiction} />
            <PermitFeeCalculator
              jurisdiction={project.jurisdiction ?? "boston"}
              showSignupCTA={false}
            />
          </div>
        </TabsContent>

        {/* SUBMISSION PREP TAB */}
        <TabsContent value="submission" className="mt-6">
          <SubmissionPrepChecklist projectId={projectId} />
        </TabsContent>

        {/* TEAM TAB */}
        <TabsContent value="team" className="mt-6">
          {isStarterPlan ? (
            <div
              className="rounded-xl p-10 text-center"
              style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(20,184,166,0.12)' }}>
                <MessageSquare className="h-6 w-6 text-[#14B8A6]" />
              </div>
              <h3 className="text-lg font-semibold text-[#F1F5F9] mb-2">Team Collaboration</h3>
              <p className="text-[#CBD5E1] mb-6 max-w-sm mx-auto text-sm">
                Invite teammates, assign roles, and collaborate on compliance — available on Professional and above.
              </p>
              <button
                onClick={() => showUpgradeModal(
                  "Unlock Team Collaboration",
                  "Invite teammates, assign roles, and share compliance reports with your team. Available on Professional plan."
                )}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
                style={{ background: '#14B8A6', color: '#0F172A' }}
              >
                Upgrade to Collaborate
              </button>
            </div>
          ) : (
            <CollaboratorsTab projectId={projectId} />
          )}
        </TabsContent>

        {/* FINANCIALS TAB */}
        <TabsContent value="financials" className="mt-6">
          <div className="space-y-6">
            <HoldCostCalculator
              complianceScore={project.healthScore}
              projectId={projectId}
            />
            <PermitFeeEstimator />
            <SoftCostsTab projectId={projectId} />
          </div>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>
                Update project details, jurisdiction, and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="settings-name">Project Name</Label>
                <Input
                  id="settings-name"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  placeholder="Project name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-address">Address</Label>
                <Input
                  id="settings-address"
                  value={settingsAddress}
                  onChange={(e) => setSettingsAddress(e.target.value)}
                  placeholder="Full project address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Type</Label>
                  <Select
                    value={settingsProjectType}
                    onValueChange={(v) => setSettingsProjectType(v as typeof settingsProjectType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Project Status</Label>
                  <Select
                    value={settingsStatus}
                    onValueChange={(v) => setSettingsStatus(v as typeof settingsStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Jurisdiction</Label>
                <Select
                  value={settingsJurisdiction}
                  onValueChange={setSettingsJurisdiction}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {JURISDICTION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Setting a jurisdiction enables permit rules lookups and requirements research.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-unit-count">
                    Number of Units{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="settings-unit-count"
                    type="number"
                    min="1"
                    placeholder="e.g. 12"
                    value={settingsUnitCount}
                    onChange={(e) => setSettingsUnitCount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  {(() => {
                    const gfa = settingsGrossFloorArea ? parseInt(settingsGrossFloorArea, 10) : 0;
                    const units = settingsUnitCount ? parseInt(settingsUnitCount, 10) : 0;
                    const isBostonJx = (settingsJurisdiction || "").toUpperCase().includes("BOSTON");
                    const badge = isBostonJx && (gfa > 0 || units > 0)
                      ? gfa >= 50000
                        ? { label: "LPR Required", color: "#EF4444" }
                        : (gfa >= 20000 || units >= 15)
                        ? { label: "SPR Required", color: "#F59E0B" }
                        : { label: "No Article 80", color: "#22C55E" }
                      : null;
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="settings-gfa">
                            Gross Floor Area (sq ft){" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                          </Label>
                          {badge && (
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: `${badge.color}20`,
                                color: badge.color,
                                border: `1px solid ${badge.color}40`,
                              }}
                            >
                              {badge.label}
                            </span>
                          )}
                        </div>
                        <Input
                          id="settings-gfa"
                          type="number"
                          min="1"
                          placeholder="e.g. 25000"
                          value={settingsGrossFloorArea}
                          onChange={(e) => setSettingsGrossFloorArea(e.target.value)}
                        />
                      </>
                    );
                  })()}
                </div>
              </div>
              <p className="text-xs text-muted-foreground -mt-3">
                Boston projects: 15+ units or 20,000+ sq ft require Article 80 BPDA review (SPR); 50,000+ sq ft triggers LPR.
              </p>

              <div className="space-y-2">
                <Label htmlFor="settings-description">Description</Label>
                <Textarea
                  id="settings-description"
                  value={settingsDescription}
                  onChange={(e) => setSettingsDescription(e.target.value)}
                  placeholder="Brief project description..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSettingsSave}
                  disabled={updateProject.isPending}
                >
                  {updateProject.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASK AI TAB */}
        <TabsContent value="ask-ai" className="mt-6">
          {isStarterPlan ? (
            <div
              className="rounded-xl p-10 text-center"
              style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(20,184,166,0.12)' }}>
                <MessageSquare className="h-6 w-6 text-[#14B8A6]" />
              </div>
              <h3 className="text-lg font-semibold text-[#F1F5F9] mb-2">AI Document Chat</h3>
              <p className="text-[#CBD5E1] mb-6 max-w-sm mx-auto text-sm">
                Ask questions about your permit documents and get instant answers powered by AI — available on Professional and above.
              </p>
              <button
                onClick={() => showUpgradeModal(
                  "Unlock AI Document Chat",
                  "Ask questions about your permits and compliance documents and get instant AI-powered answers. Available on Professional plan."
                )}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
                style={{ background: '#14B8A6', color: '#0F172A' }}
              >
                Upgrade to Use AI Chat
              </button>
            </div>
          ) : (
            <DocumentChat projectId={projectId} />
          )}
        </TabsContent>
      </Tabs>

      {/* SHARE REPORT DIALOG */}
      <Dialog open={shareDialogOpen} onOpenChange={(open) => { setShareDialogOpen(open); if (!open) { setGeneratedShareUrl(""); setShareLabel(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[#14B8A6]" />
              Create Shareable Link
            </DialogTitle>
            <DialogDescription>
              Generate a read-only compliance report link for lenders, investors, or attorneys.
            </DialogDescription>
          </DialogHeader>

          {!generatedShareUrl ? (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="share-label">Label <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="share-label"
                  placeholder="e.g. For First Republic Bank"
                  value={shareLabel}
                  onChange={(e) => setShareLabel(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground rounded-lg border border-white/10 bg-white/5 p-3">
                This link gives read-only access. Anyone with the link can view this compliance report.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShareDialogOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => createShare.mutate({ projectId, label: shareLabel.trim() || undefined })}
                  disabled={createShare.isPending}
                >
                  {createShare.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Share2 className="h-4 w-4 mr-2" />}
                  Generate Link
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Your shareable link</Label>
                <div className="flex items-center gap-2">
                  <Input value={generatedShareUrl} readOnly className="text-xs" />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopyShareUrl(generatedShareUrl)}
                  >
                    {copiedShareUrl ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This link gives read-only access. Anyone with the link can view this report.
              </p>
            </div>
          )}

          {existingShares && existingShares.length > 0 && (
            <div className="border-t border-white/10 pt-4 mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Active Links</p>
              <div className="space-y-2">
                {existingShares.map((s) => {
                  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
                  const url = `${baseUrl}/share/${s.shareToken}`;
                  return (
                    <div key={s.id} className="flex items-center justify-between gap-2 text-xs rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <div className="truncate min-w-0">
                        <p className="font-medium text-foreground truncate">{s.label ?? "Untitled link"}</p>
                        <p className="text-muted-foreground">{s.viewCount ?? 0} views · {s.createdAt ? format(new Date(s.createdAt), "MMM d") : ""}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopyShareUrl(url)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-500 hover:text-red-400"
                          onClick={() => revokeShare.mutate({ shareId: s.id })}
                          disabled={revokeShare.isPending}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddComplianceItemDialog
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        projectId={projectId}
      />

      <AddPermitDialog
        open={addPermitOpen}
        onOpenChange={setAddPermitOpen}
        projectId={projectId}
        defaultJurisdiction={project.jurisdiction ?? undefined}
      />

      <Dialog open={researchOpen} onOpenChange={setResearchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Research Requirements</DialogTitle>
            <DialogDescription>
              What permit type is this project? We&apos;ll look up the requirements for you.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            {/* Quick-select buttons for common permit types */}
            <div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>Quick select:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[
                  { label: "Boston Building Permit", value: "Boston building permit" },
                  { label: "Article 80 LPR", value: "Article 80 Large Project Review Boston" },
                  { label: "Article 80 SPR", value: "Article 80 Small Project Review Boston" },
                  { label: "Demolition", value: "Boston demolition permit" },
                  { label: "Electrical", value: "Boston electrical permit" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setResearchPermitType(opt.value)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      cursor: "pointer",
                      background: researchPermitType === opt.value ? "rgba(20,184,166,0.2)" : "rgba(51,65,85,0.4)",
                      border: researchPermitType === opt.value ? "1px solid rgba(20,184,166,0.5)" : "1px solid rgba(71,85,105,0.5)",
                      color: researchPermitType === opt.value ? "#14B8A6" : "#94A3B8",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="permitType" className="mb-2 block">Or enter a permit type</Label>
              <Input
                id="permitType"
                placeholder="e.g. demolition, building permit, electrical..."
                value={researchPermitType}
                onChange={(e) => setResearchPermitType(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && researchPermitType.trim()) {
                    researchRequirements.mutate({ projectId, permitType: researchPermitType.trim() });
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResearchOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => researchRequirements.mutate({ projectId, permitType: researchPermitType.trim() })}
              disabled={!researchPermitType.trim() || researchRequirements.isPending}
            >
              {researchRequirements.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Research
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        title={upgradeModalConfig.title}
        description={upgradeModalConfig.description}
      />
      </div> {/* end p-8 */}
    </div>
  );
}
