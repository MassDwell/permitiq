"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";
import { getRelevantAHJs, type AHJData } from "@/lib/ahj-data";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function SharePage({ params }: PageProps) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <SharePageContent token={token} />;
}

function SharePageContent({ token }: { token: string }) {
  const { data, isLoading, error } = trpc.shares.getByToken.useQuery(
    { token },
    { retry: false }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center print:bg-white">
        <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    if (error.data?.code === "FORBIDDEN") {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center print:bg-white">
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-800 mb-2">Link Expired</p>
            <p className="text-gray-500">This compliance report link has expired.</p>
          </div>
        </div>
      );
    }
    notFound();
  }

  if (!data) notFound();

  const { share, project, generatedAt } = data;

  const totalItems = project.complianceItems.length;
  const metItems = project.complianceItems.filter((i) => i.status === "met").length;
  const inProgressItems = project.complianceItems.filter((i) => i.status === "in_progress").length;
  const pendingItems = project.complianceItems.filter((i) => i.status === "pending").length;
  const overdueItems = project.complianceItems.filter((i) => i.status === "overdue").length;
  const healthScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 100;

  // Group compliance items by status order: Done → In Progress → Pending → Past Due
  const groupedItems = {
    met: project.complianceItems.filter((i) => i.status === "met"),
    in_progress: project.complianceItems.filter((i) => i.status === "in_progress"),
    pending: project.complianceItems.filter((i) => i.status === "pending"),
    overdue: project.complianceItems.filter((i) => i.status === "overdue"),
  };

  // Get AHJ contacts based on jurisdiction
  const requirementTypes = project.complianceItems.map((i) => i.requirementType);
  const relevantAHJs = getRelevantAHJs(project.jurisdiction ?? "", requirementTypes);

  const scoreColor = healthScore >= 80 ? "#059669" : healthScore >= 50 ? "#D97706" : "#DC2626";
  const statusLabel = overdueItems > 0 ? "At Risk" : healthScore >= 80 ? "On Track" : "Needs Attention";

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-break-inside-avoid {
            break-inside: avoid;
          }
          .print-page-break {
            page-break-before: always;
          }
          @page {
            margin: 0.75in;
            size: letter;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 text-gray-900 print:bg-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        {/* Header */}
        <header className="border-b border-gray-200 bg-white print:border-gray-300">
          <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ background: "linear-gradient(135deg, #0D9488, #0284C7)" }}>
                M
              </div>
              <div>
                <span className="font-bold text-lg text-gray-900 tracking-tight">MeritLayer</span>
                <span className="text-gray-400 mx-2">|</span>
                <span className="text-gray-600 font-medium">Permit Compliance Report</span>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="no-print inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Project Info */}
          <div className="mb-8">
            {share.label && (
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-2">{share.label}</p>
            )}
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">{project.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {project.address && (
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {project.address}
                </span>
              )}
              {project.jurisdiction && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium text-xs">
                  {project.jurisdiction}
                </span>
              )}
              <span className="text-gray-500">
                Generated {format(new Date(generatedAt), "MMMM d, yyyy")}
              </span>
            </div>
          </div>

          {/* Compliance Summary Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 print:border-gray-300 print-break-inside-avoid">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">Compliance Readiness</h2>

            <div className="flex items-center gap-8 flex-wrap">
              {/* Score Circle */}
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${healthScore * 2.64} 264`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold" style={{ color: scoreColor }}>{healthScore}%</span>
                  <span className="text-xs text-gray-500">Score</span>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg print:bg-gray-100">
                  <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
                  <div className="text-xs text-gray-500 font-medium">Total Steps</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg print:bg-green-100">
                  <div className="text-2xl font-bold text-green-600">{metItems}</div>
                  <div className="text-xs text-green-600 font-medium">Done</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg print:bg-blue-100">
                  <div className="text-2xl font-bold text-blue-600">{inProgressItems}</div>
                  <div className="text-xs text-blue-600 font-medium">In Progress</div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg print:bg-amber-100">
                  <div className="text-2xl font-bold text-amber-600">{pendingItems}</div>
                  <div className="text-xs text-amber-600 font-medium">Pending</div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold"
                  style={{
                    color: overdueItems > 0 ? "#DC2626" : healthScore >= 80 ? "#059669" : "#D97706",
                    backgroundColor: overdueItems > 0 ? "#FEE2E2" : healthScore >= 80 ? "#D1FAE5" : "#FEF3C7",
                  }}
                >
                  {statusLabel}
                </span>
                {overdueItems > 0 && (
                  <div className="text-center mt-1 text-xs text-red-600 font-medium">
                    {overdueItems} past due
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Permit Workflows */}
          {project.permitWorkflows.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 print:border-gray-300 print-break-inside-avoid">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Permit Workflow</h2>
              <div className="space-y-2">
                {project.permitWorkflows.map((pw) => {
                  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
                    approved: { color: "#059669", bg: "#D1FAE5", label: "Approved" },
                    submitted: { color: "#0284C7", bg: "#DBEAFE", label: "Submitted" },
                    under_review: { color: "#7C3AED", bg: "#EDE9FE", label: "Under Review" },
                    in_progress: { color: "#D97706", bg: "#FEF3C7", label: "In Progress" },
                    rejected: { color: "#DC2626", bg: "#FEE2E2", label: "Rejected" },
                    on_hold: { color: "#D97706", bg: "#FEF3C7", label: "On Hold" },
                    not_started: { color: "#6B7280", bg: "#F3F4F6", label: "Not Started" },
                  };
                  const cfg = statusConfig[pw.status] ?? statusConfig.not_started;
                  return (
                    <div key={pw.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg print:bg-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">{pw.permitName}</div>
                        {pw.jurisdiction && (
                          <div className="text-xs text-gray-500">{pw.jurisdiction}</div>
                        )}
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ color: cfg.color, backgroundColor: cfg.bg }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Requirements List - Grouped by Status */}
          {totalItems > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 print:border-gray-300">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Requirements Checklist</h2>

              {/* Done Items */}
              {groupedItems.met.length > 0 && (
                <div className="mb-5 print-break-inside-avoid">
                  <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Done ({groupedItems.met.length})
                  </h3>
                  <div className="space-y-1.5">
                    {groupedItems.met.map((item) => (
                      <RequirementCard key={item.id} item={item} status="met" />
                    ))}
                  </div>
                </div>
              )}

              {/* In Progress Items */}
              {groupedItems.in_progress.length > 0 && (
                <div className="mb-5 print-break-inside-avoid">
                  <h3 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    In Progress ({groupedItems.in_progress.length})
                  </h3>
                  <div className="space-y-1.5">
                    {groupedItems.in_progress.map((item) => (
                      <RequirementCard key={item.id} item={item} status="in_progress" />
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Items */}
              {groupedItems.pending.length > 0 && (
                <div className="mb-5 print-break-inside-avoid">
                  <h3 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pending ({groupedItems.pending.length})
                  </h3>
                  <div className="space-y-1.5">
                    {groupedItems.pending.map((item) => (
                      <RequirementCard key={item.id} item={item} status="pending" />
                    ))}
                  </div>
                </div>
              )}

              {/* Overdue Items */}
              {groupedItems.overdue.length > 0 && (
                <div className="mb-5 print-break-inside-avoid">
                  <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Past Due ({groupedItems.overdue.length})
                  </h3>
                  <div className="space-y-1.5">
                    {groupedItems.overdue.map((item) => (
                      <RequirementCard key={item.id} item={item} status="overdue" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AHJ Contacts */}
          {relevantAHJs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 print:border-gray-300 print-break-inside-avoid">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Jurisdiction Contacts</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relevantAHJs.map((ahj, idx) => (
                  <AHJCard key={idx} ahj={ahj} />
                ))}
              </div>
            </div>
          )}

          {/* Document Log */}
          {project.documents.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 print:border-gray-300 print-break-inside-avoid">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Document Log</h2>
              <div className="space-y-2">
                {project.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg print:bg-gray-100">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.filename}</div>
                        {doc.docType && (
                          <div className="text-xs text-gray-500 capitalize">{doc.docType.replace(/_/g, " ")}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(doc.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white mt-8 print:border-gray-300">
          <div className="max-w-4xl mx-auto px-6 py-6 text-center">
            <p className="text-sm text-gray-500 mb-4">
              This report was generated on {format(new Date(generatedAt), "MMMM d, yyyy 'at' h:mm a")} and reflects the project state at that time.
              <br />
              For the latest status, visit <strong className="text-teal-600">meritlayer.ai</strong>
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
              <span>Powered by</span>
              <div className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-xs" style={{ background: "linear-gradient(135deg, #0D9488, #0284C7)" }}>
                M
              </div>
              <span className="font-semibold text-gray-600">MeritLayer</span>
            </div>
            <a
              href="https://meritlayer.ai"
              className="no-print inline-block mt-4 px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #0D9488, #0284C7)" }}
            >
              Get started for free →
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}

interface RequirementCardProps {
  item: {
    id: string;
    description: string;
    requirementType: string;
    deadline: Date | null;
    status: string;
  };
  status: "met" | "in_progress" | "pending" | "overdue";
}

function RequirementCard({ item, status }: RequirementCardProps) {
  const statusStyles = {
    met: { bg: "bg-green-50 print:bg-green-100", text: "text-gray-500 line-through", badge: "bg-green-100 text-green-700" },
    in_progress: { bg: "bg-blue-50 print:bg-blue-100", text: "text-gray-900", badge: "bg-blue-100 text-blue-700" },
    pending: { bg: "bg-amber-50 print:bg-amber-100", text: "text-gray-900", badge: "bg-amber-100 text-amber-700" },
    overdue: { bg: "bg-red-50 print:bg-red-100", text: "text-gray-900", badge: "bg-red-100 text-red-700" },
  };
  const styles = statusStyles[status];

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${styles.bg}`}>
      <div className="flex-shrink-0 mt-0.5">
        {status === "met" && (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        {status === "in_progress" && (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {status === "pending" && (
          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {status === "overdue" && (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${styles.text}`}>{item.description}</div>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span className="capitalize">{item.requirementType.replace(/_/g, " ")}</span>
          {item.deadline && (
            <>
              <span>•</span>
              <span className={status === "overdue" ? "text-red-600 font-medium" : ""}>
                Due {format(new Date(item.deadline), "MMM d, yyyy")}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AHJCard({ ahj }: { ahj: AHJData }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg print:bg-gray-100">
      <h3 className="font-semibold text-gray-900 text-sm mb-2">{ahj.name}</h3>
      <div className="space-y-1.5 text-xs text-gray-600">
        {ahj.address && (
          <div className="flex items-start gap-2">
            <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{ahj.address}</span>
          </div>
        )}
        {ahj.phone && (
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{ahj.phone}</span>
          </div>
        )}
        {ahj.email && (
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{ahj.email}</span>
          </div>
        )}
        {ahj.hours && (
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{ahj.hours}</span>
          </div>
        )}
        {ahj.portal && (
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <a href={ahj.portal} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline no-print">
              Online Portal
            </a>
            <span className="hidden print:inline text-gray-500">{ahj.portal}</span>
          </div>
        )}
      </div>
    </div>
  );
}
