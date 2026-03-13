import { NextRequest } from "next/server";
import { authenticateApiKey, apiResponse, apiError } from "@/lib/api-auth";
import { AHJ_DATA } from "@/lib/ahj-data";
import {
  BOSTON_BUILDING_REQUIREMENTS,
  BOSTON_DEMOLITION_REQUIREMENTS,
  BOSTON_TRADE_REQUIREMENTS,
  CAMBRIDGE_BUILDING_REQUIREMENTS,
  BROOKLINE_BUILDING_REQUIREMENTS,
  SALEM_BUILDING_REQUIREMENTS,
  LOWELL_BUILDING_REQUIREMENTS,
  MA_STATE_REQUIREMENTS,
  BOSTON_ARTICLE_80_LARGE_REQUIREMENTS,
  BOSTON_ARTICLE_80_SMALL_REQUIREMENTS,
  type RequirementData,
} from "@/lib/permit-requirements";

const SUPPORTED_JURISDICTIONS = [
  "boston",
  "cambridge",
  "brookline",
  "salem",
  "lowell",
] as const;

type SupportedJurisdiction = (typeof SUPPORTED_JURISDICTIONS)[number];

interface JurisdictionRulesResponse {
  jurisdiction: string;
  displayName: string;
  contact?: {
    name: string;
    portal?: string;
    phone?: string;
    email?: string;
    address?: string;
    hours?: string;
  };
  permitTypes: {
    type: string;
    label: string;
    requirements: Array<{
      id: string;
      description: string;
      sourceUrl: string;
      sourceText: string;
      reasoning: string;
    }>;
  }[];
}

function getJurisdictionData(jurisdiction: SupportedJurisdiction): JurisdictionRulesResponse {
  const ahjKey = jurisdiction === "boston" ? "boston" : jurisdiction;
  const ahj = AHJ_DATA[ahjKey];

  const contact = ahj
    ? {
        name: ahj.name,
        portal: ahj.portal,
        phone: ahj.phone,
        email: ahj.email,
        address: ahj.address,
        hours: ahj.hours,
      }
    : undefined;

  const mapRequirements = (reqs: RequirementData[]) =>
    reqs.map((r) => ({
      id: r.requirementType,
      description: r.description,
      sourceUrl: r.sourceUrl,
      sourceText: r.sourceText,
      reasoning: r.reasoning,
    }));

  switch (jurisdiction) {
    case "boston":
      return {
        jurisdiction: "boston",
        displayName: "Boston, MA",
        contact,
        permitTypes: [
          {
            type: "building",
            label: "Building Permit",
            requirements: mapRequirements(BOSTON_BUILDING_REQUIREMENTS),
          },
          {
            type: "demolition",
            label: "Demolition Permit",
            requirements: mapRequirements(BOSTON_DEMOLITION_REQUIREMENTS),
          },
          {
            type: "trade",
            label: "Trade Permits (Electrical, Plumbing, Gas, HVAC)",
            requirements: mapRequirements(BOSTON_TRADE_REQUIREMENTS),
          },
          {
            type: "article_80_small",
            label: "Article 80 Small Project Review (SPR)",
            requirements: mapRequirements(BOSTON_ARTICLE_80_SMALL_REQUIREMENTS),
          },
          {
            type: "article_80_large",
            label: "Article 80 Large Project Review (LPR)",
            requirements: mapRequirements(BOSTON_ARTICLE_80_LARGE_REQUIREMENTS),
          },
        ],
      };

    case "cambridge":
      return {
        jurisdiction: "cambridge",
        displayName: "Cambridge, MA",
        contact,
        permitTypes: [
          {
            type: "building",
            label: "Building Permit",
            requirements: mapRequirements(CAMBRIDGE_BUILDING_REQUIREMENTS),
          },
        ],
      };

    case "brookline":
      return {
        jurisdiction: "brookline",
        displayName: "Brookline, MA",
        contact,
        permitTypes: [
          {
            type: "building",
            label: "Building Permit",
            requirements: mapRequirements(BROOKLINE_BUILDING_REQUIREMENTS),
          },
        ],
      };

    case "salem":
      return {
        jurisdiction: "salem",
        displayName: "Salem, MA",
        contact,
        permitTypes: [
          {
            type: "building",
            label: "Building Permit",
            requirements: mapRequirements(SALEM_BUILDING_REQUIREMENTS),
          },
        ],
      };

    case "lowell":
      return {
        jurisdiction: "lowell",
        displayName: "Lowell, MA",
        contact,
        permitTypes: [
          {
            type: "building",
            label: "Building Permit",
            requirements: mapRequirements(LOWELL_BUILDING_REQUIREMENTS),
          },
        ],
      };

    default:
      // Fallback to MA state requirements
      return {
        jurisdiction: jurisdiction,
        displayName: "Massachusetts (Statewide)",
        permitTypes: [
          {
            type: "general",
            label: "General Building Requirements",
            requirements: mapRequirements(MA_STATE_REQUIREMENTS),
          },
        ],
      };
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jurisdiction: string }> }
) {
  const auth = await authenticateApiKey(req);
  if (!auth.success) {
    return auth.response;
  }

  const { jurisdiction } = await params;
  const normalizedJurisdiction = jurisdiction.toLowerCase();

  if (!SUPPORTED_JURISDICTIONS.includes(normalizedJurisdiction as SupportedJurisdiction)) {
    return apiError(
      `Unsupported jurisdiction. Supported: ${SUPPORTED_JURISDICTIONS.join(", ")}`,
      "UNSUPPORTED_JURISDICTION",
      400
    );
  }

  const data = getJurisdictionData(normalizedJurisdiction as SupportedJurisdiction);
  return apiResponse(data);
}
