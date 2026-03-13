import { db } from "@/db";
import { jurisdictionRules } from "@/db/schema";
import type { JurisdictionRule } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── WESTWOOD, MA — Building Department ──────────────────────────────────────
// Building Department: 580 High Street, Westwood MA 02090 | (781) 320-1015
// Portal: https://www.townofwestwood.com/building
// Norfolk County | Small residential-dominated community

const westwoodBuildingRules: JurisdictionRule[] = [
  // Building permit requirements
  {
    id: "westwood-bld-001",
    requirementType: "building_permit_application",
    description: "Submit building permit application to Westwood Building Department at 580 High St or via online portal",
    requiredDocuments: ["permit_application", "deed"],
    typicalTimelineDays: 10,
    isRequired: true,
    notes: "Westwood Building Dept accepts online applications and in-person at Town Hall. Over-the-counter permits available for minor work. Full plan review required for new construction and additions. Fee: $12 per $1,000 construction cost (min $50).",
  },
  {
    id: "westwood-bld-002",
    requirementType: "architectural_drawings",
    description: "Architectural plans stamped by Massachusetts-licensed architect",
    requiredDocuments: ["architectural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, and projects over $10,000. Plans must show floor plans, elevations, sections, and compliance with Westwood Zoning Bylaw dimensional requirements.",
  },
  {
    id: "westwood-bld-003",
    requirementType: "structural_drawings",
    description: "Structural engineering drawings stamped by Massachusetts-licensed PE",
    requiredDocuments: ["structural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, and structural modifications. Westwood has many older homes with unreinforced foundations — engineer review may flag need for underpinning.",
  },
  {
    id: "westwood-bld-004",
    requirementType: "site_plan",
    description: "Certified site plan showing lot dimensions, setbacks, building footprint, driveways, and utilities",
    requiredDocuments: ["site_plan", "survey"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Prepared by licensed MA land surveyor. Show all Westwood Zoning Bylaw setbacks (typically front 30 ft, side 15 ft, rear 20 ft in residential districts). Include lot coverage calculation.",
  },
  {
    id: "westwood-bld-005",
    requirementType: "zoning_compliance_review",
    description: "Zoning compliance review by Westwood Building Inspector per Westwood Zoning Bylaw",
    requiredDocuments: ["zoning_compliance_letter"],
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "Building Inspector reviews setbacks, FAR, lot coverage, height, and parking. Westwood is predominantly R-A (Residential A) single-family zone. Zoning Bylaw available at townofwestwood.com.",
  },
  {
    id: "westwood-bld-006",
    requirementType: "contractor_documentation",
    description: "Licensed contractor documentation: MA CSL license, HIC registration, workers comp, and liability insurance",
    requiredDocuments: ["contractor_license", "workers_comp", "liability_insurance"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "CSL required for structural work. HIC registration required for residential home improvement contracts. Workers comp Certificate of Insurance naming Town of Westwood required.",
  },
  {
    id: "westwood-bld-007",
    requirementType: "energy_code_compliance",
    description: "Massachusetts Energy Code compliance — Westwood has adopted MA Stretch Energy Code",
    requiredDocuments: ["energy_compliance_report", "rescheck_or_comcheck"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Westwood adopted MA Stretch Energy Code. REScheck for residential, COMcheck for commercial. Blower door test ≤3.0 ACH50 for new residential construction.",
  },
  {
    id: "westwood-bld-008",
    requirementType: "construction_cost_estimate",
    description: "Itemized construction cost estimate for permit fee calculation",
    requiredDocuments: ["cost_estimate"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Permit fee is $12 per $1,000 construction cost, minimum $50. Westwood DPW requires separate street opening permit for utility connections.",
  },
  {
    id: "westwood-bld-009",
    requirementType: "dig_safe_reference",
    description: "Dig Safe reference number (digsafe.com or 811) for any excavation or ground disturbance",
    requiredDocuments: ["dig_safe_reference"],
    typicalTimelineDays: 3,
    isRequired: true,
    notes: "Required by MA law before any ground disturbance. Expires 30 days after call. Note number on permit application.",
  },
  {
    id: "westwood-bld-010",
    requirementType: "mep_sub_permits",
    description: "Separate electrical, plumbing, and gas/mechanical sub-permits filed with Westwood Building Department",
    requiredDocuments: ["electrical_permit_application", "plumbing_permit_application"],
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "Trade permits filed separately. Electrical by MA-licensed electrician (527 CMR), plumbing by MA-licensed plumber (248 CMR). Inspections by Westwood-appointed wire inspector and plumbing inspector.",
  },
];

// ─── WESTWOOD — Inspection Sequence ──────────────────────────────────────────

const westwoodInspectionRules: JurisdictionRule[] = [
  {
    id: "westwood-insp-001",
    requirementType: "foundation_inspection",
    description: "Foundation inspection by Westwood Building Inspector before concrete pour",
    inspectionSequence: 1,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Schedule 48 hours in advance by calling Westwood Building Dept (781) 320-1015. Inspector must approve before concrete placement. Footings must bear on suitable soil.",
  },
  {
    id: "westwood-insp-002",
    requirementType: "framing_inspection",
    description: "Rough framing inspection before insulation or drywall",
    inspectionSequence: 2,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "All structural framing complete and exposed. Fire blocking, draft stopping, and joist hangers must be visible. Strapping per 780 CMR wind requirements.",
  },
  {
    id: "westwood-insp-003",
    requirementType: "rough_mep_inspection",
    description: "Rough MEP inspections (electrical, plumbing, mechanical) before insulation",
    inspectionSequence: 3,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Separate inspections: electrical by wire inspector, plumbing by plumbing inspector, mechanical by building inspector. All must pass before insulation proceeds.",
  },
  {
    id: "westwood-insp-004",
    requirementType: "insulation_inspection",
    description: "Insulation inspection per MA Stretch Energy Code",
    inspectionSequence: 4,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Verify insulation R-values per Stretch Code. Air sealing inspection may be combined. Blower door test required for new construction.",
  },
  {
    id: "westwood-insp-005",
    requirementType: "final_inspection_and_co",
    description: "Final building inspection and Certificate of Occupancy from Westwood Building Department",
    inspectionSequence: 5,
    typicalTimelineDays: 3,
    isRequired: true,
    notes: "All trade final inspections must be approved first. CO required before occupancy. Building must conform to approved stamped plans.",
  },
];

// ─── WESTWOOD — ZBA Variance Workflow ─────────────────────────────────────────

const westwoodZbaRules: JurisdictionRule[] = [
  {
    id: "westwood-zba-001",
    requirementType: "zba_variance_application",
    description: "ZBA variance application for dimensional relief filed with Westwood Town Clerk",
    requiredDocuments: [
      "zba_application",
      "site_plan",
      "architectural_drawings",
      "deed",
      "abutters_list",
      "hardship_statement",
    ],
    typicalTimelineDays: 75,
    isRequired: true,
    notes: "File with Westwood Town Clerk (580 High St). ZBA meets as-needed, typically monthly. Hearings scheduled ~4–6 weeks after complete application. Filing fee: ~$150–200. Westwood ZBA is conservative — strong hardship showing required under MGL c.40A §10.",
  },
  {
    id: "westwood-zba-002",
    requirementType: "abutters_notification",
    description: "Certified mail notification to abutters within 300 feet at least 14 days before ZBA hearing",
    requiredDocuments: ["abutters_list", "certified_mail_receipts"],
    typicalTimelineDays: 21,
    isRequired: true,
    notes: "Obtain abutters list from Westwood Assessors Office. Mail by certified mail. Bring receipts to hearing. As a smaller town, abutter turnout at ZBA hearings tends to be high.",
  },
  {
    id: "westwood-zba-003",
    requirementType: "legal_notice_publication",
    description: "Legal notice publication in Norwood Transcript or Dedham Transcript at least 14 days before hearing",
    requiredDocuments: ["legal_notice_proof"],
    typicalTimelineDays: 14,
    isRequired: true,
    notes: "Town Clerk arranges legal notice publication per MGL c.40A §11. Confirm which newspaper with Westwood Town Clerk.",
  },
  {
    id: "westwood-zba-004",
    requirementType: "special_permit_application",
    description: "ZBA Special Permit for accessory dwelling units, home occupations, or other uses requiring special permit per Westwood Zoning Bylaw",
    requiredDocuments: [
      "special_permit_application",
      "site_plan",
      "floor_plans",
      "use_description",
    ],
    typicalTimelineDays: 75,
    isRequired: false,
    notes: "Westwood Zoning Bylaw allows accessory apartments by special permit in residential zones. ADU provisions may apply. Contact Building Dept for current regulations.",
  },
];

// ─── WESTWOOD — Planning Board ────────────────────────────────────────────────

const westwoodPlanningRules: JurisdictionRule[] = [
  {
    id: "westwood-planning-001",
    requirementType: "site_plan_review",
    description: "Westwood Planning Board site plan review for commercial and multi-family projects",
    requiredDocuments: [
      "site_plan_review_application",
      "site_plan",
      "architectural_drawings",
      "traffic_study",
      "stormwater_report",
      "landscape_plan",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Required for commercial development, multi-family, and certain accessory structures per Westwood Zoning Bylaw. Planning Board meets monthly. Decision within 65 days of receipt per MGL c.40A §9. Coordinate with Conservation Commission if near wetlands.",
  },
  {
    id: "westwood-planning-002",
    requirementType: "subdivision_approval",
    description: "Westwood Planning Board subdivision approval (Definitive Plan) or ANR endorsement",
    requiredDocuments: ["definitive_plan", "survey", "utility_plans", "traffic_study"],
    typicalTimelineDays: 180,
    isRequired: false,
    notes: "Required for any division of land creating new lots. ANR (Approval Not Required) for divisions not requiring new streets. Definitive Plan process for subdivisions with new streets. Planning Board meets monthly.",
  },
];

// ─── WESTWOOD — Conservation Commission ──────────────────────────────────────

const westwoodConComRules: JurisdictionRule[] = [
  {
    id: "westwood-concom-001",
    requirementType: "notice_of_intent_wetlands",
    description: "Notice of Intent (NOI) to Westwood Conservation Commission per MA Wetlands Protection Act",
    requiredDocuments: [
      "notice_of_intent",
      "wetland_delineation",
      "site_plan",
      "stormwater_report",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Required for work within 100-foot buffer zone of wetland resource areas. File with Westwood Conservation Commission AND via MA DEP eDEP. Westwood has significant wetland areas in eastern and western portions of town. Conservation Commission meets bi-weekly.",
  },
  {
    id: "westwood-concom-002",
    requirementType: "request_for_determination",
    description: "Request for Determination of Applicability (RDA) to Westwood Conservation Commission",
    requiredDocuments: ["rda_application", "site_plan"],
    typicalTimelineDays: 21,
    isRequired: false,
    notes: "File if uncertain whether project is within wetland jurisdiction. Less expensive than NOI. Conservation Commission issues Determination of Applicability at public meeting within 21 days.",
  },
];

// ─── Seed function ─────────────────────────────────────────────────────────────

export async function seedWestwoodRules() {
  const seeds = [
    {
      jurisdictionCode: "WESTWOOD_MA",
      jurisdictionName: "Westwood, MA — Building Department",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: [
        ...westwoodBuildingRules,
        ...westwoodInspectionRules,
        ...westwoodZbaRules,
        ...westwoodPlanningRules,
        ...westwoodConComRules,
      ],
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
