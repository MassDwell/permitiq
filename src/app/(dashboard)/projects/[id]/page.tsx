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
import { AHJContactDirectory } from "@/components/ahj-contact-directory";
import { PermitFeeCalculator } from "@/components/permit-fee-calculator";
import { QuickActionsPanel } from "@/components/quick-actions-panel";
import { AddPermitDialog } from "@/components/permit-workflow/add-permit-dialog";
import { CollaboratorsTab } from "@/components/collaborators-tab";
import { DeadlineForecast } from "@/components/deadline-forecast";
import { HoldCostCalculator } from "@/components/hold-cost-calculator";
import { PermitFeeEstimator } from "@/components/permit-fee-estimator";
import { SoftCostsTab } from "@/components/soft-costs-tab";
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

  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addPermitOpen, setAddPermitOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [researchPermitType, setResearchPermitType] = useState("");
  const [activeTab, setActiveTab] = useState("permits");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLabel, setShareLabel] = useState("");
  const [generatedShareUrl, setGeneratedShareUrl] = useState("");
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

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
  const [settingsInitialized, setSettingsInitialized] = useState(false);

  const utils = trpc.useUtils();

  const { data: project, isLoading } = trpc.projects.get.useQuery({
    id: projectId,
  });

  // Initialize settings form when project data loads
  if (project && !settingsInitialized) {
    setSettingsName(project.name);
    setSettingsAddress(project.address ?? "");
    setSettingsJurisdiction(project.jurisdiction ?? "");
    setSettingsProjectType(project.projectType);
    setSettingsStatus(project.status);
    setSettingsDescription(project.description ?? "");
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

  const handleStatusChange = (itemId: string, newStatus: "met" | "pending") => {
    updateComplianceItem.mutate({ id: itemId, status: newStatus });
  };

  const handleSettingsSave = () => {
    updateProject.mutate({
      id: projectId,
      name: settingsName.trim() || project!.name,
      address: settingsAddress.trim() || undefined,
      jurisdiction: settingsJurisdiction || undefined,
      projectType: settingsProjectType,
      status: settingsStatus,
      description: settingsDescription.trim() || undefined,
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

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Project not found
        </h1>
        <p className="text-muted-foreground mb-4">
          This project doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link href="/dashboard">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
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

      <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
          style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#64748B]">Compliance Score</p>
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

        <div className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
          style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#64748B]">Requirements Met</p>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.12)', boxShadow: '0 0 12px rgba(16,185,129,0.1)' }}>
              <CheckCircle className="h-4 w-4 text-[#10B981]" />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight text-[#10B981]">
            {project.metItems}<span className="text-xl text-[#475569]">/{project.totalItems}</span>
          </p>
        </div>

        <div className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
          style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#64748B]">Pending</p>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.12)', boxShadow: '0 0 12px rgba(245,158,11,0.1)' }}>
              <Clock className="h-4 w-4 text-[#F59E0B]" />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight text-[#F59E0B]">{project.pendingItems}</p>
        </div>

        <div className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
          style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#64748B]">Overdue</p>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.12)', boxShadow: '0 0 12px rgba(239,68,68,0.1)' }}>
              <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight text-[#EF4444]">{project.overdueItems}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '0' }}>
          <div className="flex px-0 gap-0 flex-wrap">
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
                  className="px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px"
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
                  className="px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px"
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
            <PermitWorkflowTab
              projectId={projectId}
              projectJurisdiction={project.jurisdiction}
            />
          </div>
        </TabsContent>

        {/* COMPLIANCE TAB */}
        <TabsContent value="compliance" className="mt-6">
          <div className="space-y-6">
            <ComplianceReadinessScore
              healthScore={project.healthScore}
              metItems={project.metItems}
              totalItems={project.totalItems}
              overdueItems={project.overdueItems}
              pendingItems={project.pendingItems}
              documentCount={project.documents.length}
            />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Compliance Checklist</CardTitle>
                  <CardDescription>
                    Track all requirements for this project
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const lower = project.name.toLowerCase();
                      const prefill = /demo(lition)?/.test(lower) ? "demolition" : "";
                      setResearchPermitType(prefill);
                      setResearchOpen(true);
                    }}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Research Requirements
                  </Button>
                  <Button onClick={() => setAddItemOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {project.complianceItems.length > 0 ? (
                  <div className="space-y-2">
                    {project.complianceItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <Checkbox
                          checked={item.status === "met"}
                          disabled={item.status === "overdue"}
                          onCheckedChange={(checked) =>
                            handleStatusChange(
                              item.id,
                              checked ? "met" : "pending"
                            )
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-medium ${
                                item.status === "met"
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {item.description}
                            </p>
                            {getStatusBadge(item.status)}
                            {item.sourceUrl && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                                    <Info className="h-4 w-4" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="start">
                                  <div className="space-y-3 text-sm">
                                    <div>
                                      <p className="font-semibold text-gray-700 mb-1">Source</p>
                                      <a
                                        href={item.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline break-all"
                                      >
                                        {(() => {
                                          try {
                                            const u = new URL(item.sourceUrl);
                                            const path = u.pathname.length > 30 ? u.pathname.slice(0, 30) + "…" : u.pathname;
                                            return u.hostname + path;
                                          } catch {
                                            return item.sourceUrl;
                                          }
                                        })()}
                                      </a>
                                    </div>
                                    {item.sourceText && (
                                      <div>
                                        <p className="font-semibold text-gray-700 mb-1">Evidence</p>
                                        <blockquote className="border-l-2 border-gray-200 pl-3 text-gray-600 italic">
                                          {item.sourceText}
                                        </blockquote>
                                      </div>
                                    )}
                                    {item.reasoning && (
                                      <div>
                                        <p className="font-semibold text-gray-700 mb-1">Why this applies</p>
                                        <p className="text-gray-600">{item.reasoning}</p>
                                      </div>
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="capitalize">
                              {item.requirementType.replace(/_/g, " ")}
                            </span>
                            {item.deadline && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Due {format(new Date(item.deadline), "MMM d, yyyy")}
                              </span>
                            )}
                            {item.document && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {item.document.filename}
                              </span>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No compliance items yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Upload documents to auto-extract requirements, or add them
                      manually.
                    </p>
                    <Button onClick={() => setAddItemOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Compliance Item
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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
          <CollaboratorsTab projectId={projectId} />
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
          <DocumentChat projectId={projectId} />
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
          <div className="py-2">
            <Label htmlFor="permitType" className="mb-2 block">Permit type</Label>
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
      </div> {/* end p-8 */}
    </div>
  );
}
