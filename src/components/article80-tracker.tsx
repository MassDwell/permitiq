"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";

type ReviewType = "large" | "small";

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
    id: "bpda_pre_application_conference",
    label: "Pre-Application Conference (Recommended)",
    description: "Meet with BPDA staff to discuss project informally before filing",
    estimatedWeeks: "1–2 weeks",
  },
  {
    id: "pnf_submission",
    label: "Project Notification Form (PNF)",
    description: "Submit PNF to BPDA with project description, plans, and community context",
    estimatedWeeks: "2–4 weeks to prepare",
  },
  {
    id: "public_comment_period_20_days",
    label: "20-Day Public Comment Period",
    description: "BPDA publishes PNF; 20-day public comment window opens",
    estimatedWeeks: "20 days (required)",
  },
  {
    id: "spr_determination",
    label: "Small Project Review Determination",
    description: "BPDA issues determination: approved, approved with conditions, or referred to LPR",
    estimatedWeeks: "4–8 weeks",
  },
  {
    id: "conditions_compliance",
    label: "Conditions Compliance",
    description: "If approved with conditions, document and comply with all BPDA conditions",
    estimatedWeeks: "Varies",
  },
  {
    id: "isd_building_permit",
    label: "Building Permit Application to ISD",
    description: "With SPR complete, file building permit with Boston ISD",
    estimatedWeeks: "6–12 weeks for ISD review",
  },
];

interface Article80TrackerProps {
  reviewType: ReviewType;
  // requirementTypes that are "met" in the compliance items for this project
  completedStepIds?: string[];
  // requirementTypes that are "in_progress"
  activeStepIds?: string[];
}

export function Article80Tracker({
  reviewType,
  completedStepIds = [],
  activeStepIds = [],
}: Article80TrackerProps) {
  const steps = reviewType === "large" ? LPR_STEPS : SPR_STEPS;
  const completedSet = new Set(completedStepIds);
  const activeSet = new Set(activeStepIds);

  const completedCount = steps.filter((s) => completedSet.has(s.id)).length;
  const totalCount = steps.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const timelineLabel = reviewType === "large" ? "6–18 months total" : "3–6 months total";
  const reviewLabel =
    reviewType === "large" ? "Article 80 Large Project Review (LPR)" : "Article 80 Small Project Review (SPR)";

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
          const isUpcoming = !isCompleted && !isActive;

          let iconColor = "#334155"; // upcoming
          if (isCompleted) iconColor = "#14B8A6";
          else if (isActive) iconColor = "#F59E0B";

          let labelColor = "#64748B";
          if (isCompleted) labelColor = "#94A3B8";
          else if (isActive) labelColor = "#F1F5F9";

          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} style={{ display: "flex", gap: 12 }}>
              {/* Timeline line + icon */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ color: iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isCompleted ? (
                    <CheckCircle2 style={{ width: 18, height: 18 }} />
                  ) : isActive ? (
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: "2px solid #F59E0B",
                        background: "rgba(245,158,11,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
                    </div>
                  ) : (
                    <Circle style={{ width: 18, height: 18 }} />
                  )}
                </div>
                {!isLast && (
                  <div
                    style={{
                      width: 1,
                      flex: 1,
                      minHeight: 16,
                      background: isCompleted ? "rgba(20,184,166,0.3)" : "rgba(51,65,85,0.5)",
                      margin: "2px 0",
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div style={{ paddingBottom: isLast ? 0 : 12, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: labelColor,
                      textDecoration: isCompleted ? "line-through" : "none",
                    }}
                  >
                    {idx + 1}. {step.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#475569",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {step.estimatedWeeks}
                  </span>
                </div>
                {isActive && (
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{step.description}</div>
                )}
                {isUpcoming && idx === steps.findIndex((s) => !completedSet.has(s.id) && !activeSet.has(s.id)) && (
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Next step</div>
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
