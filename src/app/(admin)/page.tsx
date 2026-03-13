"use client";

import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";
import { Users, FolderOpen, FileText, AlertTriangle, Star, UserPlus } from "lucide-react";

const planStyles: Record<string, string> = {
  starter: "bg-slate-700/60 text-slate-300",
  professional: "bg-teal-900/50 text-teal-400",
  enterprise: "bg-purple-900/50 text-purple-400",
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-900/50 text-yellow-400",
  processing: "bg-blue-900/50 text-blue-400",
  completed: "bg-green-900/50 text-green-400",
  failed: "bg-red-900/50 text-red-400",
};

export default function AdminOverviewPage() {
  const { data: stats } = trpc.admin.getStats.useQuery();
  const { data: recentSignups } = trpc.admin.getRecentSignups.useQuery();
  const { data: recentDocs } = trpc.admin.getRecentDocuments.useQuery();

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? "—", icon: Users, color: "text-[#14B8A6]" },
    { label: "New This Week", value: stats?.newThisWeek ?? "—", icon: UserPlus, color: "text-blue-400" },
    { label: "Active Projects", value: stats?.activeProjects ?? "—", icon: FolderOpen, color: "text-[#14B8A6]" },
    { label: "Docs Processed", value: stats?.completedDocs ?? "—", icon: FileText, color: "text-green-400" },
    {
      label: "Failed Docs",
      value: stats?.failedDocs ?? "—",
      icon: AlertTriangle,
      color: (stats?.failedDocs ?? 0) > 0 ? "text-red-400" : "text-slate-500",
    },
    { label: "Founding Members", value: stats?.foundingMembers ?? "—", icon: Star, color: "text-yellow-400" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
      <p className="text-slate-400 text-sm mb-8">Platform summary</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-4"
            style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <card.icon className={`h-4 w-4 mb-3 ${card.color}`} />
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <div
          className="rounded-xl"
          style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 className="text-sm font-semibold text-white">Recent Signups</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {(recentSignups ?? []).map((user) => (
              <div key={user.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{user.name ?? "—"}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planStyles[user.plan] ?? ""}`}>
                    {user.plan}
                  </span>
                  <span className="text-xs text-slate-500">
                    {format(new Date(user.createdAt), "MMM d")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        <div
          className="rounded-xl"
          style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 className="text-sm font-semibold text-white">Recent Documents</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {(recentDocs ?? []).map((doc) => (
              <div key={doc.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{doc.filename}</p>
                  <p className="text-xs text-slate-400 truncate">{doc.projectName ?? "—"}</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[doc.processingStatus] ?? ""}`}
                  >
                    {doc.processingStatus}
                  </span>
                  <span className="text-xs text-slate-500">
                    {format(new Date(doc.createdAt), "MMM d")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
