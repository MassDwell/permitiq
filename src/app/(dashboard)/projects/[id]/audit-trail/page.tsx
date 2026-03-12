"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function statusSymbol(status: string) {
  switch (status) {
    case "met": return "✅";
    case "overdue": return "❌";
    case "not_applicable": return "—";
    default: return "⏳";
  }
}

function permitStatusSymbol(status: string) {
  switch (status) {
    case "approved": return "✅";
    case "rejected": return "❌";
    case "submitted": return "⏳";
    case "in_review": return "⏳";
    default: return "—";
  }
}

export default function AuditTrailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading: projectLoading } = trpc.projects.get.useQuery({ id: projectId });
  const { data: permits, isLoading: permitsLoading } = trpc.permitWorkflows.getByProject.useQuery({ projectId });
  const { data: inspections, isLoading: inspectionsLoading } = trpc.inspections.list.useQuery({ projectId });

  const isLoading = projectLoading || permitsLoading || inspectionsLoading;

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Link href="/dashboard"><Button className="mt-4">Back to Dashboard</Button></Link>
      </div>
    );
  }

  const exportDate = format(new Date(), "MMMM d, yyyy");
  const metItems = project.complianceItems.filter((i) => i.status === "met").length;
  const completionPct = project.totalItems > 0 ? Math.round((metItems / project.totalItems) * 100) : 0;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-page { page-break-after: always; }
          .print-card { border: 1px solid #e5e7eb !important; background: white !important; }
          .print-text { color: #111827 !important; }
          .print-muted { color: #6b7280 !important; }
          .print-header { background: #f9fafb !important; }
        }
      `}</style>

      {/* Controls — hidden when printing */}
      <div className="no-print sticky top-0 z-10 flex items-center gap-3 px-8 py-4"
        style={{ background: '#060B17', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href={`/projects/${projectId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
        </Link>
        <Button
          size="sm"
          onClick={() => window.print()}
          style={{ background: '#14B8A6', color: 'white' }}
        >
          <Printer className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <span className="text-xs text-muted-foreground ml-1">
          Tip: In the print dialog, choose "Save as PDF" to download.
        </span>
      </div>

      {/* AUDIT TRAIL DOCUMENT */}
      <div className="max-w-4xl mx-auto p-8 space-y-8">

        {/* COVER PAGE */}
        <div className="print-page print-card rounded-2xl p-10 space-y-8"
          style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="border-b pb-8" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-2xl font-bold tracking-tight" style={{ color: '#14B8A6' }}>MeritLayer</p>
            <p className="text-sm text-muted-foreground mt-1">Permit &amp; Compliance Intelligence</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Compliance Audit Trail
            </p>
            <h1 className="text-4xl font-bold text-foreground mb-2">{project.name}</h1>
            {project.address && (
              <p className="text-lg text-muted-foreground">{project.address}</p>
            )}
            {project.jurisdiction && (
              <p className="text-sm text-muted-foreground mt-1">{project.jurisdiction}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Export Date</p>
              <p className="text-foreground font-medium">{exportDate}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Project Type</p>
              <p className="text-foreground font-medium capitalize">{project.projectType.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Project Status</p>
              <p className="text-foreground font-medium capitalize">{project.status.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Created</p>
              <p className="text-foreground font-medium">{format(new Date(project.createdAt), "MMM d, yyyy")}</p>
            </div>
          </div>
          <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.3)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#14B8A6' }}>
              Prepared for Lenders / Investors / Attorneys
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This document reflects the project compliance status as of {exportDate}.
            </p>
          </div>
        </div>

        {/* PROJECT SUMMARY */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'rgba(20,184,166,0.2)', color: '#14B8A6' }}>1</span>
            Project Summary
          </h2>
          <div className="print-card rounded-xl overflow-hidden" style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.1)' }}>
            <table className="w-full">
              <tbody>
                {[
                  ["Created", format(new Date(project.createdAt), "MMMM d, yyyy")],
                  ["Total Compliance Items", String(project.totalItems)],
                  ["Completion", `${completionPct}% (${metItems} of ${project.totalItems} met)`],
                  ["Open Items", String(project.pendingItems)],
                  ["Overdue Items", String(project.overdueItems)],
                  ["Documents Uploaded", String(project.documents.length)],
                  ["Permits Tracked", String(permits?.length ?? 0)],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <td className="px-5 py-3 text-sm font-medium text-muted-foreground w-48">{label}</td>
                    <td className="px-5 py-3 text-sm text-foreground font-medium">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* COMPLIANCE CHECKLIST */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'rgba(20,184,166,0.2)', color: '#14B8A6' }}>2</span>
            Compliance Checklist
          </h2>
          {project.complianceItems.length === 0 ? (
            <p className="text-muted-foreground text-sm">No compliance items recorded.</p>
          ) : (
            <div className="print-card rounded-xl overflow-hidden" style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.1)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3">Requirement</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3 w-24">Status</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3 w-36">Due Date</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {project.complianceItems.map((item) => (
                    <tr key={item.id} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <td className="px-5 py-3 text-sm text-foreground">{item.description}</td>
                      <td className="px-5 py-3 text-sm">
                        <span>{statusSymbol(item.status)}</span>
                        <span className="ml-1 text-muted-foreground capitalize text-xs">{item.status.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {item.deadline ? format(new Date(item.deadline), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{item.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* PERMIT WORKFLOW */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'rgba(20,184,166,0.2)', color: '#14B8A6' }}>3</span>
            Permit Workflow
          </h2>
          {!permits || permits.length === 0 ? (
            <p className="text-muted-foreground text-sm">No permits tracked for this project.</p>
          ) : (
            <div className="print-card rounded-xl overflow-hidden" style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.1)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3">Permit</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3 w-28">Status</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3 w-36">Submitted</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3 w-36">Approved</th>
                  </tr>
                </thead>
                <tbody>
                  {permits.map((permit: {
                    id: string;
                    permitName?: string | null;
                    permitNumber?: string | null;
                    category?: string | null;
                    status: string;
                    submittedDate?: string | null;
                    approvedDate?: string | null;
                  }) => (
                    <tr key={permit.id} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <td className="px-5 py-3 text-sm text-foreground">
                        {permit.permitName ?? permit.category ?? "Permit"}
                        {permit.permitNumber && (
                          <span className="ml-2 text-xs text-muted-foreground">#{permit.permitNumber}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm">
                        <span>{permitStatusSymbol(permit.status)}</span>
                        <span className="ml-1 text-muted-foreground capitalize text-xs">{permit.status.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {permit.submittedDate ? format(new Date(permit.submittedDate), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {permit.approvedDate ? format(new Date(permit.approvedDate), "MMM d, yyyy") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* DOCUMENT LOG */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'rgba(20,184,166,0.2)', color: '#14B8A6' }}>4</span>
            Document Log
          </h2>
          {project.documents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No documents uploaded.</p>
          ) : (
            <div className="print-card rounded-xl overflow-hidden" style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.1)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3">Filename</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3 w-40">Upload Date</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3 w-36">Classification</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3 w-28">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {project.documents.map((doc) => (
                    <tr key={doc.id} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <td className="px-5 py-3 text-sm text-foreground">{doc.filename}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {format(new Date(doc.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground capitalize">
                        {doc.docType ? doc.docType.replace(/_/g, " ") : "—"}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground capitalize">
                        {doc.processingStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* INSPECTION LOG */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'rgba(20,184,166,0.2)', color: '#14B8A6' }}>5</span>
            Inspection Log
          </h2>
          {!inspections || inspections.length === 0 ? (
            <p className="text-muted-foreground text-sm">No inspection steps recorded.</p>
          ) : (
            <div className="print-card rounded-xl overflow-hidden" style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.1)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3 w-8">#</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3">Inspection</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3 w-28">Status</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3 w-36">Scheduled</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-5 py-3 w-36">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((insp: {
                    id: string;
                    name: string;
                    status: string;
                    sortOrder?: number | null;
                    scheduledDate?: string | null;
                    completedDate?: string | null;
                  }) => (
                    <tr key={insp.id} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{insp.sortOrder ?? "—"}</td>
                      <td className="px-5 py-3 text-sm text-foreground">{insp.name}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground capitalize">{insp.status.replace(/_/g, " ")}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {insp.scheduledDate ? format(new Date(insp.scheduledDate), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {insp.completedDate ? format(new Date(insp.completedDate), "MMM d, yyyy") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-xs text-muted-foreground">
            Generated by MeritLayer · {exportDate} · Permit &amp; Compliance Intelligence for Greater Boston Developers
          </p>
        </div>
      </div>
    </>
  );
}
