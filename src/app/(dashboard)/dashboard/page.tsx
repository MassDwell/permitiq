"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Plus,
  FolderOpen,
  FileText,
  Clock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  LayoutGrid,
  TableIcon,
} from "lucide-react";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { WelcomeBanner } from "@/components/welcome-banner";
import { ActivityFeed } from "@/components/activity-feed";
import { OnboardingModal } from "@/components/onboarding-modal";
import { EmptyState } from "@/components/empty-state";
import { ProjectTable } from "@/components/project-table";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function getHealthDot(status: "green" | "yellow" | "red") {
  switch (status) {
    case "green": return "bg-teal-400";
    case "yellow": return "bg-amber-400";
    case "red": return "bg-red-400";
    default: return "bg-muted-foreground";
  }
}

type ViewMode = "table" | "grid";

function DashboardPageContent() {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load view preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("meritlayer-dashboard-view");
      if (saved === "grid" || saved === "table") {
        setViewMode(saved);
      }
    }
  }, []);

  // Persist view preference
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("meritlayer-dashboard-view", mode);
    }
  };

  const claimPendingInvite = trpc.collaborators.claimPendingInvite.useMutation({
    onSuccess: ({ projectId }) => {
      document.cookie = "meritlayer_invite_token=; path=/; max-age=0";
      router.push(`/projects/${projectId}`);
    },
  });

  // On mount, claim any pending invite stored in cookie after sign-up redirect
  useEffect(() => {
    if (typeof document === "undefined") return;
    const match = document.cookie.match(/(?:^|;\s*)meritlayer_invite_token=([^;]+)/);
    const pendingToken = match?.[1];
    if (pendingToken) {
      claimPendingInvite.mutate({ token: pendingToken });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: projects, isLoading: projectsLoading } =
    trpc.projects.list.useQuery(undefined, { staleTime: 30_000 });
  const { data: upcomingDeadlines, isLoading: deadlinesLoading } =
    trpc.projects.getUpcomingDeadlines.useQuery({ days: 30 }, { staleTime: 30_000 });
  const { data: profile } = trpc.settings.getProfile.useQuery(undefined, { staleTime: 60_000 });
  const { data: velocityData } = trpc.projects.getComplianceVelocity.useQuery(undefined, { staleTime: 60_000 });

  // Show success toast on post-checkout redirect (?welcome=true)
  useEffect(() => {
    const isWelcome = searchParams.get("welcome") === "true";
    if (isWelcome) {
      const hasShownToast = sessionStorage.getItem("checkout-success-shown");
      if (!hasShownToast) {
        toast.success("Welcome to MeritLayer! 🎉", {
          description: "Your subscription is now active. Let's create your first project.",
          duration: 6000,
        });
        sessionStorage.setItem("checkout-success-shown", "true");
      }
    }
  }, [searchParams]);

  // Trigger onboarding on ?welcome=true or when user has zero projects
  useEffect(() => {
    const isWelcome = searchParams.get("welcome") === "true";
    const alreadyDone = typeof window !== "undefined"
      ? localStorage.getItem("meritlayer-onboarding-complete") === "true"
      : true;
    if (isWelcome && !alreadyDone) {
      setShowOnboarding(true);
    }
  }, [searchParams]);

  const totalProjects = projects?.length || 0;
  const totalDocuments = projects?.reduce((acc, p) => acc + p.documentCount, 0) || 0;
  const overdueItems = projects?.reduce((acc, p) => acc + p.overdueItems, 0) || 0;
  const avgHealth =
    projects && projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + p.healthScore, 0) / projects.length)
      : 100;

  const atRiskCount = projects?.filter((p) => p.healthStatus === "red").length ?? 0;
  const needsAttentionCount = projects?.filter((p) => p.healthStatus === "yellow").length ?? 0;
  const onTrackCount = projects?.filter((p) => p.healthStatus === "green").length ?? 0;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const allComplianceItems = projects?.flatMap((p) => p.complianceItems) ?? [];

  const dueSoonCount =
    upcomingDeadlines?.filter((item) => {
      if (!item.deadline) return false;
      const d = new Date(item.deadline);
      return d >= now && d <= sevenDaysFromNow;
    }).length ?? 0;

  const thisWeekCompleted = allComplianceItems.filter(
    (item) => item.status === "met" && new Date(item.updatedAt) >= sevenDaysAgo
  ).length;

  const lastWeekCompleted = allComplianceItems.filter(
    (item) =>
      item.status === "met" &&
      new Date(item.updatedAt) >= fourteenDaysAgo &&
      new Date(item.updatedAt) < sevenDaysAgo
  ).length;

  const velocityTrend =
    thisWeekCompleted > lastWeekCompleted
      ? "improving"
      : thisWeekCompleted < lastWeekCompleted
      ? "declining"
      : "stable";

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back{profile?.name ? `, ${profile.name}` : ""}
          </p>
        </div>
        <Button onClick={() => setCreateProjectOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Welcome Banner — shown for new users with 0 projects */}
      <WelcomeBanner
        projectCount={totalProjects}
        onCreateProject={() => setCreateProjectOpen(true)}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Total Projects */}
        <div className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
          style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#CBD5E1]">Total Projects</p>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(20,184,166,0.12)', boxShadow: '0 0 12px rgba(20,184,166,0.1)' }}>
              <FolderOpen className="h-4 w-4 text-[#14B8A6]" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#F1F5F9] tracking-tight">{totalProjects}</p>
        </div>

        {/* Items Due This Week */}
        <div className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
          style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#CBD5E1]">Due This Week</p>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{
                background: dueSoonCount > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
                boxShadow: dueSoonCount > 0 ? '0 0 12px rgba(239,68,68,0.1)' : '0 0 12px rgba(99,102,241,0.1)',
              }}>
              <Clock className="h-4 w-4" style={{ color: dueSoonCount > 0 ? '#EF4444' : '#6366F1' }} />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight" style={{ color: dueSoonCount > 0 ? '#EF4444' : '#F1F5F9' }}>
            {dueSoonCount}
          </p>
        </div>

        {/* Avg Compliance Score */}
        <div className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
          style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#CBD5E1]">Avg Compliance</p>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(20,184,166,0.12)', boxShadow: '0 0 12px rgba(20,184,166,0.1)' }}>
              <CheckCircle className="h-4 w-4 text-[#14B8A6]" />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight"
            style={{ color: avgHealth >= 80 ? '#14B8A6' : avgHealth >= 60 ? '#F59E0B' : '#EF4444' }}>
            {avgHealth}%
          </p>
        </div>

        {/* Documents Processed */}
        <div className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
          style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#CBD5E1]">Documents Processed</p>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.12)', boxShadow: '0 0 12px rgba(99,102,241,0.1)' }}>
              <FileText className="h-4 w-4 text-[#6366F1]" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#F1F5F9] tracking-tight">{totalDocuments}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <div className="lg:col-span-2">
          <div className="rounded-xl overflow-hidden" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h2 className="text-base font-semibold text-[#F1F5F9]">Projects</h2>
                <p className="text-sm text-[#475569] mt-0.5">Your active construction projects</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleViewModeChange("table")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "table"
                      ? "bg-[rgba(255,255,255,0.1)] text-[#F1F5F9]"
                      : "text-[#64748B] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)]"
                  }`}
                  title="Table view"
                >
                  <TableIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleViewModeChange("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-[rgba(255,255,255,0.1)] text-[#F1F5F9]"
                      : "text-[#64748B] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)]"
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <Button
                  size="sm"
                  onClick={() => setCreateProjectOpen(true)}
                  className="ml-2 bg-[#14B8A6] hover:bg-[#0D9488] text-white h-8 px-3"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Project
                </Button>
              </div>
            </div>
            <div className="p-4">
              {projectsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : projects && projects.length > 0 ? (
                viewMode === "table" ? (
                  <ProjectTable projects={projects} />
                ) : (
                  <div className="space-y-2">
                    {projects.map((project) => {
                      const dotColor = project.healthStatus === 'green' ? '#14B8A6' : project.healthStatus === 'yellow' ? '#F59E0B' : '#EF4444';
                      const dotGlow = project.healthStatus === 'green' ? 'rgba(20,184,166,0.6)' : project.healthStatus === 'yellow' ? 'rgba(245,158,11,0.6)' : 'rgba(239,68,68,0.6)';
                      return (
                        <Link key={project.id} href={`/projects/${project.id}`} className="block">
                          <div className="flex items-center gap-4 px-4 py-3.5 rounded-lg cursor-pointer transition-all duration-150 hover:bg-[rgba(255,255,255,0.03)]"
                            style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: dotColor, boxShadow: `0 0 6px ${dotGlow}` }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#F1F5F9] truncate">{project.name}</p>
                              <p className="text-xs text-[#475569] truncate">{project.address || "No address"}</p>
                            </div>
                            <div className="w-20 shrink-0">
                              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                <div className="h-full rounded-full" style={{ width: `${project.healthScore}%`, background: '#14B8A6' }} />
                              </div>
                              <p className="text-xs text-[#475569] text-right mt-0.5">{project.healthScore}%</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-[#334155] shrink-0" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )
              ) : (
                <EmptyState
                  icon={<FolderOpen />}
                  title="No projects yet"
                  description="Add your first project to get started."
                  action={{ label: "Add Project", onClick: () => setCreateProjectOpen(true) }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <Card className="bg-card border border-white/10 rounded-xl">
            <CardHeader>
              <CardTitle className="text-foreground">Upcoming Deadlines</CardTitle>
              <CardDescription className="text-muted-foreground">Next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {deadlinesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                <div className="space-y-2">
                  {upcomingDeadlines.slice(0, 5).map((item) => {
                    const deadline = item.deadline ? new Date(item.deadline) : null;
                    const daysUntil = deadline
                      ? Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : null;

                    return (
                      <Link
                        key={item.id}
                        href={`/projects/${item.projectId}`}
                        className="block"
                      >
                        <div className="p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                          <div className="flex items-start gap-3">
                            <Clock
                              className={`h-4 w-4 mt-0.5 shrink-0 ${
                                daysUntil && daysUntil <= 3
                                  ? "text-red-400"
                                  : daysUntil && daysUntil <= 7
                                  ? "text-amber-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {item.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.project.name}
                              </p>
                              {deadline && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {format(deadline, "MMM d, yyyy")}
                                  {daysUntil !== null && (
                                    <span
                                      className={`ml-2 ${
                                        daysUntil <= 3 ? "text-red-400 font-medium" : ""
                                      }`}
                                    >
                                      ({daysUntil} days)
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {upcomingDeadlines.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      +{upcomingDeadlines.length - 5} more deadlines
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-10 w-10 text-teal-400/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Portfolio Risk Section */}
      {projects && projects.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">Portfolio Risk</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="grid grid-cols-3 gap-4 lg:col-span-2">
              <Card className="bg-card border border-red-500/20 rounded-xl hover:border-red-500/30 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-red-400">At Risk</CardTitle>
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tabular-nums text-red-400">{atRiskCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {atRiskCount === 1 ? "project" : "projects"} with overdue items
                  </p>
                  {atRiskCount > 0 && (
                    <div className="mt-2 space-y-1">
                      {projects.filter((p) => p.healthStatus === "red").slice(0, 2).map((p) => (
                        <Link key={p.id} href={`/projects/${p.id}`}>
                          <p className="text-xs text-red-400 hover:underline truncate">{p.name}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border border-amber-500/20 rounded-xl hover:border-amber-500/30 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-amber-400">Needs Attention</CardTitle>
                    <ShieldQuestion className="h-4 w-4 text-amber-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tabular-nums text-amber-400">{needsAttentionCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {needsAttentionCount === 1 ? "project" : "projects"} below 80%
                  </p>
                  {needsAttentionCount > 0 && (
                    <div className="mt-2 space-y-1">
                      {projects.filter((p) => p.healthStatus === "yellow").slice(0, 2).map((p) => (
                        <Link key={p.id} href={`/projects/${p.id}`}>
                          <p className="text-xs text-amber-400 hover:underline truncate">{p.name}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border border-teal-500/20 rounded-xl hover:border-teal-500/30 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-teal-400">On Track</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-teal-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tabular-nums text-teal-400">{onTrackCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {onTrackCount === 1 ? "project" : "projects"} on track
                  </p>
                  {onTrackCount > 0 && (
                    <div className="mt-2 space-y-1">
                      {projects.filter((p) => p.healthStatus === "green").slice(0, 2).map((p) => (
                        <Link key={p.id} href={`/projects/${p.id}`}>
                          <p className="text-xs text-teal-400 hover:underline truncate">{p.name}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Compliance Velocity */}
            <Card className="bg-card border border-white/10 rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Compliance Velocity
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Avg health score — last 4 weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const hasSnapshots = velocityData?.some((w) => w.snapshotCount > 0);

                  if (!hasSnapshots) {
                    return (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          {velocityTrend === "improving" ? (
                            <TrendingUp className="h-8 w-8 text-teal-400" />
                          ) : velocityTrend === "declining" ? (
                            <TrendingDown className="h-8 w-8 text-red-400" />
                          ) : (
                            <Minus className="h-8 w-8 text-muted-foreground" />
                          )}
                          <div>
                            <p className={`text-lg font-bold ${
                              velocityTrend === "improving" ? "text-teal-400" :
                              velocityTrend === "declining" ? "text-red-400" :
                              "text-muted-foreground"
                            }`}>
                              {velocityTrend === "improving" ? "Improving" :
                               velocityTrend === "declining" ? "Declining" : "Stable"}
                            </p>
                            <p className="text-xs text-muted-foreground">compliance pace</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">This week</span>
                            <span className="font-semibold text-foreground">{thisWeekCompleted} items</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Last week</span>
                            <span className="font-semibold text-foreground">{lastWeekCompleted} items</span>
                          </div>
                        </div>
                        {allComplianceItems.length === 0 && (
                          <p className="text-xs text-muted-foreground mt-3">
                            Upload your first document to start tracking compliance velocity.
                          </p>
                        )}
                      </>
                    );
                  }

                  const weeks = velocityData ?? [];
                  const scores = weeks.map((w) => w.avgScore ?? 0);
                  const lastScore = scores[3] ?? 0;
                  const prevScore = scores[2] ?? 0;
                  const delta = lastScore - prevScore;
                  const BAR_H = 48;

                  return (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        {delta > 0 ? (
                          <TrendingUp className="h-5 w-5 text-teal-400" />
                        ) : delta < 0 ? (
                          <TrendingDown className="h-5 w-5 text-red-400" />
                        ) : (
                          <Minus className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className={`text-sm font-semibold ${
                          delta > 0 ? "text-teal-400" : delta < 0 ? "text-red-400" : "text-muted-foreground"
                        }`}>
                          {delta > 0 ? `Up +${delta} pts this week` :
                           delta < 0 ? `Down ${delta} pts this week` : "Stable this week"}
                        </span>
                      </div>

                      <div className="flex items-end gap-2 mb-3" style={{ height: BAR_H + 4 }}>
                        {weeks.map((w, i) => {
                          const score = w.avgScore ?? 0;
                          const barH = w.avgScore !== null ? Math.max(4, Math.round((score / 100) * BAR_H)) : 4;
                          const isLatest = i === weeks.length - 1;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1" style={{ height: BAR_H + 4 }}>
                              <div
                                style={{ height: barH }}
                                className={`w-full rounded-t transition-all ${
                                  w.avgScore === null ? "bg-white/10" :
                                  isLatest ? "bg-primary" :
                                  score >= 80 ? "bg-teal-400/60" :
                                  score >= 60 ? "bg-amber-400/60" :
                                  "bg-red-400/60"
                                }`}
                                title={w.avgScore !== null ? `${w.label}: ${score}%` : `${w.label}: no data`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {weeks.map((w, i) => (
                          <div key={i} className="flex-1 text-center truncate">{w.label}</div>
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">
                        Current avg: <span className="font-medium text-foreground">{lastScore}%</span>
                      </p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Recent Activity Feed */}
      {projects && projects.length > 0 && (
        <div className="mt-8">
          <div className="rounded-xl overflow-hidden" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-base font-semibold text-[#F1F5F9]">Recent Activity</h2>
              <p className="text-sm text-[#475569] mt-0.5">Latest updates across all projects</p>
            </div>
            <div className="p-2">
              <ActivityFeed
                projects={projects}
                upcomingDeadlines={upcomingDeadlines ?? []}
              />
            </div>
          </div>
        </div>
      )}

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />

      {/* Onboarding modal — triggered on ?welcome=true or auto for new users (localStorage gated) */}
      {!projectsLoading && (
        <OnboardingModal
          userName={profile?.name}
          forceOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardPageContent />
    </Suspense>
  );
}
// cache-bust 1773391466
