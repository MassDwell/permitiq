"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Clock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Loader2,
  Building2,
  BookOpen,
  CheckSquare,
  CheckCircle2,
} from "lucide-react";

interface ResearchedRequirement {
  id: string;
  requirementType: string;
  description: string;
  requiredDocuments?: string[];
  typicalTimelineDays?: number;
  isRequired: boolean;
  notes?: string;
  status?: string;
}

const JURISDICTION_SOURCE_LINKS: Record<string, { label: string; url: string }[]> = {
  BOSTON_ISD: [
    { label: "Boston ISD Permit Portal", url: "https://onlinepermitsandlicenses.boston.gov/isdpermits/" },
    { label: "Boston Building Permits Guide", url: "https://www.boston.gov/departments/inspectional-services/what-building-permit-do-i-need" },
    { label: "Boston Demolition Permits", url: "https://www.boston.gov/departments/inspectional-services/how-get-demolition-permit" },
  ],
  BOSTON_BPDA: [
    { label: "BPDA Article 80 Process", url: "https://www.bostonplans.org/planning/planning-initiatives/article-80" },
    { label: "Inclusionary Development Policy", url: "https://www.bostonplans.org/housing/inclusionary-development-policy" },
    { label: "BPDA Design Review", url: "https://www.bostonplans.org/planning/design-review" },
  ],
  BOSTON_ZBA: [
    { label: "Boston ZBA Online Filing", url: "https://www.boston.gov/departments/inspectional-services/zoning-board-appeal" },
    { label: "ZBA Variance Application Guide", url: "https://www.boston.gov/departments/inspectional-services/how-file-variance-or-appeal-zoning-board-appeal" },
  ],
  MA_GENERIC: [
    { label: "780 CMR State Building Code", url: "https://www.mass.gov/info-details/massachusetts-state-building-code-780-cmr" },
    { label: "MA Stretch Energy Code", url: "https://www.mass.gov/info-details/stretch-energy-code-large-buildings" },
    { label: "MA Accessibility (521 CMR)", url: "https://www.mass.gov/orgs/architectural-access-board" },
  ],
};

// Read-only rule card for DB-based jurisdiction rules
function RuleCard({ rule }: { rule: ResearchedRequirement }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-lg overflow-hidden transition-colors"
      style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
    >
      <button
        className="w-full flex items-start gap-3 p-4 text-left transition-colors"
        style={{ background: "transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        onClick={() => setOpen(!open)}
      >
        <div className="mt-0.5">
          {open ? (
            <ChevronDown className="h-4 w-4 text-[#475569]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#475569]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-[#E2E8F0] text-sm">{rule.description}</span>
            {rule.isRequired ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/25">Required</span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/8 text-[#94A3B8] border border-white/10">Conditional</span>
            )}
            {rule.typicalTimelineDays != null && rule.typicalTimelineDays > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-white/10 text-[#94A3B8]">
                <Clock className="h-3 w-3" />
                ~{rule.typicalTimelineDays}d
              </span>
            )}
          </div>
          <p className="text-xs text-[#475569] mt-1 capitalize">
            {rule.requirementType.replace(/_/g, " ")}
          </p>
        </div>
      </button>

      {open && (
        <div
          className="px-4 pb-4 space-y-3 pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.15)" }}
        >
          {rule.requiredDocuments && rule.requiredDocuments.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1.5">
                Required Documents
              </p>
              <div className="flex flex-wrap gap-1.5">
                {rule.requiredDocuments.map((doc) => (
                  <span key={doc} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border border-white/10 text-[#94A3B8]">
                    <FileText className="h-3 w-3" />
                    {doc.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
          {rule.notes && (
            <div>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1">Notes</p>
              <p className="text-xs text-[#94A3B8] leading-relaxed">{rule.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending:        { bg: "rgba(245,158,11,0.12)",  text: "#FCD34D",  border: "rgba(245,158,11,0.3)",  label: "Pending" },
  in_progress:    { bg: "rgba(59,130,246,0.12)",  text: "#93C5FD",  border: "rgba(59,130,246,0.3)",  label: "In Progress" },
  met:            { bg: "rgba(34,197,94,0.12)",   text: "#86EFAC",  border: "rgba(34,197,94,0.3)",   label: "Met" },
  overdue:        { bg: "rgba(239,68,68,0.12)",   text: "#FCA5A5",  border: "rgba(239,68,68,0.3)",   label: "Overdue" },
  not_applicable: { bg: "rgba(255,255,255,0.06)", text: "#64748B",  border: "rgba(255,255,255,0.1)", label: "N/A" },
};

// Actionable compliance item card — shown after research
function ActionableItemCard({
  item,
  projectId,
}: {
  item: ResearchedRequirement;
  projectId: string;
}) {
  const [currentStatus, setCurrentStatus] = useState(item.status ?? "pending");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(item.notes ?? "");
  const [savedNotes, setSavedNotes] = useState(item.notes ?? "");

  const updateMutation = trpc.compliance.update.useMutation({
    onSuccess: (updated) => {
      setCurrentStatus(updated.status);
      toast.success("Updated");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to update");
    },
  });

  const isMet = currentStatus === "met";
  const statusStyle = STATUS_COLORS[currentStatus] ?? STATUS_COLORS.pending;

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    updateMutation.mutate({
      id: item.id,
      status: newStatus as "pending" | "in_progress" | "met" | "overdue" | "not_applicable",
    });
  };

  const handleSaveNotes = () => {
    updateMutation.mutate({ id: item.id, notes: notesText });
    setSavedNotes(notesText);
    setEditingNotes(false);
  };

  return (
    <div
      className="rounded-lg p-4 transition-all"
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: isMet ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.03)",
        opacity: isMet ? 0.7 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Met checkmark */}
        <div className="mt-0.5 shrink-0">
          {isMet ? (
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          ) : (
            <div
              className="h-4 w-4 rounded-full border-2 mt-0.5"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <p
                className="font-medium text-sm leading-snug"
                style={{ color: isMet ? "#64748B" : "#E2E8F0", textDecoration: isMet ? "line-through" : "none" }}
              >
                {item.description}
              </p>
              <p className="text-xs text-[#475569] mt-0.5 capitalize">
                {item.requirementType.replace(/_/g, " ")}
              </p>
            </div>

            {/* Status dropdown */}
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updateMutation.isPending}
              className="text-xs rounded-full px-2.5 py-1 font-medium cursor-pointer shrink-0 border"
              style={{
                background: statusStyle.bg,
                color: statusStyle.text,
                borderColor: statusStyle.border,
                outline: "none",
              }}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="met">Met</option>
              <option value="overdue">Overdue</option>
              <option value="not_applicable">N/A</option>
            </select>
          </div>

          {/* Notes section */}
          <div className="mt-2">
            {editingNotes ? (
              <div className="flex gap-2">
                <textarea
                  autoFocus
                  rows={2}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 text-xs px-3 py-2 rounded-lg resize-none"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#E2E8F0",
                    outline: "none",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setEditingNotes(false);
                  }}
                />
                <div className="flex flex-col gap-1">
                  <button
                    onClick={handleSaveNotes}
                    disabled={updateMutation.isPending}
                    className="text-xs px-3 py-1.5 rounded font-medium"
                    style={{ background: "#14B8A6", color: "#0F172A" }}
                  >
                    {updateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                  </button>
                  <button
                    onClick={() => { setNotesText(savedNotes); setEditingNotes(false); }}
                    className="text-xs px-3 py-1.5 rounded font-medium text-[#64748B] hover:text-[#94A3B8]"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : savedNotes ? (
              <div className="flex items-start gap-2">
                <p
                  className="text-xs flex-1 px-3 py-2 rounded-lg"
                  style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.15)", color: "#94A3B8" }}
                >
                  📝 {savedNotes}
                </p>
                <button
                  onClick={() => { setNotesText(savedNotes); setEditingNotes(true); }}
                  className="text-xs text-[#475569] hover:text-[#14B8A6] shrink-0 mt-1 transition-colors"
                >
                  Edit
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingNotes(true)}
                className="text-xs text-[#475569] hover:text-[#14B8A6] transition-colors flex items-center gap-1"
              >
                + Add note
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PermitRequirementsPanelProps {
  projectId: string;
  jurisdiction?: string | null;
  projectType?: string | null;
}

// Map stored jurisdiction codes → human-readable labels
const JURISDICTION_DISPLAY: Record<string, string> = {
  BOSTON_ISD: "Boston, MA (ISD)",
  BOSTON_BPDA: "Boston, MA (BPDA)",
  BOSTON_ZBA: "Boston, MA (ZBA)",
  CAMBRIDGE_MA: "Cambridge, MA",
  SOMERVILLE_MA: "Somerville, MA",
  NEWTON_MA: "Newton, MA",
  BROOKLINE_MA: "Brookline, MA",
  QUINCY_MA: "Quincy, MA",
  MA_GENERIC: "Generic MA",
  other: "Other / Unknown",
};

function getJurisdictionLabel(jurisdiction: string): string {
  return JURISDICTION_DISPLAY[jurisdiction] ?? JURISDICTION_DISPLAY[jurisdiction.toUpperCase()] ?? jurisdiction;
}

// Map panel permitCategory values → permit type strings that the curated rules router understands
const CATEGORY_TO_PERMIT_TYPE: Record<string, string> = {
  building: "Boston building permit",
  demolition: "Boston demolition permit",
  electrical: "Boston electrical permit",
  plumbing: "Boston plumbing permit",
  hvac: "Boston HVAC permit",
  zba_variance: "ZBA variance Boston",
  article_80_small: "Article 80 Small Project Review Boston",
  article_80_large: "Article 80 Large Project Review Boston",
  bpda_review: "BPDA review Boston",
  certificate_of_occupancy: "certificate of occupancy Boston",
};

export function PermitRequirementsPanel({ projectId, jurisdiction, projectType }: PermitRequirementsPanelProps) {
  const [researchedItems, setResearchedItems] = useState<ResearchedRequirement[]>([]);
  const [hasResearched, setHasResearched] = useState(false);
  const [permitCategory, setPermitCategory] = useState("building");

  const { data, isLoading } = trpc.jurisdictionRules.getRequirementsForProject.useQuery({ projectId });
  const utils = trpc.useUtils();

  const researchMutation = trpc.compliance.researchRequirements.useMutation({
    onSuccess: (data) => {
      const mapped: ResearchedRequirement[] = data.items.map((item) => ({
        id: item.id,
        requirementType: item.requirementType,
        description: item.description,
        isRequired: true,
        notes: item.sourceText ?? undefined,
        status: item.status,
      }));
      setResearchedItems(mapped);
      setHasResearched(true);
      void utils.projects.get.invalidate({ id: projectId });
      toast.success(`Added ${data.items.length} requirements for ${data.jurisdiction}`);
    },
    onError: (err) => {
      toast.error(err.message ?? "Research failed");
    },
  });

  const handleResearch = () => {
    if (!jurisdiction) {
      toast.error("Set a jurisdiction on the project first (Settings tab)");
      return;
    }
    const permitType = CATEGORY_TO_PERMIT_TYPE[permitCategory] ?? `${permitCategory} permit`;
    researchMutation.mutate({ projectId, permitType });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    );
  }

  const hasJurisdictionRules = data && data.rulesets.length > 0 && data.rulesets.some((rs) => rs.rules.length > 0);
  const sourceLinks = jurisdiction ? JURISDICTION_SOURCE_LINKS[jurisdiction.toUpperCase()] ?? [] : [];

  return (
    <div className="space-y-6">
      {/* Jurisdiction info + research button */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#14B8A6]" />
                Requirements Research
              </CardTitle>
              <CardDescription className="mt-1">
                {jurisdiction
                  ? `Rules for ${getJurisdictionLabel(jurisdiction)}${projectType ? ` — ${projectType} project` : ""}`
                  : "Set a jurisdiction on the project to load requirements"}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={permitCategory}
                onChange={(e) => setPermitCategory(e.target.value)}
                className="text-xs rounded px-2 py-1.5 border"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "#94A3B8",
                  outline: "none",
                }}
              >
                <option value="building">Building Permit</option>
                <option value="demolition">Demolition</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="hvac">HVAC</option>
                <option value="zba_variance">ZBA Variance</option>
                <option value="article_80_small">Article 80 Small</option>
                <option value="article_80_large">Article 80 Large</option>
                <option value="bpda_review">BPDA Review</option>
                <option value="certificate_of_occupancy">Certificate of Occupancy</option>
              </select>

              <Button
                size="sm"
                onClick={handleResearch}
                disabled={researchMutation.isPending || !jurisdiction}
              >
                {researchMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Research Requirements
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Source links */}
        {sourceLinks.length > 0 && (
          <CardContent className="pt-0">
            <p className="text-xs font-semibold text-[#475569] uppercase tracking-wide mb-2">Official Sources</p>
            <div className="flex flex-wrap gap-2">
              {sourceLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#5EEAD4] hover:text-[#14B8A6] transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  {link.label}
                </a>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Researched compliance items — actionable */}
      {hasResearched && researchedItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[#A78BFA]" />
            <h3 className="font-semibold text-[#F1F5F9]">
              {permitCategory.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Requirements
            </h3>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: "rgba(167,139,250,0.12)", color: "#A78BFA", border: "1px solid rgba(167,139,250,0.25)" }}
            >
              {researchedItems.filter((i) => i.status === "met").length}/{researchedItems.length} met
            </span>
          </div>
          <div className="space-y-2">
            {researchedItems.map((item) => (
              <ActionableItemCard key={item.id} item={item} projectId={projectId} />
            ))}
          </div>
        </div>
      )}

      {/* DB-based jurisdiction rules (read-only) */}
      {hasJurisdictionRules ? (
        <div className="space-y-6">
          {data!.rulesets
            .filter((rs) => rs.rules.length > 0)
            .map((ruleset) => (
              <div key={ruleset.id}>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-[#38BDF8]" />
                  <h3 className="font-semibold text-[#F1F5F9]">{ruleset.jurisdictionName}</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded border"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "#64748B" }}
                  >
                    {ruleset.rules.length} rules
                  </span>
                </div>
                <div className="space-y-2">
                  {ruleset.rules.map((rule) => (
                    <RuleCard key={rule.id} rule={rule} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : !hasResearched ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckSquare className="h-12 w-12 text-[#1E293B] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#F1F5F9] mb-2">
              {jurisdiction ? "No saved rules found" : "No jurisdiction set"}
            </h3>
            <p className="text-[#64748B] text-sm mb-4">
              {jurisdiction
                ? `Click "Research Requirements" to fetch current requirements for ${jurisdiction}.`
                : "Set a jurisdiction in the Settings tab, then research requirements here."}
            </p>
            {jurisdiction && (
              <Button onClick={handleResearch} disabled={researchMutation.isPending}>
                <Sparkles className="h-4 w-4 mr-2" />
                Research Requirements
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
