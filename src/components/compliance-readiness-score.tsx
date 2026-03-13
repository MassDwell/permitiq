"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Clock, AlertTriangle, ArrowRight } from "lucide-react";

interface ComplianceReadinessScoreProps {
  healthScore: number;
  metItems: number;
  totalItems: number;
  overdueItems: number;
  pendingItems: number;
  documentCount: number;
  upcomingDeadlinesCount?: number;
}

function getScoreColor(score: number): string {
  if (score >= 67) return "#22c55e"; // green-500
  if (score >= 34) return "#eab308"; // yellow-500
  return "#ef4444"; // red-500
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Ready";
  if (score >= 60) return "Getting There";
  if (score >= 34) return "Needs Work";
  return "At Risk";
}

function getScoreBadge(score: number) {
  if (score >= 67) return <Badge className="bg-green-100 text-green-800">Ready to Submit</Badge>;
  if (score >= 34) return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
  return <Badge className="bg-red-100 text-red-800">Action Required</Badge>;
}

// SVG circular progress ring
function CircularProgress({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        {/* Background track */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="10"
        />
        {/* Progress arc */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}%</span>
        <span className="text-xs text-gray-500 font-medium">{getScoreLabel(score)}</span>
      </div>
    </div>
  );
}

export function ComplianceReadinessScore({
  healthScore,
  metItems,
  totalItems,
  overdueItems,
  pendingItems,
  documentCount,
  upcomingDeadlinesCount = 0,
}: ComplianceReadinessScoreProps) {
  // Sub-score: compliance items
  const complianceScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 100;

  // Sub-score: documents (rough heuristic — 5+ docs = 100%, scale linearly below)
  const docScore = Math.min(100, Math.round((documentCount / 5) * 100));

  // Sub-score: deadlines on track (no overdue = 100%, each overdue item costs points)
  const deadlineScore = totalItems > 0
    ? Math.max(0, Math.round(((totalItems - overdueItems) / totalItems) * 100))
    : 100;

  // Overall weighted score: 50% compliance, 30% deadlines, 20% docs
  const overallScore = Math.round(complianceScore * 0.5 + deadlineScore * 0.3 + docScore * 0.2);

  // Build actionable next steps
  const nextSteps: string[] = [];
  if (overdueItems > 0) nextSteps.push(`Resolve ${overdueItems} past due step${overdueItems > 1 ? "s" : ""}`);
  if (pendingItems > 0 && pendingItems < 5) nextSteps.push(`Complete ${pendingItems} remaining step${pendingItems > 1 ? "s" : ""}`);
  if (documentCount === 0) nextSteps.push("Upload at least one project document");
  if (documentCount < 3) nextSteps.push("Upload more supporting documents");
  if (upcomingDeadlinesCount > 0) nextSteps.push(`${upcomingDeadlinesCount} deadline${upcomingDeadlinesCount > 1 ? "s" : ""} coming up — stay on track`);
  if (nextSteps.length === 0) nextSteps.push("Great work! Project is fully on track.");

  const breakdowns = [
    {
      label: "Permit Steps",
      score: complianceScore,
      icon: CheckCircle,
      detail: `${metItems} of ${totalItems} done`,
      color: complianceScore >= 67 ? "text-green-600" : complianceScore >= 34 ? "text-yellow-600" : "text-red-600",
    },
    {
      label: "Documents",
      score: docScore,
      icon: FileText,
      detail: `${documentCount} uploaded`,
      color: docScore >= 67 ? "text-green-600" : docScore >= 34 ? "text-yellow-600" : "text-red-600",
    },
    {
      label: "Deadlines",
      score: deadlineScore,
      icon: Clock,
      detail: overdueItems > 0 ? `${overdueItems} past due` : "All on track",
      color: deadlineScore >= 80 ? "text-green-600" : deadlineScore >= 50 ? "text-yellow-600" : "text-red-600",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-500">Permit Readiness</CardTitle>
          {getScoreBadge(overallScore)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Circular progress */}
          <div className="flex-shrink-0">
            <CircularProgress score={overallScore} />
          </div>

          {/* Right side: breakdown + next steps */}
          <div className="flex-1 w-full space-y-4">
            {/* Score breakdown */}
            <div className="space-y-2">
              {breakdowns.map((b) => (
                <div key={b.label} className="flex items-center gap-3">
                  <b.icon className={`h-4 w-4 flex-shrink-0 ${b.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-gray-600">{b.label}</span>
                      <span className={`text-xs font-semibold ${b.color}`}>{b.score}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${b.score}%`,
                          backgroundColor: getScoreColor(b.score),
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{b.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Next steps */}
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Next Steps</p>
              <ul className="space-y-1">
                {nextSteps.slice(0, 3).map((step, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                    {overdueItems > 0 && i === 0 ? (
                      <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ArrowRight className="h-3 w-3 text-blue-400 flex-shrink-0 mt-0.5" />
                    )}
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
