"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";

type ReviewType = "lpr" | "spr";

interface Article80Step {
  id: string;
  label: string;
  description: string;
  estimatedWeeks: string;
}

const LPR_STEPS: Article80Step[] = [
  {
    id: "bpda_pre_application_conference",
    label: "Pre-Application Conference",
    description: "Schedule and attend pre-app meeting with BPDA staff before filing",
    estimatedWeeks: "2–4 weeks",
  },
  {
    id: "pnf_submission",
    label: "Project Notification Form (PNF)",
    description: "Submit PNF to BPDA including project description, site plans, and community impact analysis",
    estimatedWeeks: "4–8 weeks to prepare",
  },
  {
    id: "public_comment_period_30_days",
    label: "30-Day Public Comment Period",
    description: "BPDA publishes PNF; 30-day public comment window opens",
    estimatedWeeks: "30 days (required)",
  },
  {
    id: "iag_formation",
    label: "Impact Advisory Group (IAG) Formation",
    description: "BPDA convenes IAG with community representatives and city agencies",
    estimatedWeeks: "4–6 weeks",
  },
  {
    id: "scoping_determination",
    label: "Scoping Determination",
    description: "BPDA issues letter defining required impact studies (traffic, shadow, wind, etc.)",
    estimatedWeeks: "4–8 weeks",
  },
  {
    id: "dpir_submission",
    label: "Draft Project Impact Report (DPIR)",
    description: "Prepare and submit DPIR addressing all scoping items",
    estimatedWeeks: "3–6 months to prepare",
  },
  {
    id: "iag_review_meetings",
    label: "IAG Review Meetings",
    description: "Attend IAG meetings to present DPIR findings and respond to community concerns",
    estimatedWeeks: "2–4 months",
  },
  {
    id: "fpir_submission",
    label: "Final Project Impact Report (FPIR)",
    description: "Submit FPIR incorporating IAG feedback and all outstanding issues",
    estimatedWeeks: "4–8 weeks to prepare",
  },
  {
    id: "bpda_board_vote",
    label: "BPDA Board Vote",
    description: "Project goes before BPDA board for approval vote",
    estimatedWeeks: "4–6 weeks",
  },
  {
    id: "dip_agreement",
    label: "Development Impact Project (DIP) Agreement",
    description: "Negotiate and execute DIP agreement covering affordable housing, linkage fees, and community benefits",
    estimatedWeeks: "4–12 weeks",
  },
  {
    id: "article_80_covenant",
    label: "Article 80 Covenant",
    description: "Record Article 80 covenant with Suffolk County Registry of Deeds",
    estimatedWeeks: "2–4 weeks",
  },
  {
    id: "isd_building_permit",
    label: "Building Permit Application to ISD",
    description: "With Article 80 complete, file building permit with Boston ISD",
    estimatedWeeks: "6–12 weeks for ISD review",
  },
];

const SPR_STEPS: Article80Step[] = [
  {
    id: "spr_pre_application_meeting",
    label: "Pre-Application Meeting with Planning Dept",
    description: "Contact article80inquiries@boston.gov; meet with project manager before filing any application",
    estimatedWeeks: "1–2 weeks",
  },
  {
    id: "spr_application_submission",
    label: "SPR Application Submission",
    description: "Submit application to Urban Design Division: site plans, elevations, design narrative, climate resilience plan",
    estimatedWeeks: "2–4 weeks to prepare",
  },
  {
    id: "agency_community_review",
    label: "Agency & Community Review",
    description: "Planning Dept routes to city agencies and impacted community; public comment period (typically 20 days)",
    estimatedWeeks: "20 days (required)",
  },
  {
    id: "urban_design_review",
    label: "Urban Design Review",
    description: "Urban Design Division reviews: consistency with design principles, site plan, climate resilience",
    estimatedWeeks: "3–6 weeks",
  },
  {
    id: "spr_determination",
    label: "SPR Determination",
    description: "Planning Dept issues written determination: approved, approved with conditions, or referred to LPR",
    estimatedWeeks: "2–4 weeks",
  },
  {
    id: "conditions_compliance_isd_permit",
    label: "Conditions Compliance + ISD Building Permit",
    description: "Satisfy any conditions; file building permit with Boston ISD",
    estimatedWeeks: "Varies + 6–12 weeks ISD",
  },
];

interface Article80TrackerProps {
  reviewType: ReviewType;
  // requirementTypes that are "met" in the compliance items for this project
  completedStepIds?: string[];
  // requirementTypes that are "in_progress"
  activeStepIds?: string[];
  // Map of requirementType → complianceItem id (for click-to-update)
  complianceItemIdMap?: Record<string, string>;
  // Called when a step circle is clicked — parent handles mutation
  onStepClick?: (stepId: string, currentStatus: "pending" | "in_progress" | "met", stepDescription: string) => void;
}

export function Article80Tracker({
  reviewType,
  completedStepIds = [],
  activeStepIds = [],
  onStepClick,
}: Article80TrackerProps) {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const toggleExpand = (id: string) => setExpandedStepId((prev) => (prev === id ? null : id));

  const steps = reviewType === "lpr" ? LPR_STEPS : SPR_STEPS;
  const completedSet = new Set(completedStepIds);
  const activeSet = new Set(activeStepIds);

  const completedCount = steps.filter((s) => completedSet.has(s.id)).length;
  const totalCount = steps.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const timelineLabel = reviewType === "lpr" ? "Typically 12–18 months" : "Typically 3–6 months";
  const reviewLabel =
    reviewType === "lpr" ? "BPDA Large Project Review" : "BPDA Small Project Review";

  return (
    <div
      style={{
        background: "rgba(15,23,42,0.6)",
        border: "1px solid rgba(20,184,166,0.2)",
        borderRadius: 12,
        padding: "20px 24px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#14B8A6",
              }}
            >
              BPDA Review
            </span>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#F1F5F9", margin: "2px 0 0" }}>
              {reviewLabel}
            </h3>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#14B8A6", lineHeight: 1 }}>
              {completedCount}/{totalCount}
            </div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>steps complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: "rgba(51,65,85,0.6)", borderRadius: 2, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #14B8A6, #0D9488)",
              borderRadius: 2,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 11, color: "#64748B" }}>{progressPct}% complete</span>
          <span style={{ fontSize: 11, color: "#64748B" }}>
            <Clock
              style={{ display: "inline", width: 11, height: 11, marginRight: 3, verticalAlign: "middle" }}
            />
            {timelineLabel}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {steps.map((step, idx) => {
          const isCompleted = completedSet.has(step.id);
          const isActive = activeSet.has(step.id);
          const isExpanded = expandedStepId === step.id;

          const dotColor = isCompleted ? "#14B8A6" : isActive ? "#F59E0B" : "#334155";
          const labelColor = isCompleted ? "#64748B" : isActive ? "#FDE68A" : "#CBD5E1";
          const isLast = idx === steps.length - 1;
          const currentStatus = isCompleted ? "met" : isActive ? "in_progress" : "pending";
          const statusLabel = isCompleted ? "Done" : isActive ? "Working on it" : "Not started";

          return (
            <div key={step.id} style={{ display: "flex", gap: 12 }}>
              {/* Timeline spine */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 20 }}>
                <button
                  onClick={() => onStepClick?.(step.id, currentStatus, step.description)}
                  title={currentStatus === "pending" ? "Start working" : currentStatus === "in_progress" ? "Mark done" : "Reset"}
                  style={{ background: "none", border: "none", padding: 0, cursor: onStepClick ? "pointer" : "default", color: dotColor, display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.15s", marginTop: 2 }}
                  onMouseEnter={(e) => { if (onStepClick) (e.currentTarget as HTMLButtonElement).style.opacity = "0.7"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                >
                  {isCompleted ? (
                    <CheckCircle2 style={{ width: 18, height: 18 }} />
                  ) : isActive ? (
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #F59E0B", background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
                    </div>
                  ) : (
                    <Circle style={{ width: 18, height: 18 }} />
                  )}
                </button>
                {!isLast && (
                  <div style={{ width: 1, flex: 1, minHeight: 16, background: isCompleted ? "rgba(20,184,166,0.3)" : "rgba(51,65,85,0.5)", margin: "3px 0" }} />
                )}
              </div>

              {/* Content */}
              <div style={{ paddingBottom: isLast ? 0 : 12, flex: 1 }}>
                {/* Clickable header */}
                <div onClick={() => toggleExpand(step.id)} style={{ cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: labelColor, textDecoration: isCompleted ? "line-through" : "none", flex: 1, lineHeight: "1.45" }}>
                    {idx + 1}. {step.label}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: `${dotColor}22`, color: dotColor, whiteSpace: "nowrap" }}>{statusLabel}</span>
                    <span style={{ fontSize: 10, color: "#475569", display: "inline-block", transition: "transform 0.15s", transform: isExpanded ? "rotate(180deg)" : "none" }}>▼</span>
                  </div>
                </div>
                {/* Expanded panel */}
                {isExpanded && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 10, lineHeight: 1.55 }}>{step.description}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "#64748B" }}>⏱ {step.estimatedWeeks}</span>
                    </div>
                    {onStepClick && (
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        {currentStatus !== "in_progress" && (
                          <button onClick={() => onStepClick(step.id, currentStatus, step.description)}
                            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 5, background: "rgba(245,158,11,0.15)", color: "#FDE68A", border: "1px solid rgba(245,158,11,0.3)", cursor: "pointer", fontWeight: 600 }}>
                            → Start Working
                          </button>
                        )}
                        {currentStatus !== "met" && (
                          <button onClick={() => onStepClick(step.id, "in_progress", step.description)}
                            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 5, background: "rgba(20,184,166,0.15)", color: "#5EEAD4", border: "1px solid rgba(20,184,166,0.3)", cursor: "pointer", fontWeight: 600 }}>
                            ✓ Mark Done
                          </button>
                        )}
                        {(currentStatus === "met" || currentStatus === "in_progress") && (
                          <button onClick={() => onStepClick(step.id, currentStatus, step.description)}
                            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 5, background: "rgba(255,255,255,0.05)", color: "#64748B", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>
                            ↩ Reset
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: "1px solid rgba(51,65,85,0.4)",
          fontSize: 11,
          color: "#475569",
        }}
      >
        Administered by the Boston Planning & Development Agency (BPDA) under Boston Zoning Code Article 80.
        {" "}
        <a
          href="https://www.bostonplans.org/projects/development-review/article-80-development-review"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#14B8A6", textDecoration: "underline" }}
        >
          BPDA Article 80 Guide →
        </a>
      </div>
    </div>
  );
}
