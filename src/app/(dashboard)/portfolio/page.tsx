"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  BarChart2,
  Clock,
  AlertTriangle,
  CheckCircle,
  FolderOpen,
  ArrowRight,
} from "lucide-react";

function complianceColor(score: number) {
  if (score >= 80) return "#10B981";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

function StatusBadge({ status }: { status: "critical" | "attention" | "on-track" }) {
  if (status === "critical") {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.25)" }}
      >
        Critical
      </span>
    );
  }
  if (status === "attention") {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" }}
      >
        Needs Attention
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.25)" }}
    >
      On Track
    </span>
  );
}

function RiskDot({ status }: { status: "critical" | "attention" | "on-track" }) {
  const color =
    status === "critical" ? "#EF4444" : status === "attention" ? "#F59E0B" : "#10B981";
  return (
    <span
      className="inline-block w-2 h-2 rounded-full shrink-0"
      style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}99` }}
    />
  );
}

export default function PortfolioPage() {
  const { data, isLoading } = trpc.projects.getPortfolioStats.useQuery();

  const scoreColor = data ? complianceColor(data.avgComplianceScore) : "#F1F5F9";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#F1F5F9]">Portfolio Intelligence</h1>
        <p className="text-[#64748B] mt-1">Aggregate view across all your projects</p>
      </div>

      {/* A. Portfolio Health Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Projects */}
        <div
          className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
          style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#64748B]">Total Projects</p>
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(20,184,166,0.12)", boxShadow: "0 0 12px rgba(20,184,166,0.1)" }}
            >
              <FolderOpen className="h-4 w-4 text-[#14B8A6]" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <p className="text-4xl font-bold text-[#F1F5F9] tracking-tight">{data?.totalProjects ?? 0}</p>
          )}
        </div>

        {/* Avg Compliance Score */}
        <div
          className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
          style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#64748B]">Avg Compliance</p>
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(20,184,166,0.12)", boxShadow: "0 0 12px rgba(20,184,166,0.1)" }}
            >
              <CheckCircle className="h-4 w-4 text-[#14B8A6]" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <p className="text-4xl font-bold tracking-tight" style={{ color: scoreColor }}>
              {data?.avgComplianceScore ?? 0}%
            </p>
          )}
        </div>

        {/* Active Deadlines next 30 days */}
        <div
          className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
          style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#64748B]">Deadlines (30d)</p>
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(245,158,11,0.12)", boxShadow: "0 0 12px rgba(245,158,11,0.1)" }}
            >
              <Clock className="h-4 w-4 text-[#F59E0B]" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <p
              className="text-4xl font-bold tracking-tight"
              style={{ color: (data?.deadlinesNext30Days ?? 0) > 0 ? "#F59E0B" : "#F1F5F9" }}
            >
              {data?.deadlinesNext30Days ?? 0}
            </p>
          )}
        </div>

        {/* Projects needing attention */}
        <div
          className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
          style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#64748B]">Need Attention</p>
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.12)", boxShadow: "0 0 12px rgba(239,68,68,0.1)" }}
            >
              <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <p
              className="text-4xl font-bold tracking-tight"
              style={{ color: (data?.projectsNeedingAttention ?? 0) > 0 ? "#EF4444" : "#F1F5F9" }}
            >
              {data?.projectsNeedingAttention ?? 0}
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : !data || data.totalProjects === 0 ? (
        /* Empty state */
        <div
          className="rounded-xl flex flex-col items-center justify-center py-24 text-center"
          style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <BarChart2 className="h-16 w-16 mb-4" style={{ color: "rgba(100,116,139,0.4)" }} />
          <h3 className="text-xl font-semibold text-[#F1F5F9] mb-2">No projects yet</h3>
          <p className="text-[#475569]">Add your first project to see portfolio insights</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* B. Project Grid */}
          <div>
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">All Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.projects.map((project) => {
                const color = complianceColor(project.complianceScore);
                const deadlineUrgent =
                  project.daysToDeadline !== null && project.daysToDeadline < 14;
                return (
                  <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                    <div
                      className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px] hover:border-white/20"
                      style={{
                        background: "#0D1526",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="text-sm font-semibold text-[#F1F5F9] truncate">{project.name}</p>
                          <p className="text-xs text-[#475569] truncate mt-0.5">{project.address ?? "No address"}</p>
                        </div>
                        <StatusBadge status={project.status} />
                      </div>

                      {/* Compliance bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-[#64748B]">Compliance Readiness</p>
                          <p className="text-xs font-semibold" style={{ color }}>{project.complianceScore}%</p>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${project.complianceScore}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#64748B]">
                        <span>
                          {project.openItems} open item{project.openItems !== 1 ? "s" : ""}
                        </span>
                        {project.nextDeadline ? (
                          <span style={{ color: deadlineUrgent ? "#EF4444" : "#64748B" }}>
                            {project.daysToDeadline !== null && project.daysToDeadline >= 0
                              ? `${project.daysToDeadline}d remaining`
                              : `${Math.abs(project.daysToDeadline!)}d overdue`}
                          </span>
                        ) : (
                          <span>No deadline</span>
                        )}
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* C. Risk Flagging Panel */}
          {data.projects.some((p) => p.status !== "on-track") && (
            <div>
              <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Risk Flags</h2>
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {data.projects
                    .filter((p) => p.status !== "on-track")
                    .sort((a, b) => {
                      const rank = (s: string) => (s === "critical" ? 0 : 1);
                      return rank(a.status) - rank(b.status);
                    })
                    .map((project) => {
                      const issues: string[] = [];
                      if (project.complianceScore < 30) issues.push(`${project.complianceScore}% compliance`);
                      if (project.daysToDeadline !== null && project.daysToDeadline < 7)
                        issues.push(`Deadline in ${project.daysToDeadline}d`);
                      if (project.complianceScore < 60 && project.complianceScore >= 30)
                        issues.push(`${project.complianceScore}% compliance`);
                      if (
                        project.daysToDeadline !== null &&
                        project.daysToDeadline >= 7 &&
                        project.daysToDeadline < 30
                      )
                        issues.push(`Deadline in ${project.daysToDeadline}d`);

                      return (
                        <div
                          key={project.id}
                          className="flex items-center gap-4 px-5 py-4"
                        >
                          <RiskDot status={project.status} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#F1F5F9] truncate">{project.name}</p>
                            <p className="text-xs text-[#475569] truncate">{issues.join(" · ")}</p>
                          </div>
                          {project.daysToDeadline !== null && (
                            <span
                              className="text-xs font-medium shrink-0"
                              style={{
                                color:
                                  project.daysToDeadline < 7 ? "#EF4444" : "#F59E0B",
                              }}
                            >
                              {project.daysToDeadline >= 0
                                ? `${project.daysToDeadline}d`
                                : `${Math.abs(project.daysToDeadline)}d overdue`}
                            </span>
                          )}
                          <Link
                            href={`/projects/${project.id}`}
                            className="text-xs font-medium text-[#14B8A6] hover:text-[#14B8A6]/80 shrink-0 transition-colors"
                          >
                            View Project →
                          </Link>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* D. Deadline Timeline */}
          {data.upcomingDeadlines.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">
                Upcoming Deadlines
                <span className="ml-2 text-sm font-normal text-[#475569]">next 60 days</span>
              </h2>
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="px-5 py-3 grid grid-cols-4 gap-4 text-xs font-semibold uppercase tracking-wider text-[#475569]"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span>Date</span>
                  <span>Project</span>
                  <span className="col-span-1">Requirement</span>
                  <span className="text-right">Days Left</span>
                </div>
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {data.upcomingDeadlines.map((dl, i) => {
                    const urgency =
                      dl.daysRemaining !== null && dl.daysRemaining < 7
                        ? "#EF4444"
                        : dl.daysRemaining !== null && dl.daysRemaining < 30
                        ? "#F59E0B"
                        : "#10B981";
                    return (
                      <div key={i} className="px-5 py-3.5 grid grid-cols-4 gap-4 items-center hover:bg-white/[0.02] transition-colors">
                        <span className="text-sm text-[#94A3B8]">
                          {dl.dueDate ? format(new Date(dl.dueDate), "MMM d, yyyy") : "—"}
                        </span>
                        <Link
                          href={`/projects/${dl.projectId}`}
                          className="text-sm font-medium text-[#14B8A6] hover:underline truncate"
                        >
                          {dl.projectName}
                        </Link>
                        <span className="text-sm text-[#64748B] truncate">{dl.requirement}</span>
                        <span
                          className="text-sm font-semibold text-right"
                          style={{ color: urgency }}
                        >
                          {dl.daysRemaining !== null ? `${dl.daysRemaining}d` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
