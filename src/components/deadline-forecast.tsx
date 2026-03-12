"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Clock, Zap } from "lucide-react";

interface ComplianceItem {
  id: string;
  status: string;
  deadline?: Date | string | null;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

interface DeadlineForecastProps {
  complianceItems: ComplianceItem[];
  projectCreatedAt: Date | string;
}

function getRiskLevel(
  completionPct: number,
  daysRemaining: number | null,
  hasOverdue: boolean
): "low" | "medium" | "high" {
  if (hasOverdue) return "high";
  if (daysRemaining === null) {
    return completionPct >= 80 ? "low" : completionPct >= 40 ? "medium" : "high";
  }
  if (completionPct < 30 && daysRemaining < 14) return "high";
  if (completionPct < 50 && daysRemaining < 30) return "medium";
  if (completionPct >= 80 || daysRemaining > 30) return "low";
  return "medium";
}

export function DeadlineForecast({ complianceItems, projectCreatedAt }: DeadlineForecastProps) {
  const now = new Date();
  const total = complianceItems.length;
  const met = complianceItems.filter((i) => i.status === "met").length;
  const overdue = complianceItems.filter((i) => i.status === "overdue").length;
  const remaining = total - met;
  const completionPct = total > 0 ? Math.round((met / total) * 100) : 0;

  // Find soonest upcoming deadline
  const upcomingDeadlines = complianceItems
    .filter((i) => i.deadline && i.status !== "met")
    .map((i) => new Date(i.deadline!))
    .filter((d) => d > now)
    .sort((a, b) => a.getTime() - b.getTime());

  const nextDeadline = upcomingDeadlines[0] ?? null;
  const daysRemaining = nextDeadline
    ? Math.ceil((nextDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Calculate velocity: items completed per week
  const projectAgeWeeks = Math.max(
    1,
    (now.getTime() - new Date(projectCreatedAt).getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  const velocityPerWeek = met / projectAgeWeeks;

  // Projected completion
  const weeksToComplete =
    velocityPerWeek > 0 ? Math.ceil(remaining / velocityPerWeek) : null;
  const projectedCompleteDate =
    weeksToComplete !== null
      ? new Date(now.getTime() + weeksToComplete * 7 * 24 * 60 * 60 * 1000)
      : null;

  // Projected % at deadline
  let projectedPctAtDeadline: number | null = null;
  if (daysRemaining !== null && velocityPerWeek > 0) {
    const weeksRemaining = daysRemaining / 7;
    const additionalItems = velocityPerWeek * weeksRemaining;
    projectedPctAtDeadline = Math.min(
      100,
      Math.round(((met + additionalItems) / total) * 100)
    );
  }

  const risk = getRiskLevel(completionPct, daysRemaining, overdue > 0);

  const riskConfig = {
    low: {
      color: "#10B981",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.3)",
      label: "Low Risk",
      icon: "🟢",
    },
    medium: {
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.3)",
      label: "Medium Risk",
      icon: "🟡",
    },
    high: {
      color: "#EF4444",
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.3)",
      label: "High Risk",
      icon: "🔴",
    },
  }[risk];

  const recommendations: string[] = [];
  if (overdue > 0) {
    recommendations.push(`Address ${overdue} overdue item${overdue > 1 ? "s" : ""} immediately.`);
  }
  if (risk === "high" && daysRemaining !== null) {
    recommendations.push("Consider dedicating focused time to compliance items this week.");
  }
  if (velocityPerWeek < 0.5 && remaining > 5) {
    recommendations.push("Your current pace is slow — try completing 1–2 items per day to catch up.");
  }
  if (projectedPctAtDeadline !== null && projectedPctAtDeadline < 90) {
    recommendations.push(`At current pace, you'll reach ~${projectedPctAtDeadline}% by the deadline. Accelerate to close the gap.`);
  }
  if (recommendations.length === 0) {
    recommendations.push("You're on track. Keep up the current pace.");
  }

  if (total === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-[#14B8A6]" />
          Deadline Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Risk badge */}
          <div
            className="flex-shrink-0 rounded-xl p-4 flex flex-col items-center justify-center min-w-[120px]"
            style={{ background: riskConfig.bg, border: `1px solid ${riskConfig.border}` }}
          >
            <span className="text-2xl mb-1">{riskConfig.icon}</span>
            <span className="text-xs font-semibold" style={{ color: riskConfig.color }}>
              {riskConfig.label}
            </span>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs text-[#64748B] mb-1">Completion</p>
              <p className="text-xl font-bold text-foreground">{completionPct}%</p>
              <p className="text-xs text-[#64748B]">{met}/{total} items</p>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs text-[#64748B] mb-1">Next Deadline</p>
              {daysRemaining !== null ? (
                <>
                  <p className="text-xl font-bold text-foreground">{daysRemaining}d</p>
                  <p className="text-xs text-[#64748B]">remaining</p>
                </>
              ) : (
                <p className="text-sm text-[#64748B] mt-1">No deadline set</p>
              )}
            </div>
            <div className="rounded-lg p-3 col-span-2 sm:col-span-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs text-[#64748B] mb-1">Velocity</p>
              <p className="text-xl font-bold text-foreground">{velocityPerWeek.toFixed(1)}</p>
              <p className="text-xs text-[#64748B]">items/week</p>
            </div>
          </div>
        </div>

        {/* Insight text */}
        {remaining > 0 && (
          <div className="mt-4 rounded-lg p-3 flex items-start gap-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Clock className="h-4 w-4 text-[#64748B] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {remaining} item{remaining !== 1 ? "s" : ""} remaining.
              {velocityPerWeek > 0.1 ? (
                <>
                  {" "}At your pace of {velocityPerWeek.toFixed(1)} items/week
                  {weeksToComplete !== null && weeksToComplete < 52 ? (
                    <>, estimated completion in <strong className="text-foreground">{weeksToComplete} week{weeksToComplete !== 1 ? "s" : ""}</strong>
                    {projectedCompleteDate ? ` (${projectedCompleteDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })})` : ""}</>
                  ) : "."}
                  {daysRemaining !== null && projectedPctAtDeadline !== null && projectedPctAtDeadline < 100 ? (
                    <> You may reach <strong className="text-foreground">{projectedPctAtDeadline}%</strong> by the deadline.</>
                  ) : null}
                </>
              ) : (
                " No items completed yet — start marking requirements as met to track velocity."
              )}
            </p>
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            Recommended Actions
          </p>
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-xs text-[#14B8A6] mt-0.5 flex-shrink-0">→</span>
              <p className="text-sm text-muted-foreground">{rec}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
