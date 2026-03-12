// Typed data access + fee calculation for Massachusetts permit rules

import rawData from "../../data/massachusetts-permit-rules.json";

export type PermitRequirementItem = {
  item: string;
  sourceUrl?: string;
  sourceText?: string;
  reasoning?: string;
};

export type JurisdictionPermitType = {
  whatRequiresPermit?: string[];
  whatDoesNotRequirePermit?: string[];
  additionalApprovalsRequired?: string[];
  applicationRequirements?: PermitRequirementItem[];
  fees?: Record<string, unknown>;
  tradeFees?: Record<string, unknown>;
  processSteps?: string[];
  requirements?: Array<{ item: string; sourceUrl?: string; sourceText?: string; reasoning?: string }>;
  resources?: Array<{ name: string; url: string }>;
  applicationTypes?: Array<{ type: string; use: string }>;
  specialConsiderations?: string[];
};

export type JurisdictionData = {
  name: string;
  county?: string;
  department: string;
  portal?: string;
  permitFinder?: string;
  address?: string;
  phone?: string;
  fax?: string;
  hours?: string;
  sources: string[];
  permitTypes?: Record<string, JurisdictionPermitType>;
  keyContacts?: Array<{ name: string; phone?: string; email?: string; address?: string; url?: string }>;
  specialConsiderations?: string[];
  notes?: string;
};

export type StateWideRules = {
  whatRequiresPermit: string[];
  whatDoesNotRequirePermit: string[];
  uniqueConsiderations: string[];
  applicationRequirements: Array<{ item: string; required: boolean }>;
  processSteps: string[];
};

export type PermitRulesData = {
  state: string;
  stateCode: string;
  stateCodeRef: string;
  lastUpdated: string;
  sources: string[];
  stateWideRules: StateWideRules;
  jurisdictions: Record<string, JurisdictionData>;
};

export const PERMIT_RULES = rawData as unknown as PermitRulesData;

// Slug ↔ JSON key mapping
const PERMIT_TYPE_SLUG_MAP: Record<string, string> = {
  "demolition-permit": "demolition",
  "building-permit": "building",
  "trade-permit": "trade",
};

export function getJurisdiction(key: string): JurisdictionData | null {
  return PERMIT_RULES.jurisdictions[key] ?? null;
}

export function getPermitTypeData(
  jurisdiction: string,
  permitTypeSlug: string
): JurisdictionPermitType | null {
  const j = getJurisdiction(jurisdiction);
  if (!j?.permitTypes) return null;
  const key = PERMIT_TYPE_SLUG_MAP[permitTypeSlug] ?? permitTypeSlug;
  return j.permitTypes[key] ?? null;
}

export function permitTypeLabel(slug: string): string {
  const labels: Record<string, string> = {
    "demolition-permit": "Demolition Permit",
    "building-permit": "Building Permit",
    "trade-permit": "Trade Permit",
  };
  return labels[slug] ?? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function jurisdictionLabel(slug: string): string {
  if (slug === "massachusetts") return "Massachusetts";
  const j = getJurisdiction(slug);
  return j?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

// All valid permit guide routes
export const PERMIT_GUIDE_ROUTES: Array<{ jurisdiction: string; permitType: string }> = [
  { jurisdiction: "boston", permitType: "demolition-permit" },
  { jurisdiction: "boston", permitType: "building-permit" },
  { jurisdiction: "cambridge", permitType: "building-permit" },
  { jurisdiction: "brookline", permitType: "building-permit" },
  { jurisdiction: "salem", permitType: "building-permit" },
  { jurisdiction: "lowell", permitType: "building-permit" },
  { jurisdiction: "springfield", permitType: "building-permit" },
  { jurisdiction: "massachusetts", permitType: "building-permit" },
];

// Fee calculation
export type FeeBreakdownItem = {
  label: string;
  amount: number;
  note?: string;
};

export type FeeCalculationResult = {
  items: FeeBreakdownItem[];
  total: number;
  disclaimer: string;
};

export function calculatePermitFee(
  jurisdiction: string,
  permitTypeSlug: string,
  projectCost: number,
  projectType: "residential" | "commercial" = "residential"
): FeeCalculationResult {
  if (projectCost <= 0) {
    return { items: [], total: 0, disclaimer: "" };
  }

  const items: FeeBreakdownItem[] = [];

  switch (jurisdiction) {
    case "boston":
      if (permitTypeSlug === "building-permit") {
        const rate = projectType === "residential" ? 50 : 100;
        const fee = Math.max(50, (projectCost / 1000) * rate);
        items.push({
          label: "Building Permit Fee",
          amount: fee,
          note: `$${rate} per $1,000 of construction cost`,
        });
      } else if (permitTypeSlug === "demolition-permit") {
        const fee = Math.max(100, (projectCost / 1000) * 50);
        items.push({
          label: "Demolition Permit Fee",
          amount: fee,
          note: "$50 per $1,000 (residential estimate)",
        });
        items.push({
          label: "Fire Prevention Permit",
          amount: 150,
          note: "Estimated — separate Boston Fire Prevention permit required",
        });
      }
      break;

    case "cambridge":
      if (permitTypeSlug === "building-permit") {
        const buildFee = Math.max(50, (projectCost / 1000) * 20);
        items.push({ label: "Building Permit Fee", amount: buildFee, note: "$20 per $1,000 (min $50)" });
        items.push({ label: "Plan Review Fee", amount: 100, note: "Flat fee" });
      }
      break;

    case "brookline":
      if (permitTypeSlug === "building-permit") {
        const buildFee = Math.max(50, (projectCost / 1000) * 20);
        items.push({ label: "Building Permit Fee", amount: buildFee, note: "$20 per $1,000 (min $50)" });
        if (projectType === "residential") {
          items.push({ label: "Plan Review Fee (Alteration)", amount: 100, note: "$75/1,000 sq ft (min $100)" });
        } else {
          items.push({ label: "Plan Review Fee (New Construction)", amount: 200, note: "$150/1,000 sq ft (min $200)" });
        }
      }
      break;

    case "salem":
      if (permitTypeSlug === "building-permit") {
        const rate = projectType === "residential" ? 15 : 20;
        const fee = 75 + (projectCost / 1000) * rate;
        items.push({ label: "Building Permit Fee", amount: fee, note: `$75 base + $${rate} per $1,000` });
      }
      break;

    case "lowell":
      if (permitTypeSlug === "building-permit") {
        const fee =
          projectCost <= 1000 ? 50 : 50 + Math.floor((projectCost - 1000) / 1000) * 10;
        items.push({
          label: "Building Permit Fee",
          amount: fee,
          note: "$50 (up to $1,000); +$10 per $1,000 above",
        });
      }
      break;

    case "springfield":
      if (permitTypeSlug === "building-permit") {
        if (projectType === "residential") {
          const fee = Math.max(250, (projectCost / 1000) * 8);
          items.push({ label: "Building Permit Fee", amount: fee, note: "$250 min or $8 per $1,000" });
        } else {
          const fee = Math.max(100, (projectCost / 1000) * 12);
          items.push({ label: "Building Permit Fee", amount: fee, note: "$100 min or $12 per $1,000" });
        }
      }
      break;

    case "massachusetts":
      if (permitTypeSlug === "building-permit") {
        const estFee = Math.max(50, (projectCost / 1000) * 20);
        items.push({
          label: "Building Permit Fee (typical)",
          amount: estFee,
          note: "Typical MA rate: $20 per $1,000 — varies by city",
        });
      }
      break;
  }

  const total = items.reduce((sum, i) => sum + i.amount, 0);

  return {
    items,
    total,
    disclaimer:
      "This is an estimate only. Actual fees depend on project specifics and must be confirmed with the local building department before construction.",
  };
}
