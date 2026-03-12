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
} from "lucide-react";

interface ResearchedRequirement {
  id: string;
  requirementType: string;
  description: string;
  requiredDocuments?: string[];
  typicalTimelineDays?: number;
  isRequired: boolean;
  notes?: string;
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

function RuleCard({ rule }: { rule: ResearchedRequirement }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="mt-0.5">
          {open ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">{rule.description}</span>
            {rule.isRequired ? (
              <Badge className="bg-blue-100 text-blue-800 text-xs">Required</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-600 text-xs">Conditional</Badge>
            )}
            {rule.typicalTimelineDays != null && rule.typicalTimelineDays > 0 && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                ~{rule.typicalTimelineDays}d
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1 capitalize">
            {rule.requirementType.replace(/_/g, " ")}
          </p>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t bg-gray-50 space-y-3 pt-3">
          {rule.requiredDocuments && rule.requiredDocuments.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Required Documents
              </p>
              <div className="flex flex-wrap gap-1.5">
                {rule.requiredDocuments.map((doc) => (
                  <Badge key={doc} variant="outline" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    {doc.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {rule.notes && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-xs text-gray-600 leading-relaxed">{rule.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PermitRequirementsPanelProps {
  projectId: string;
  jurisdiction?: string | null;
  projectType?: string | null;
}

export function PermitRequirementsPanel({ projectId, jurisdiction, projectType }: PermitRequirementsPanelProps) {
  const [researchedRules, setResearchedRules] = useState<ResearchedRequirement[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [hasResearched, setHasResearched] = useState(false);
  const [permitCategory, setPermitCategory] = useState("building");

  const { data, isLoading } = trpc.jurisdictionRules.getRequirementsForProject.useQuery({ projectId });

  const handleResearch = async () => {
    if (!jurisdiction || !projectType) {
      toast.error("Set a jurisdiction and project type on the project first");
      return;
    }

    setIsResearching(true);
    try {
      const res = await fetch("/api/research-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, jurisdiction, projectType, permitCategory }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Research failed");
      }

      const result = await res.json() as { requirements: ResearchedRequirement[] };
      setResearchedRules(result.requirements);
      setHasResearched(true);
      toast.success(`Found ${result.requirements.length} requirements for ${jurisdiction}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Research failed");
    } finally {
      setIsResearching(false);
    }
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
      {/* Jurisdiction info + AI research button */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-500" />
                Requirements Research
              </CardTitle>
              <CardDescription className="mt-1">
                {jurisdiction
                  ? `Rules for ${jurisdiction}${projectType ? ` — ${projectType} project` : ""}`
                  : "Set a jurisdiction on the project to load requirements"}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {/* Permit category selector */}
              <select
                value={permitCategory}
                onChange={(e) => setPermitCategory(e.target.value)}
                className="text-xs border rounded px-2 py-1.5 bg-white text-gray-700"
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
                disabled={isResearching || !jurisdiction}
              >
                {isResearching ? (
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
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Official Sources</p>
            <div className="flex flex-wrap gap-2">
              {sourceLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {link.label}
                </a>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* AI-researched results */}
      {hasResearched && researchedRules.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <h3 className="font-semibold text-gray-900">
              AI-Researched: {permitCategory.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Requirements
            </h3>
            <Badge className="bg-purple-100 text-purple-800 text-xs">AI Research</Badge>
          </div>
          <div className="space-y-2">
            {researchedRules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      )}

      {/* DB-based jurisdiction rules */}
      {hasJurisdictionRules ? (
        <div className="space-y-6">
          {data!.rulesets
            .filter((rs) => rs.rules.length > 0)
            .map((ruleset) => (
              <div key={ruleset.id}>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">{ruleset.jurisdictionName}</h3>
                  <Badge variant="outline" className="text-xs">{ruleset.rules.length} rules</Badge>
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
            <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {jurisdiction ? "No saved rules found" : "No jurisdiction set"}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {jurisdiction
                ? `Click "Research Requirements" to fetch current requirements for ${jurisdiction}.`
                : "Set a jurisdiction in the Settings tab, then research requirements here."}
            </p>
            {jurisdiction && (
              <Button onClick={handleResearch} disabled={isResearching}>
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
