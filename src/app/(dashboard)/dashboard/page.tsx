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
import { Badge } from "@/components/ui/badge";
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

function getHealthColor(status: "green" | "yellow" | "red") {
  switch (status) {
    case "green":
      return "bg-green-500";
    case "yellow":
      return "bg-yellow-500";
    case "red":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

function getHealthBadge(status: "green" | "yellow" | "red") {
  switch (status) {
    case "green":
      return <Badge className="bg-green-100 text-green-800">On Track</Badge>;
    case "yellow":
      return <Badge className="bg-yellow-100 text-yellow-800">Needs Attention</Badge>;
    case "red":
      return <Badge className="bg-red-100 text-red-800">At Risk</Badge>;
    default:
      return null;
  }
}

export default function DashboardPage() {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const { data: projects, isLoading: projectsLoading } =
    trpc.projects.list.useQuery();
  const { data: upcomingDeadlines, isLoading: deadlinesLoading } =
    trpc.projects.getUpcomingDeadlines.useQuery({ days: 30 });
  const { data: profile } = trpc.settings.getProfile.useQuery();

  // Calculate stats
  const totalProjects = projects?.length || 0;
  const totalDocuments = projects?.reduce((acc, p) => acc + p.documentCount, 0) || 0;
  const overdueItems = projects?.reduce((acc, p) => acc + p.overdueItems, 0) || 0;
  const avgHealth =
    projects && projects.length > 0
      ? Math.round(
          projects.reduce((acc, p) => acc + p.healthScore, 0) / projects.length
        )
      : 100;

  // Portfolio risk breakdown
  const atRiskCount = projects?.filter((p) => p.healthStatus === "red").length ?? 0;
  const needsAttentionCount = projects?.filter((p) => p.healthStatus === "yellow").length ?? 0;
  const onTrackCount = projects?.filter((p) => p.healthStatus === "green").length ?? 0;

  // Compliance velocity — items completed this week vs. last week
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back{profile?.name ? `, ${profile.name}` : ""}
          </p>
        </div>
        <Button onClick={() => setCreateProjectOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Projects
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Overdue Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avg Compliance
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHealth}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>
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
                <div className="space-y-4">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div
                          className={`w-3 h-3 rounded-full ${getHealthColor(
                            project.healthStatus
                          )}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">
                              {project.name}
                            </h3>
                            {getHealthBadge(project.healthStatus)}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {project.address || "No address"}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>{project.documentCount} docs</span>
                            <span>
                              {project.metItems}/{project.totalItems} requirements met
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Progress
                            value={project.healthScore}
                            className="w-24 h-2"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {project.healthScore}%
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No projects yet
                  </h3>
                  <p className="text-gray-500 mb-4">
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
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {deadlinesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                <div className="space-y-3">
                  {upcomingDeadlines.slice(0, 5).map((item) => {
                    const deadline = item.deadline ? new Date(item.deadline) : null;
                    const daysUntil = deadline
                      ? Math.ceil(
                          (deadline.getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : null;

                    return (
                      <Link
                        key={item.id}
                        href={`/projects/${item.projectId}`}
                        className="block"
                      >
                        <div className="p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <Clock
                              className={`h-4 w-4 mt-0.5 ${
                                daysUntil && daysUntil <= 3
                                  ? "text-red-500"
                                  : daysUntil && daysUntil <= 7
                                  ? "text-yellow-500"
                                  : "text-gray-400"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {item.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.project.name}
                              </p>
                              {deadline && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {format(deadline, "MMM d, yyyy")}
                                  {daysUntil !== null && (
                                    <span
                                      className={`ml-2 ${
                                        daysUntil <= 3
                                          ? "text-red-500 font-medium"
                                          : ""
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
                    <p className="text-sm text-gray-500 text-center pt-2">
                      +{upcomingDeadlines.length - 5} more deadlines
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-10 w-10 text-green-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No upcoming deadlines</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Portfolio Risk Section */}
      {projects && projects.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Portfolio Risk</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk stat cards */}
            <div className="grid grid-cols-3 gap-4 lg:col-span-2">
              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-red-600">At Risk</CardTitle>
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{atRiskCount}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {atRiskCount === 1 ? "project" : "projects"} with overdue items
                  </p>
                  {atRiskCount > 0 && (
                    <div className="mt-2 space-y-1">
                      {projects
                        .filter((p) => p.healthStatus === "red")
                        .slice(0, 2)
                        .map((p) => (
                          <Link key={p.id} href={`/projects/${p.id}`}>
                            <p className="text-xs text-red-600 hover:underline truncate">{p.name}</p>
                          </Link>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-yellow-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-yellow-600">Needs Attention</CardTitle>
                    <ShieldQuestion className="h-4 w-4 text-yellow-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{needsAttentionCount}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {needsAttentionCount === 1 ? "project" : "projects"} below 80%
                  </p>
                  {needsAttentionCount > 0 && (
                    <div className="mt-2 space-y-1">
                      {projects
                        .filter((p) => p.healthStatus === "yellow")
                        .slice(0, 2)
                        .map((p) => (
                          <Link key={p.id} href={`/projects/${p.id}`}>
                            <p className="text-xs text-yellow-600 hover:underline truncate">{p.name}</p>
                          </Link>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-green-600">On Track</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{onTrackCount}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {onTrackCount === 1 ? "project" : "projects"} on track
                  </p>
                  {onTrackCount > 0 && (
                    <div className="mt-2 space-y-1">
                      {projects
                        .filter((p) => p.healthStatus === "green")
                        .slice(0, 2)
                        .map((p) => (
                          <Link key={p.id} href={`/projects/${p.id}`}>
                            <p className="text-xs text-green-600 hover:underline truncate">{p.name}</p>
                          </Link>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Compliance Velocity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Compliance Velocity
                </CardTitle>
                <CardDescription className="text-xs">
                  Requirements completed week-over-week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  {velocityTrend === "improving" ? (
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  ) : velocityTrend === "declining" ? (
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  ) : (
                    <Minus className="h-8 w-8 text-gray-400" />
                  )}
                  <div>
                    <p className={`text-lg font-bold ${
                      velocityTrend === "improving" ? "text-green-600" :
                      velocityTrend === "declining" ? "text-red-600" :
                      "text-gray-600"
                    }`}>
                      {velocityTrend === "improving" ? "Improving" :
                       velocityTrend === "declining" ? "Declining" :
                       "Stable"}
                    </p>
                    <p className="text-xs text-gray-500">compliance pace</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">This week</span>
                    <span className="font-semibold">{thisWeekCompleted} items</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last week</span>
                    <span className="font-semibold">{lastWeekCompleted} items</span>
                  </div>
                  {velocityTrend !== "stable" && (
                    <p className="text-xs text-gray-400 pt-1">
                      {velocityTrend === "improving"
                        ? `+${thisWeekCompleted - lastWeekCompleted} more than last week`
                        : `${lastWeekCompleted - thisWeekCompleted} fewer than last week`}
                    </p>
                  )}
                </div>

                {allComplianceItems.length === 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Add compliance items to track velocity.
                  </p>
                )}
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
