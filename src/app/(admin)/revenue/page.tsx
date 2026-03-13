"use client";

import { trpc } from "@/lib/trpc/client";
import { DollarSign, Users, TrendingUp } from "lucide-react";

const planStyles: Record<string, string> = {
  starter: "bg-slate-700/60 text-slate-300",
  professional: "bg-teal-900/50 text-teal-400",
  enterprise: "bg-purple-900/50 text-purple-400",
};

export default function AdminRevenuePage() {
  const { data: stats } = trpc.admin.getStats.useQuery();
  const { data: distribution } = trpc.admin.getPlanDistribution.useQuery();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Revenue</h1>
      <p className="text-slate-400 text-sm mb-8">Billing overview and plan distribution</p>

      {/* Stripe placeholder MRR cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { label: "MRR", icon: DollarSign },
          { label: "ARR", icon: TrendingUp },
          { label: "Churn Rate", icon: Users },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-5"
            style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-400">{card.label}</p>
              <card.icon className="h-4 w-4 text-slate-600" />
            </div>
            <p className="text-3xl font-bold text-slate-500">—</p>
            <button className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition-colors">
              Connect Stripe →
            </button>
          </div>
        ))}
      </div>

      {/* Stripe note */}
      <div
        className="rounded-xl p-5 mb-8 max-w-lg"
        style={{ background: "rgba(20,184,166,0.05)", border: "1px solid rgba(20,184,166,0.15)" }}
      >
        <p className="text-sm text-teal-300 font-medium mb-1">Stripe webhook integration coming soon</p>
        <p className="text-xs text-slate-400">
          Connect your Stripe account to see live MRR, ARR, and churn metrics automatically synced from subscription events.
        </p>
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
