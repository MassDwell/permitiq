"use client";

import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-900/50 text-yellow-400",
  processing: "bg-blue-900/50 text-blue-400",
  completed: "bg-green-900/50 text-green-400",
  failed: "bg-red-900/50 text-red-400",
};

export default function AdminDocumentsPage() {
  const { data: docs, isLoading } = trpc.admin.getDocuments.useQuery();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Documents</h1>
      <p className="text-slate-400 text-sm mb-6">Document processing monitor — failed docs sort to top</p>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Filename
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Project / Owner
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Error
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Processed
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
            {!isLoading && (docs ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">
                  No documents yet.
                </td>
              </tr>
            )}
            {(docs ?? []).map((doc) => (
              <tr
                key={doc.id}
                className={`hover:bg-white/[0.02] transition-colors ${
                  doc.processingStatus === "failed" ? "bg-red-950/10" : ""
                }`}
              >
                <td className="px-5 py-3">
                  <p className="text-white font-medium truncate max-w-[200px]">{doc.filename}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-slate-300 text-xs">{doc.projectName ?? "—"}</p>
                  <p className="text-xs text-slate-500">{doc.ownerEmail ?? "—"}</p>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[doc.processingStatus] ?? ""}`}
                  >
                    {doc.processingStatus}
                  </span>
                </td>
                <td className="px-5 py-3 max-w-[200px]">
                  {doc.processingError ? (
                    <span
                      className="text-xs text-red-400 truncate block cursor-default"
                      title={doc.processingError}
                    >
                      {doc.processingError.slice(0, 60)}
                      {doc.processingError.length > 60 ? "…" : ""}
                    </span>
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-slate-400">
                  {format(new Date(doc.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-5 py-3 text-xs text-slate-400">
                  {doc.processedAt ? format(new Date(doc.processedAt), "MMM d, yyyy") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 mt-3">
        {(docs ?? []).length} document{(docs ?? []).length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
