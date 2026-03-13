"use client";

import { trpc } from "@/lib/trpc/client";
import { DollarSign, Users, TrendingUp, BarChart2, PlusCircle, CreditCard } from "lucide-react";

const planStyles: Record<string, string> = {
  starter: "bg-slate-700/60 text-slate-300",
  professional: "bg-teal-900/50 text-teal-400",
  enterprise: "bg-purple-900/50 text-purple-400",
};

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function AdminRevenuePage() {
  const { data: stats } = trpc.admin.getStats.useQuery();
  const { data: distribution } = trpc.admin.getPlanDistribution.useQuery();
  const { data: metrics, isLoading } = trpc.admin.getStripeMetrics.useQuery();

  const cards = [
    { label: "MRR", value: metrics ? fmt(metrics.mrr) : "—", icon: DollarSign },
    { label: "ARR", value: metrics ? fmt(metrics.arr) : "—", icon: TrendingUp },
    { label: "Churn Rate", value: metrics ? `${metrics.churnRate.toFixed(1)}%` : "—", icon: BarChart2 },
    { label: "Active Subscribers", value: metrics ? String(metrics.activeSubscribers) : "—", icon: Users },
    { label: "New MRR This Month", value: metrics ? fmt(metrics.newMrrThisMonth) : "—", icon: PlusCircle },
    { label: "Total Collected YTD", value: metrics ? fmt(metrics.totalCollectedYTD) : "—", icon: CreditCard },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-1">
        <h1 className="text-2xl font-bold text-white">Revenue</h1>
        {!isLoading && metrics && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Live
          </span>
        )}
      </div>
      <p className="text-slate-400 text-sm mb-8">Billing overview and plan distribution</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-5"
            style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-400">{card.label}</p>
              <card.icon className="h-4 w-4 text-slate-600" />
            </div>
            <p className="text-3xl font-bold text-white">{isLoading ? <span className="text-slate-500">…</span> : card.value}</p>
          </div>
        ))}
      </div>

      {/* Plan distribution */}
      <h2 className="text-sm font-semibold text-white mb-4">Plan Distribution</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        {(distribution ?? []).map((row) => (
          <div
            key={row.plan}
            className="rounded-xl px-5 py-4 min-w-[140px]"
            style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mb-3 inline-block ${planStyles[row.plan] ?? ""}`}>
              {row.plan}
            </span>
            <p className="text-2xl font-bold text-white">{row.count}</p>
            <p className="text-xs text-slate-500 mt-0.5">users</p>
          </div>
        ))}
      </div>

      {/* Founding members */}
      <div
        className="rounded-xl px-5 py-4 max-w-xs"
        style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <p className="text-xs text-slate-400 mb-1">Founding Members</p>
        <p className="text-2xl font-bold text-yellow-400">{stats?.foundingMembers ?? "—"}</p>
        <p className="text-xs text-slate-500 mt-0.5">users on paid plans</p>
      </div>
    </div>
  );
}
