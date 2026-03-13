"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { format, formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const planStyles: Record<string, string> = {
  starter: "bg-slate-700/60 text-slate-300",
  professional: "bg-teal-900/50 text-teal-400",
  enterprise: "bg-purple-900/50 text-purple-400",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = trpc.admin.getUsers.useQuery();

  const filtered = (users ?? []).filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
      <p className="text-slate-400 text-sm mb-6">All registered accounts</p>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[#111827] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-teal-500/50"
        />
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                User
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Plan
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Signed Up
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Projects
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Docs
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Last Active
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">
                  No users found.
                </td>
              </tr>
            )}
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3">
                  <p className="text-white font-medium">{user.name ?? "—"}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planStyles[user.plan] ?? ""}`}>
                    {user.plan}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-300 text-xs">
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-5 py-3 text-right text-slate-300">{user.projectCount}</td>
                <td className="px-5 py-3 text-right text-slate-300">{user.docCount}</td>
                <td className="px-5 py-3 text-xs text-slate-400">
                  {user.lastActive
                    ? formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })
                    : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 mt-3">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
