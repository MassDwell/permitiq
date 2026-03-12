"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Plus,
  FolderOpen,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { useState } from "react";

function getHealthBadge(status: "green" | "yellow" | "red") {
  switch (status) {
    case "green":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-500/20 text-teal-400 border border-teal-500/30">
          On Track
        </span>
      );
    case "yellow":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Needs Attention
        </span>
      );
    case "red":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
          At Risk
        </span>
      );
    default:
      return null;
  }
}

function getHealthDot(status: "green" | "yellow" | "red") {
  switch (status) {
    case "green": return "bg-teal-400";
    case "yellow": return "bg-amber-400";
    case "red": return "bg-red-400";
    default: return "bg-muted-foreground";
  }
}

export default function DashboardPage() {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const { data: projects, isLoading: projectsLoading } =
    trpc.projects.list.useQuery();
  const { data: upcomingDeadlines, isLoading: deadlinesLoading } =
    trpc.projects.getUpcomingDeadlines.useQuery({ days: 30 });
  const { data: profile } = trpc.settings.getProfile.useQuery();
  const { data: velocityData } = trpc.projects.getComplianceVelocity.useQuery();

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

  const allComplianceItems = projects?.flatMap((p) => p.complianceItems) ?? [];

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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border border-white/10 rounded-xl hover:border-white/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active Projects
            </CardTitle>
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <FolderOpen className="h-3.5 w-3.5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-foreground">{totalProjects}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-white/10 rounded-xl hover:border-white/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Documents
            </CardTitle>
            <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-foreground">{totalDocuments}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-white/10 rounded-xl hover:border-white/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Overdue Items
            </CardTitle>
            <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-red-400">{overdueItems}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-white/10 rounded-xl hover:border-white/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Avg Compliance
            </CardTitle>
            <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center">
              <CheckCircle className="h-3.5 w-3.5 text-teal-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-foreground">{avgHealth}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <div className="lg:col-span-2">
          <Card className="bg-card border border-white/10 rounded-xl">
            <CardHeader>
              <CardTitle className="text-foreground">Projects</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your active construction projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:-translate-y-px hover:shadow-lg transition-all bg-white/[0.02]">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${getHealthDot(project.healthStatus)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground truncate">
                              {project.name}
                            </h3>
                            {getHealthBadge(project.healthStatus)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {project.address || "No address"}
                          </p>
                          <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                            <span>{project.documentCount} docs</span>
                            <span>
                              {project.metItems}/{project.totalItems} requirements met
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <Progress
                            value={project.healthScore}
                            className="w-24 h-1.5 bg-white/10"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {project.healthScore}%
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No projects yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first project to start tracking compliance
                  </p>
                  <Button onClick={() => setCreateProjectOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
    </div>
  );
}
