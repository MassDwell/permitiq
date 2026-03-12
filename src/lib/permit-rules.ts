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
  timeline?: string;
};

export type FeeCalculationResult = {
  items: FeeBreakdownItem[];
  total: number;
  disclaimer: string;
};

// Boston ISD 2024 fee schedule — all permit types
export interface BostonISDFeeInput {
  permitType:
    | "new_construction_residential"
    | "new_construction_commercial"
    | "alteration"
    | "demolition"
    | "electrical"
    | "plumbing"
    | "gas"
    | "hvac"
    | "zba_filing"
    | "article_80_small"
    | "article_80_large";
  projectCost?: number;       // for new_construction / alteration
  sqFt?: number;              // for demolition, article_80_large
  circuits?: number;          // for electrical
  fixtures?: number;          // for plumbing
  appliances?: number;        // for gas
  tonsOfCooling?: number;     // for hvac
  variancesRequested?: number; // for zba_filing
}

export const BOSTON_ISD_PERMIT_TYPES: Array<{ value: BostonISDFeeInput["permitType"]; label: string }> = [
  { value: "new_construction_residential", label: "New Construction (Residential)" },
  { value: "new_construction_commercial", label: "New Construction (Commercial)" },
  { value: "alteration", label: "Alteration / Addition" },
  { value: "demolition", label: "Demolition" },
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "gas", label: "Gas" },
  { value: "hvac", label: "Mechanical / HVAC" },
  { value: "zba_filing", label: "ZBA Filing Fee" },
  { value: "article_80_small", label: "Article 80 Small Project Review" },
  { value: "article_80_large", label: "Article 80 Large Project Review" },
];

export function calculateBostonISDFee(input: BostonISDFeeInput): FeeCalculationResult {
  const items: FeeBreakdownItem[] = [];

  switch (input.permitType) {
    case "new_construction_residential": {
      const cost = input.projectCost ?? 0;
      const fee = Math.max(100, (cost / 1000) * 15);
      items.push({
        label: "Building Permit — New Construction (Residential)",
        amount: fee,
        note: "$15 per $1,000 of construction cost (min $100)",
        timeline: "4–8 weeks for plan review",
      });
      break;
    }
    case "new_construction_commercial": {
      const cost = input.projectCost ?? 0;
      const fee = Math.max(100, (cost / 1000) * 15);
      items.push({
        label: "Building Permit — New Construction (Commercial)",
        amount: fee,
        note: "$15 per $1,000 of construction cost (min $100)",
        timeline: "8–12 weeks for plan review",
      });
      break;
    }
    case "alteration": {
      const cost = input.projectCost ?? 0;
      const fee = Math.max(50, (cost / 1000) * 12);
      items.push({
        label: "Building Permit — Alteration / Addition",
        amount: fee,
        note: "$12 per $1,000 of construction cost (min $50)",
        timeline: "2–6 weeks for plan review",
      });
      break;
    }
    case "demolition": {
      const sqFt = input.sqFt ?? 0;
      const fee = Math.max(50, sqFt * 0.10);
      items.push({
        label: "Demolition Permit",
        amount: fee,
        note: "$0.10 per SF (min $50)",
        timeline: "2–4 weeks; Article 85 review may add 30–90 days",
      });
      items.push({
        label: "Fire Prevention Permit (estimated)",
        amount: 150,
        note: "Separate Boston Fire Prevention permit required",
        timeline: "1–2 weeks",
      });
      break;
    }
    case "electrical": {
      const circuits = input.circuits ?? 0;
      const fee = 50 + circuits * 2;
      items.push({
        label: "Electrical Permit",
        amount: fee,
        note: `$50 base + $2 per circuit (${circuits} circuits)`,
        timeline: "1–3 weeks",
      });
      break;
    }
    case "plumbing": {
      const fixtures = input.fixtures ?? 0;
      const fee = 50 + fixtures * 15;
      items.push({
        label: "Plumbing Permit",
        amount: fee,
        note: `$50 base + $15 per fixture (${fixtures} fixtures)`,
        timeline: "1–3 weeks",
      });
      break;
    }
    case "gas": {
      const appliances = input.appliances ?? 0;
      const fee = 50 + appliances * 25;
      items.push({
        label: "Gas Permit",
        amount: fee,
        note: `$50 base + $25 per appliance (${appliances} appliances)`,
        timeline: "1–2 weeks",
      });
      break;
    }
    case "hvac": {
      const tons = input.tonsOfCooling ?? 0;
      const fee = 50 + tons * 2;
      items.push({
        label: "Mechanical / HVAC Permit",
        amount: fee,
        note: `$50 base + $2 per ton of cooling (${tons} tons)`,
        timeline: "1–3 weeks",
      });
      break;
    }
    case "zba_filing": {
      const variances = input.variancesRequested ?? 1;
      const fee = 200 + variances * 100;
      items.push({
        label: "ZBA Filing Fee",
        amount: fee,
        note: `$200 base + $100 per variance requested (${variances} variances)`,
        timeline: "6–10 weeks to hearing date; 10-day filing deadline before hearing",
      });
      break;
    }
    case "article_80_small": {
      items.push({
        label: "Article 80 Small Project Review",
        amount: 3500,
        note: "Flat fee — projects under BPDA threshold",
        timeline: "3–6 months",
      });
      break;
    }
    case "article_80_large": {
      const sqFt = input.sqFt ?? 0;
      const overage = Math.max(0, sqFt - 50000);
      const fee = 10000 + overage * 0.50;
      items.push({
        label: "Article 80 Large Project Review",
        amount: fee,
        note: sqFt > 50000
          ? `$10,000 flat + $0.50/SF over 50,000 SF (${sqFt.toLocaleString()} SF total)`
          : "$10,000 flat (under 50,000 SF)",
        timeline: "12–24 months for full Large Project Review",
      });
      break;
    }
  }

  const total = items.reduce((sum, i) => sum + i.amount, 0);
  return {
    items,
    total,
    disclaimer:
      "Estimates based on Boston ISD 2024 fee schedule. Actual fees must be confirmed with the relevant department before submission.",
  };
}

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
    case "BOSTON_ISD":
      if (permitTypeSlug === "building-permit") {
        const rate = 15;
        const fee = Math.max(100, (projectCost / 1000) * rate);
        items.push({
          label: "Building Permit Fee",
          amount: fee,
          note: `$${rate} per $1,000 of construction cost (min $100)`,
          timeline: projectType === "residential" ? "4–8 weeks" : "8–12 weeks",
        });
      } else if (permitTypeSlug === "demolition-permit") {
        const fee = Math.max(50, projectCost * 0.0001); // rough SF estimate
        items.push({
          label: "Demolition Permit Fee",
          amount: fee,
          note: "$0.10 per SF (min $50) — enter SF as project cost for accurate estimate",
          timeline: "2–4 weeks; Article 85 may add 30–90 days",
        });
        items.push({
          label: "Fire Prevention Permit",
          amount: 150,
          note: "Estimated — separate Boston Fire Prevention permit required",
          timeline: "1–2 weeks",
        });
      } else if (permitTypeSlug === "trade-permit") {
        const fee = Math.max(50, (projectCost / 1000) * 12);
        items.push({
          label: "Trade / Alteration Permit Fee",
          amount: fee,
          note: "$12 per $1,000 of construction cost (min $50)",
          timeline: "2–6 weeks",
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
