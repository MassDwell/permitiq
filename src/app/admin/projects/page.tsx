"use client";

import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  active: "bg-green-900/50 text-green-400",
  completed: "bg-teal-900/50 text-teal-400",
  on_hold: "bg-yellow-900/50 text-yellow-400",
  archived: "bg-slate-700/60 text-slate-400",
};

export default function AdminProjectsPage() {
  const { data: projects, isLoading } = trpc.admin.getProjects.useQuery();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Projects</h1>
      <p className="text-slate-400 text-sm mb-6">All projects across all users</p>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Project
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Owner
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Jurisdiction
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Docs
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Compliance
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-500 text-sm">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && (projects ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-500 text-sm">
                  No projects yet.
                </td>
              </tr>
            )}
            {(projects ?? []).map((project) => (
              <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3">
                  <p className="text-white font-medium">{project.name}</p>
                  <p className="text-xs text-slate-500">{project.projectType}</p>
                </td>
                <td className="px-5 py-3 text-xs text-slate-400">{project.ownerEmail ?? "—"}</td>
                <td className="px-5 py-3 text-xs text-slate-300">{project.jurisdiction ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[project.status] ?? ""}`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-slate-300">{project.docCount}</td>
                <td className="px-5 py-3">
                  <span className="text-slate-300 text-xs">{project.complianceTotal}</span>
                  {project.compliancePending > 0 && (
                    <span className="ml-2 text-xs text-yellow-400">({project.compliancePending} pending)</span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-slate-400">
                  {format(new Date(project.createdAt), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 mt-3">
        {(projects ?? []).length} project{(projects ?? []).length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
