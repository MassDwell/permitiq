import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  projectShares,
  projects,
  complianceItems,
  documents,
  permitWorkflows,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { format } from "date-fns";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: PageProps) {
  const { token } = await params;

  const share = await db.query.projectShares.findFirst({
    where: eq(projectShares.shareToken, token),
  });

  if (!share) notFound();

  if (share.expiresAt && share.expiresAt < new Date()) {
    return (
      <div style={{ minHeight: "100vh", background: "#070D1A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>Link Expired</p>
          <p style={{ color: "#64748B" }}>This compliance report link has expired.</p>
        </div>
      </div>
    );
  }

  // Increment view count (fire-and-forget)
  db.update(projectShares)
    .set({ viewCount: sql`${projectShares.viewCount} + 1` })
    .where(eq(projectShares.id, share.id))
    .catch(() => {});

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, share.projectId),
    with: {
      complianceItems: {
        orderBy: (ci, { asc }) => [asc(ci.deadline)],
      },
      documents: {
        orderBy: (d, { desc }) => [desc(d.createdAt)],
      },
      permitWorkflows: {
        orderBy: (pw, { desc }) => [desc(pw.createdAt)],
      },
    },
  });

  if (!project) notFound();

  const totalItems = project.complianceItems.length;
  const metItems = project.complianceItems.filter((i) => i.status === "met").length;
  const overdueItems = project.complianceItems.filter((i) => i.status === "overdue").length;
  const pendingItems = project.complianceItems.filter((i) => i.status === "pending").length;
  const healthScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 100;

  const now = new Date();
  const in60Days = new Date(now.getTime() + 60 * 86400000);
  const upcomingDeadlines = project.complianceItems
    .filter((i) => i.deadline && new Date(i.deadline) > now && new Date(i.deadline) <= in60Days && i.status !== "met")
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 3);

  const scoreColor = healthScore >= 80 ? "#14B8A6" : healthScore >= 50 ? "#F59E0B" : "#EF4444";
  const statusLabel = overdueItems > 0 ? "At Risk" : healthScore >= 80 ? "On Track" : "Needs Attention";
  const statusColor = overdueItems > 0 ? "#EF4444" : healthScore >= 80 ? "#14B8A6" : "#F59E0B";
  const statusBg = overdueItems > 0 ? "rgba(239,68,68,0.12)" : healthScore >= 80 ? "rgba(20,184,166,0.12)" : "rgba(245,158,11,0.12)";

  function permitStatusLabel(s: string) {
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function complianceIcon(status: string) {
    if (status === "met") return "✅";
    if (status === "overdue") return "❌";
    return "⏳";
  }

  return (
    <div style={{ minHeight: "100vh", background: "#070D1A", color: "#E2E8F0", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "1.25rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0A1020" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #14B8A6, #0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>M</div>
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#fff", letterSpacing: "-0.02em" }}>MeritLayer</span>
        </div>
        <span style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748B", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.25rem 0.75rem", borderRadius: 999 }}>
          Compliance Report
        </span>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
        {/* Project title block */}
        <div style={{ marginBottom: "2rem" }}>
          {share.label && (
            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#14B8A6", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.5rem" }}>{share.label}</p>
          )}
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: "0.4rem" }}>{project.name}</h1>
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", fontSize: "0.875rem", color: "#64748B" }}>
            {project.address && <span>📍 {project.address}</span>}
            {project.jurisdiction && <span>🏛 {project.jurisdiction}</span>}
            <span>Generated {format(new Date(), "MMMM d, yyyy")}</span>
          </div>
        </div>

        {/* Compliance Summary Card */}
        <div style={{ borderRadius: 16, padding: "1.75rem", background: "#0E1525", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94A3B8", marginBottom: "1.25rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>Compliance Summary</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "3.5rem", fontWeight: 800, color: scoreColor, lineHeight: 1, letterSpacing: "-0.03em" }}>{healthScore}%</div>
              <div style={{ fontSize: "0.85rem", color: "#64748B", marginTop: "0.25rem" }}>Compliance Score</div>
            </div>
            <div style={{ height: 64, width: 1, background: "rgba(255,255,255,0.07)" }} />
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#10B981" }}>{metItems}<span style={{ fontSize: "1rem", color: "#475569" }}>/{totalItems}</span></div>
                <div style={{ fontSize: "0.8rem", color: "#64748B" }}>Requirements Met</div>
              </div>
              <div>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#F59E0B" }}>{pendingItems}</div>
                <div style={{ fontSize: "0.8rem", color: "#64748B" }}>Pending</div>
              </div>
              <div>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#EF4444" }}>{overdueItems}</div>
                <div style={{ fontSize: "0.8rem", color: "#64748B" }}>Overdue</div>
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span style={{ padding: "0.4rem 1rem", borderRadius: 999, fontSize: "0.8rem", fontWeight: 700, color: statusColor, background: statusBg, border: `1px solid ${statusColor}30` }}>{statusLabel}</span>
            </div>
          </div>
          {/* Score bar */}
          <div style={{ marginTop: "1.25rem", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${healthScore}%`, background: scoreColor, borderRadius: 3, transition: "width 0.5s" }} />
          </div>
        </div>

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <div style={{ borderRadius: 16, padding: "1.5rem", background: "#0E1525", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94A3B8", marginBottom: "1rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>Upcoming Deadlines</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {upcomingDeadlines.map((item) => {
                const daysLeft = Math.ceil((new Date(item.deadline!).getTime() - now.getTime()) / 86400000);
                const urgentColor = daysLeft <= 7 ? "#EF4444" : daysLeft <= 14 ? "#F59E0B" : "#14B8A6";
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1rem", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div>
                      <div style={{ fontWeight: 500, color: "#E2E8F0", fontSize: "0.9rem" }}>{item.description}</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "0.15rem", textTransform: "capitalize" }}>{item.requirementType.replace(/_/g, " ")}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 600, color: urgentColor, fontSize: "0.875rem" }}>{format(new Date(item.deadline!), "MMM d, yyyy")}</div>
                      <div style={{ fontSize: "0.75rem", color: urgentColor, opacity: 0.8 }}>{daysLeft}d remaining</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Permit Workflow */}
        {project.permitWorkflows.length > 0 && (
          <div style={{ borderRadius: 16, padding: "1.5rem", background: "#0E1525", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94A3B8", marginBottom: "1rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>Permit Workflow</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {project.permitWorkflows.map((pw) => {
                const statusColors: Record<string, string> = {
                  approved: "#10B981",
                  submitted: "#0EA5E9",
                  under_review: "#8B5CF6",
                  in_progress: "#F59E0B",
                  rejected: "#EF4444",
                  on_hold: "#F59E0B",
                  not_started: "#475569",
                };
                const c = statusColors[pw.status] ?? "#475569";
                return (
                  <div key={pw.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div>
                      <div style={{ fontWeight: 500, color: "#E2E8F0", fontSize: "0.875rem" }}>{pw.permitName}</div>
                      {pw.jurisdiction && <div style={{ fontSize: "0.775rem", color: "#64748B" }}>{pw.jurisdiction}</div>}
                    </div>
                    <span style={{ padding: "0.2rem 0.7rem", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, color: c, background: `${c}18`, border: `1px solid ${c}30` }}>
                      {permitStatusLabel(pw.status)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Compliance Checklist */}
        {project.complianceItems.length > 0 && (
          <div style={{ borderRadius: 16, padding: "1.5rem", background: "#0E1525", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94A3B8", marginBottom: "1rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>Compliance Checklist</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {project.complianceItems.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", padding: "0.75rem 0.875rem", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "0.05rem" }}>{complianceIcon(item.status)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.875rem", color: item.status === "met" ? "#475569" : "#CBD5E1", textDecoration: item.status === "met" ? "line-through" : "none" }}>{item.description}</div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.2rem", fontSize: "0.75rem", color: "#475569" }}>
                      <span style={{ textTransform: "capitalize" }}>{item.requirementType.replace(/_/g, " ")}</span>
                      {item.deadline && <span>Due {format(new Date(item.deadline), "MMM d, yyyy")}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Log */}
        {project.documents.length > 0 && (
          <div style={{ borderRadius: 16, padding: "1.5rem", background: "#0E1525", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94A3B8", marginBottom: "1rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>Document Log</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {project.documents.map((doc) => (
                <div key={doc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem 0.875rem", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <span style={{ fontSize: "1rem" }}>📄</span>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "#CBD5E1" }}>{doc.filename}</div>
                      {doc.docType && <div style={{ fontSize: "0.75rem", color: "#475569", textTransform: "capitalize" }}>{doc.docType.replace(/_/g, " ")}</div>}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#475569" }}>{format(new Date(doc.createdAt), "MMM d, yyyy")}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: "0.8rem", color: "#475569", marginBottom: "1rem" }}>Generated by <strong style={{ color: "#14B8A6" }}>MeritLayer</strong> · meritlayer.ai</p>
          <a
            href="/"
            style={{ display: "inline-block", padding: "0.625rem 1.5rem", borderRadius: 8, background: "linear-gradient(135deg, #14B8A6, #0EA5E9)", color: "#fff", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}
          >
            Get started for free →
          </a>
        </div>
      </div>
    </div>
  );
}
