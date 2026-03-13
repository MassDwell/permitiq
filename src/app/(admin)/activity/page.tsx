"use client";

import { trpc } from "@/lib/trpc/client";
import { formatDistanceToNow } from "date-fns";
import { UserPlus, FileText, FolderOpen, TrendingUp } from "lucide-react";

const eventConfig = {
  signup: { icon: UserPlus, color: "text-teal-400", bg: "bg-teal-900/30" },
  document: { icon: FileText, color: "text-blue-400", bg: "bg-blue-900/30" },
  project: { icon: FolderOpen, color: "text-purple-400", bg: "bg-purple-900/30" },
  upgrade: { icon: TrendingUp, color: "text-yellow-400", bg: "bg-yellow-900/30" },
} as const;

export default function AdminActivityPage() {
  const { data: events, isLoading } = trpc.admin.getActivity.useQuery();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Activity Feed</h1>
      <p className="text-slate-400 text-sm mb-8">Last 100 platform events, newest first</p>

      {isLoading && <p className="text-slate-500 text-sm">Loading…</p>}

      <div className="space-y-1 max-w-2xl">
        {(events ?? []).map((event) => {
          const config = eventConfig[event.type];
          const Icon = config.icon;
          return (
            <div
              key={event.id}
              className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-white/[0.02] transition-colors"
            >
              <div className={`shrink-0 h-7 w-7 rounded-lg flex items-center justify-center mt-0.5 ${config.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200">{event.description}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-500 mt-0.5">
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
              </span>
            </div>
          );
        })}
        {!isLoading && (events ?? []).length === 0 && (
          <p className="text-slate-500 text-sm">No activity yet.</p>
        )}
      </div>
    </div>
  );
}
