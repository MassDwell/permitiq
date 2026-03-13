import { db } from "@/db";
import { jurisdictionRules } from "@/db/schema";
import type { JurisdictionRule } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── WALTHAM ISD — Inspectional Services Department ──────────────────────────

const walthamIsdRules: JurisdictionRule[] = [
  // Building permit requirements
  {
    id: "waltham-isd-building-001",
    requirementType: "isd_portal_application",
    description: "Submit building permit application to Waltham ISD at City Hall, 610 Main St (city.waltham.ma.us/inspectional-services-department)",
    requiredDocuments: ["permit_application"],
    typicalTimelineDays: 14,
    isRequired: true,
    notes: "Waltham ISD accepts in-person applications at City Hall and online submissions. Minor residential work may qualify for expedited over-the-counter review. Full plan review for commercial and new construction: 3–4 weeks residential, 6–8 weeks commercial. Phone: 781-314-3370.",
    feeStructure: "$10 per $1,000 of construction cost (min $50) residential; $12 per $1,000 commercial",
  },
  {
    id: "waltham-isd-building-002",
    requirementType: "architectural_drawings",
    description: "Architectural plans stamped by Massachusetts-licensed architect",
    requiredDocuments: ["architectural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions >200 SF, and change of use. Waltham ISD requires 2 full sets of stamped drawings. Digital PDF submission accepted. Drawings must note compliance with 780 CMR and energy code.",
  },
  {
    id: "waltham-isd-building-003",
    requirementType: "structural_drawings",
    description: "Structural engineering drawings stamped by Massachusetts-licensed PE",
    requiredDocuments: ["structural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, and structural modifications. Waltham has varied subsurface conditions including bedrock outcrops and glacial till — geotechnical investigation often required for larger projects.",
  },
  {
    id: "waltham-isd-building-004",
    requirementType: "mep_drawings",
    description: "MEP drawings (Mechanical, Electrical, Plumbing) each stamped by licensed engineers",
    requiredDocuments: ["mep_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Separate sub-permits for electrical (Waltham Wiring Inspector), plumbing, and gas. All filed through Waltham ISD. Trade contractor licenses must be current MA OCABR licenses.",
  },
  {
    id: "waltham-isd-building-005",
    requirementType: "site_plan_and_survey",
    description: "Certified site plan showing lot dimensions, setbacks, building footprint, and parking",
    requiredDocuments: ["site_plan", "survey"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Must be prepared by a MA licensed land surveyor. Show compliance with Waltham Zoning Ordinance dimensional requirements including setbacks, FAR, lot coverage, and parking ratios. Check Middlesex County Registry of Deeds.",
  },
  {
    id: "waltham-isd-building-006",
    requirementType: "deed_and_title",
    description: "Recorded deed showing current ownership of the property",
    requiredDocuments: ["deed"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Must match current Middlesex County (South) Registry of Deeds records. masslandrecords.com.",
  },
  {
    id: "waltham-isd-building-007",
    requirementType: "zoning_compliance_review",
    description: "Zoning compliance review against Waltham Zoning Ordinance by ISD Zoning Division",
    requiredDocuments: ["zoning_compliance_letter"],
    typicalTimelineDays: 10,
    isRequired: true,
    notes: "Waltham's Zoning Ordinance governs height, FAR, setbacks, lot coverage, and parking. The Route 128/I-95 corridor has Business and Industrial Park overlay zones with specific development standards. Verify zoning via Waltham GIS at city.waltham.ma.us/gis.",
  },
  {
    id: "waltham-isd-building-008",
    requirementType: "contractor_documentation",
    description: "Licensed contractor documentation: MA CSL, workers comp, liability insurance, HIC registration",
    requiredDocuments: ["contractor_license", "workers_comp", "liability_insurance"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "All GCs must hold MA Construction Supervisor License (CSL). HIC (Home Improvement Contractor) required for residential work. Workers compensation COI required by Waltham ISD before permit issuance.",
  },
  {
    id: "waltham-isd-building-009",
    requirementType: "construction_cost_estimate",
    description: "Itemized construction cost estimate for permit fee calculation",
    requiredDocuments: ["cost_estimate"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Waltham ISD fee: $10 per $1,000 of construction cost for residential (min $50); $12 per $1,000 for commercial.",
    feeStructure: "$10/$1,000 residential (min $50); $12/$1,000 commercial",
  },
  {
    id: "waltham-isd-building-010",
    requirementType: "traffic_impact_review",
    description: "Traffic impact review for commercial projects generating >25 peak-hour vehicle trips",
    requiredDocuments: ["traffic_impact_study", "site_plan"],
    typicalTimelineDays: 30,
    isRequired: false,
    notes: "Waltham, given its Route 128 corridor development activity, requires traffic impact review for commercial projects exceeding traffic thresholds. Contact Waltham DPW Traffic Engineering, 781-314-3410. CTPS (Central Transportation Planning Staff) methodology required.",
  },
  // Inspection sequence
  {
    id: "waltham-isd-insp-001",
    requirementType: "foundation_inspection",
    description: "Foundation inspection by Waltham ISD inspector before concrete pour",
    inspectionSequence: 1,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Schedule 48 hours in advance by calling Waltham ISD at 781-314-3370. Inspector must sign off before concrete placement.",
  },
  {
    id: "waltham-isd-insp-002",
    requirementType: "framing_inspection",
    description: "Rough framing inspection by Waltham ISD before insulation or drywall",
    inspectionSequence: 2,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "All structural framing must be complete and exposed. Schedule via Waltham ISD phone or online portal.",
  },
  {
    id: "waltham-isd-insp-003",
    requirementType: "rough_mep_inspection",
    description: "Rough MEP inspections (mechanical, electrical, plumbing) before insulation",
    inspectionSequence: 3,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Separate inspections by Waltham Wiring Inspector, Plumbing Inspector, and Gas Inspector. All must be approved before insulation proceeds.",
  },
  {
    id: "waltham-isd-insp-004",
    requirementType: "insulation_inspection",
    description: "Insulation inspection per MA Energy Code — Waltham has adopted MA Stretch Energy Code",
    inspectionSequence: 4,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Waltham adopted MA Stretch Energy Code. Blower door test ≤3.0 ACH50 for new residential. COMCHECK for commercial buildings. Energy compliance documentation required at inspection.",
  },
  {
    id: "waltham-isd-insp-005",
    requirementType: "final_inspection_and_co",
    description: "Final building inspection and Certificate of Occupancy (CO) from Waltham ISD",
    inspectionSequence: 5,
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "All sub-trade finals must be approved before building final. CO required before occupancy. Waltham ISD Building Commissioner issues CO.",
  },
];

// ─── WALTHAM ZBA — Zoning Board of Appeals ───────────────────────────────────

const walthamZbaRules: JurisdictionRule[] = [
  {
    id: "waltham-zba-variance-001",
    requirementType: "zba_variance_application",
    description: "Waltham ZBA variance application for dimensional relief under Waltham Zoning Ordinance",
    requiredDocuments: [
      "zba_application",
      "site_plan",
      "architectural_drawings",
      "deed",
      "survey",
      "abutters_list",
      "hardship_statement",
    ],
    typicalTimelineDays: 90,
    isRequired: true,
    notes: "Waltham ZBA meets monthly at City Hall, 610 Main St. File application with Waltham ISD. Hearing scheduled ~6 weeks after filing. Must demonstrate specific hardship under Waltham Zoning Ordinance §9. $250 filing fee. Decisions posted on city.waltham.ma.us.",
    feeStructure: "ZBA filing fee: $250 (residential) / $500 (commercial)",
  },
  {
    id: "waltham-zba-variance-002",
    requirementType: "abutters_notification_certified_mail",
    description: "Certified mail notification to all abutters within 300 feet of the parcel",
    requiredDocuments: ["abutters_list", "certified_mail_receipts"],
    typicalTimelineDays: 21,
    isRequired: true,
    notes: "Waltham requires 300-foot abutter notification. Obtain abutters list from Waltham Assessor's Office (781-314-3340). Mail at least 14 days before hearing. Bring certified mail receipts to hearing.",
  },
  {
    id: "waltham-zba-variance-003",
    requirementType: "ward_councilor_notification",
    description: "Notification to Waltham Ward City Councilor for the affected ward",
    requiredDocuments: ["councilor_notification_letter"],
    typicalTimelineDays: 14,
    isRequired: false,
    notes: "Recommended practice. Waltham ZBA considers input from Ward City Councilors. Waltham has 8 wards. Contact via city.waltham.ma.us/city-council.",
  },
  {
    id: "waltham-zba-special-permit-001",
    requirementType: "special_permit_application",
    description: "Waltham ZBA special permit for uses requiring authorization (e.g., multi-family in certain zones, auto uses, R&D facilities)",
    requiredDocuments: [
      "special_permit_application",
      "site_plan",
      "use_description",
      "parking_analysis",
      "traffic_impact_analysis",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Required for certain uses in Waltham's Business, Industrial, and Office Park districts including R&D, biotech labs, drive-throughs, and multi-family projects. Route 128 corridor projects may require traffic review as part of special permit. Review Waltham Zoning Ordinance use tables.",
    feeStructure: "Special permit fee: $300–$2,000 depending on project scale",
  },
  {
    id: "waltham-zba-appeal-001",
    requirementType: "zba_appeal_of_isd_decision",
    description: "Appeal of Waltham ISD building permit denial or zoning determination to ZBA",
    requiredDocuments: ["appeal_application", "isd_denial_letter", "site_plan"],
    typicalTimelineDays: 60,
    isRequired: false,
    notes: "Must be filed within 30 days of ISD decision. $150 appeal filing fee.",
    feeStructure: "Appeal filing fee: $150",
  },
];

// ─── WALTHAM — Route 128 Corridor, Conservation & Special Reviews ──────────────

const walthamSpecialReviewRules: JurisdictionRule[] = [
  {
    id: "waltham-rt128-overlay-001",
    requirementType: "route_128_corridor_overlay_review",
    description: "Route 128 / I-95 Corridor Overlay District — enhanced review for office, R&D, and biotech development",
    requiredDocuments: [
      "site_plan",
      "architectural_drawings",
      "traffic_impact_study",
      "utilities_plan",
      "landscaping_plan",
    ],
    typicalTimelineDays: 60,
    isRequired: false,
    notes: "Waltham's Route 128 corridor is one of the highest-value commercial/R&D zones in Massachusetts. Office and R&D projects along the 128 corridor are subject to enhanced Waltham Planning Board review. Standards emphasize campus-style landscaping, traffic management, and utility capacity. Contact Waltham Planning Dept, 781-314-3396.",
  },
  {
    id: "waltham-conservation-noi-001",
    requirementType: "conservation_commission_notice_of_intent",
    description: "Notice of Intent (NOI) to Waltham Conservation Commission under MA Wetlands Protection Act",
    requiredDocuments: [
      "notice_of_intent",
      "wetland_delineation",
      "site_plan",
      "resource_area_map",
      "stormwater_management_report",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Waltham has significant wetland resource areas along the Charles River, Beaver Brook, and Stony Brook reservoirs. File NOI for any work within 100-foot wetland buffer zone. Waltham Conservation Commission: 781-314-3396. File via MA DEP eDEP system. Waltham has a local wetland bylaw with additional protections.",
  },
  {
    id: "waltham-planning-board-site-plan-001",
    requirementType: "planning_board_site_plan_review",
    description: "Waltham Planning Board site plan review for commercial projects >5,000 SF or new multi-family",
    requiredDocuments: [
      "site_plan_application",
      "site_plan",
      "architectural_drawings",
      "drainage_report",
      "landscaping_plan",
      "utility_plans",
    ],
    typicalTimelineDays: 60,
    isRequired: false,
    notes: "Waltham Planning Board reviews site plans for: commercial or industrial projects >5,000 SF GFA, new multi-family residential, and any project requiring a special permit. Planning Board meets monthly. Filing fee: $500–$3,000. Contact Waltham Planning Dept, 610 Main St, 781-314-3396.",
    feeStructure: "Site plan review fee: $500–$3,000 based on project scale",
  },
  {
    id: "waltham-historical-commission-001",
    requirementType: "waltham_historical_commission_review",
    description: "Waltham Historical Commission (WHC) review for demolition or significant alteration of historically significant structures",
    requiredDocuments: ["demolition_application", "historical_assessment", "photos"],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Waltham's Demolition Delay Bylaw imposes up to a 12-month delay on demolition of structures >50 years old that are determined historically significant. WHC reviews all demolition permit applications for historic resources. Waltham has historic mill districts and colonial-era structures. Contact Waltham Historical Commission via city.waltham.ma.us.",
  },
  {
    id: "waltham-affordable-housing-001",
    requirementType: "waltham_inclusionary_zoning",
    description: "Waltham Inclusionary Zoning — 15% affordable units required for projects with 12+ units",
    requiredDocuments: ["inclusionary_housing_plan", "affordability_restriction"],
    typicalTimelineDays: 30,
    isRequired: true,
    notes: "Waltham requires 15% of units be income-restricted affordable for residential projects with 12 or more units. Units at ≤80% AMI. Fee in lieu option available. Affordability restriction recorded at Middlesex County Registry of Deeds. Administered by Waltham Planning Dept.",
  },
];

// ─── Seed function ─────────────────────────────────────────────────────────────

export async function seedWalthamRules() {
  const seeds = [
    {
      jurisdictionCode: "WALTHAM_ISD",
      jurisdictionName: "Waltham Inspectional Services Dept (ISD)",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: walthamIsdRules,
    },
    {
      jurisdictionCode: "WALTHAM_ZBA",
      jurisdictionName: "Waltham Zoning Board of Appeals (ZBA)",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: walthamZbaRules,
    },
    {
      jurisdictionCode: "WALTHAM_PLANNING",
      jurisdictionName: "Waltham Planning Board & Conservation Commission",
      projectTypes: ["residential", "commercial", "mixed_use"],
      rules: walthamSpecialReviewRules,
    },
  ] as const;

  let seededCount = 0;

  for (const seed of seeds) {
    const existing = await db.query.jurisdictionRules.findFirst({
      where: eq(jurisdictionRules.jurisdictionCode, seed.jurisdictionCode),
    });

    if (existing) {
      await db
        .update(jurisdictionRules)
        .set({
          jurisdictionName: seed.jurisdictionName,
          projectTypes: [...seed.projectTypes],
          rules: [...seed.rules],
          updatedAt: new Date(),
        })
        .where(eq(jurisdictionRules.jurisdictionCode, seed.jurisdictionCode));
    } else {
      await db.insert(jurisdictionRules).values({
        jurisdictionCode: seed.jurisdictionCode,
        jurisdictionName: seed.jurisdictionName,
        projectTypes: [...seed.projectTypes],
        rules: [...seed.rules],
      });
    }
    seededCount++;
  }

  return { seededCount, jurisdictions: seeds.map((s) => s.jurisdictionCode) };
}
