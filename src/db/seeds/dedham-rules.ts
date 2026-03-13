import { db } from "@/db";
import { jurisdictionRules } from "@/db/schema";
import type { JurisdictionRule } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── DEDHAM, MA — Building Department ────────────────────────────────────────
// Building Department: 26 Bryant St, Dedham MA 02026 | (781) 751-9131
// Portal: https://www.dedham-ma.gov/departments/building_department
// Norfolk County Registry of Deeds for recorded instruments

const dedhamBuildingRules: JurisdictionRule[] = [
  // Building permit requirements
  {
    id: "dedham-bld-001",
    requirementType: "building_permit_application",
    description: "Submit building permit application to Dedham Building Department (26 Bryant St) or via eTRAKiT online portal",
    requiredDocuments: ["permit_application", "deed"],
    typicalTimelineDays: 10,
    isRequired: true,
    notes: "Dedham uses eTRAKiT for online permit applications. Short-form permits for minor work may be over-the-counter. New construction and additions require full plan review. Fee: $12 per $1,000 of construction cost (min $50).",
  },
  {
    id: "dedham-bld-002",
    requirementType: "architectural_drawings",
    description: "Architectural plans stamped by Massachusetts-licensed architect",
    requiredDocuments: ["architectural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, and projects over $10,000. Must show floor plans, elevations, and sections per 780 CMR.",
  },
  {
    id: "dedham-bld-003",
    requirementType: "structural_drawings",
    description: "Structural engineering drawings stamped by Massachusetts-licensed PE",
    requiredDocuments: ["structural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, and structural modifications. Foundation design per 780 CMR Chapter 18.",
  },
  {
    id: "dedham-bld-004",
    requirementType: "site_plan",
    description: "Certified site plan showing lot dimensions, setbacks, building footprint, and existing/proposed conditions",
    requiredDocuments: ["site_plan", "survey"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Must be prepared by a licensed MA land surveyor. Show all setbacks from Dedham Zoning Bylaw requirements. Available at dedham-ma.gov/departments/planning.",
  },
  {
    id: "dedham-bld-005",
    requirementType: "zoning_compliance_review",
    description: "Zoning compliance review by Dedham Building Inspector confirming compliance with Dedham Zoning Bylaw",
    requiredDocuments: ["zoning_compliance_letter"],
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "Building Inspector reviews for setbacks, lot coverage, height limits, and parking requirements per Dedham Zoning Bylaw. Dimensional table required for additions.",
  },
  {
    id: "dedham-bld-006",
    requirementType: "contractor_documentation",
    description: "Licensed contractor documentation: MA CSL/HIC license, workers comp, and liability insurance",
    requiredDocuments: ["contractor_license", "workers_comp", "liability_insurance"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "All GCs must hold MA Construction Supervisor License (CSL). HIC registration required for residential work. Workers comp Certificate of Insurance naming Town of Dedham required.",
  },
  {
    id: "dedham-bld-007",
    requirementType: "energy_code_compliance",
    description: "Massachusetts Energy Code compliance documentation (Stretch Energy Code for Dedham)",
    requiredDocuments: ["energy_compliance_report", "rescheck_or_comcheck"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Dedham has adopted the MA Stretch Energy Code. REScheck required for residential; COMcheck for commercial. Blower door test required for new residential (≤3.0 ACH50).",
  },
  {
    id: "dedham-bld-008",
    requirementType: "construction_cost_estimate",
    description: "Itemized construction cost estimate for permit fee calculation",
    requiredDocuments: ["cost_estimate"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Dedham Building Dept permit fee is $12 per $1,000 of construction cost, minimum $50. Must be accurate.",
  },
  {
    id: "dedham-bld-009",
    requirementType: "dig_safe_reference",
    description: "Dig Safe reference number (digsafe.com or call 811) before any excavation",
    requiredDocuments: ["dig_safe_reference"],
    typicalTimelineDays: 3,
    isRequired: true,
    notes: "MA law requires Dig Safe clearance before ground disturbance. Reference number expires 30 days from call. Required on permit application.",
  },
  {
    id: "dedham-bld-010",
    requirementType: "mep_sub_permits",
    description: "Separate electrical, plumbing, and gas/mechanical sub-permits filed by licensed tradespeople",
    requiredDocuments: ["electrical_permit_application", "plumbing_permit_application"],
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "Each trade permit is filed separately with Dedham Building Dept. Licensed electrician (MA 527 CMR), licensed plumber (MA 248 CMR), and licensed gas fitter required.",
  },
];

// ─── DEDHAM — Inspection Sequence ─────────────────────────────────────────────

const dedhamInspectionRules: JurisdictionRule[] = [
  {
    id: "dedham-insp-001",
    requirementType: "foundation_inspection",
    description: "Foundation inspection by Dedham Building Inspector before concrete pour",
    inspectionSequence: 1,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Schedule 48 hours in advance by calling (781) 751-9131. Inspector must sign off before any concrete is placed. Footings must be on undisturbed soil or engineered fill.",
  },
  {
    id: "dedham-insp-002",
    requirementType: "framing_inspection",
    description: "Rough framing inspection before any insulation or drywall installation",
    inspectionSequence: 2,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "All structural framing must be complete and exposed. Fire blocking must be visible. Schedule via Dedham Building Dept.",
  },
  {
    id: "dedham-insp-003",
    requirementType: "rough_mep_inspection",
    description: "Rough MEP inspections (mechanical, electrical, plumbing) before insulation or close-up",
    inspectionSequence: 3,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Separate inspections by electrical wiring inspector, plumbing inspector, and gas inspector. All must be approved before insulation may proceed.",
  },
  {
    id: "dedham-insp-004",
    requirementType: "insulation_inspection",
    description: "Insulation and energy code inspection per MA Stretch Energy Code",
    inspectionSequence: 4,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Verify insulation R-values, air barrier continuity, and blower door test result. HERS rater sign-off may be required for new residential.",
  },
  {
    id: "dedham-insp-005",
    requirementType: "final_inspection_and_co",
    description: "Final building inspection and Certificate of Occupancy (CO) from Dedham Building Dept",
    inspectionSequence: 5,
    typicalTimelineDays: 3,
    isRequired: true,
    notes: "All sub-trade finals must be approved before building final. CO required before occupancy. Building must conform to approved plans.",
  },
];

// ─── DEDHAM — ZBA Variance Workflow ───────────────────────────────────────────

const dedhamZbaRules: JurisdictionRule[] = [
  {
    id: "dedham-zba-001",
    requirementType: "zba_variance_application",
    description: "ZBA variance application for dimensional relief (setbacks, lot coverage, height, parking) filed with Dedham Town Clerk",
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
    notes: "File with Dedham Town Clerk's Office. ZBA meets monthly — typically first Tuesday. Application deadline ~4 weeks before hearing. Filing fee: ~$200. Must demonstrate hardship per MGL c.40A §10.",
  },
  {
    id: "dedham-zba-002",
    requirementType: "abutters_notification",
    description: "Certified mail notification to all abutters within 300 feet of the parcel at least 14 days before hearing",
    requiredDocuments: ["abutters_list", "certified_mail_receipts"],
    typicalTimelineDays: 21,
    isRequired: true,
    notes: "Obtain abutters list from Dedham Assessors Office (781-751-9102). Mail by certified mail at least 14 days before ZBA hearing. Bring receipts to hearing. Dedham is stricter on abutter notice than some towns.",
  },
  {
    id: "dedham-zba-003",
    requirementType: "legal_notice_publication",
    description: "Legal notice publication in Dedham Transcript newspaper at least 14 days before hearing",
    requiredDocuments: ["legal_notice_proof"],
    typicalTimelineDays: 14,
    isRequired: true,
    notes: "Town Clerk typically handles legal notice publication. Publication in Dedham Transcript required per MGL c.40A §11.",
  },
  {
    id: "dedham-zba-004",
    requirementType: "zba_special_permit",
    description: "ZBA Special Permit for uses allowed by special permit under Dedham Zoning Bylaw",
    requiredDocuments: [
      "special_permit_application",
      "site_plan",
      "use_description",
      "parking_analysis",
    ],
    typicalTimelineDays: 75,
    isRequired: false,
    notes: "Required for certain uses in residential zones (accessory apartments, home occupations above threshold, certain commercial uses). Same ZBA hearing process as variance.",
  },
  {
    id: "dedham-zba-005",
    requirementType: "planning_board_endorsement",
    description: "Planning Board endorsement for Approval Not Required (ANR) or subdivision review",
    requiredDocuments: ["anr_plan", "survey", "deed"],
    typicalTimelineDays: 21,
    isRequired: false,
    notes: "If project involves lot line changes or subdivision, file ANR plan with Dedham Planning Board. Planning Board meets monthly. ANR approval typically 21 days.",
  },
];

// ─── DEDHAM — Historic District Commission ────────────────────────────────────

const dedhamHdcRules: JurisdictionRule[] = [
  {
    id: "dedham-hdc-001",
    requirementType: "historic_district_review",
    description: "Dedham Historic District Commission (HDC) review for properties in Dedham Square or East Dedham historic districts",
    requiredDocuments: [
      "hdc_application",
      "site_plan",
      "architectural_drawings",
      "material_specifications",
      "photos_existing_conditions",
    ],
    typicalTimelineDays: 45,
    isRequired: false,
    notes: "Required for any exterior changes to properties within locally designated Dedham Square or East Dedham Historic Districts. HDC meets monthly. Certificate of Appropriateness required before Building Dept will issue permit. Contact Dedham Planning Dept for district boundaries.",
  },
  {
    id: "dedham-hdc-002",
    requirementType: "mhc_survey_review",
    description: "Massachusetts Historical Commission (MHC) review for projects near or affecting listed historic resources",
    requiredDocuments: ["mhc_submission", "historic_resource_survey"],
    typicalTimelineDays: 30,
    isRequired: false,
    notes: "Required for projects receiving state/federal funding or permits affecting MHC-listed structures. Dedham has multiple properties on MA State Register of Historic Places.",
  },
];

// ─── DEDHAM — Conservation Commission ────────────────────────────────────────

const dedhamConComRules: JurisdictionRule[] = [
  {
    id: "dedham-concom-001",
    requirementType: "notice_of_intent_wetlands",
    description: "Notice of Intent (NOI) to Dedham Conservation Commission per MA Wetlands Protection Act (310 CMR 10.00)",
    requiredDocuments: [
      "notice_of_intent",
      "wetland_delineation",
      "site_plan",
      "stormwater_report",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Required for work within 100-foot buffer zone of any wetland resource area (bordering vegetated wetland, bank, land subject to flooding, vernal pool). File with Dedham Conservation Commission AND MA DEP eDEP system. Conservation Commission meets bi-weekly. Dedham has extensive wetland resources along Charles River corridor.",
  },
  {
    id: "dedham-concom-002",
    requirementType: "request_for_determination",
    description: "Request for Determination of Applicability (RDA) to confirm whether work is within wetland jurisdiction",
    requiredDocuments: ["rda_application", "site_plan"],
    typicalTimelineDays: 21,
    isRequired: false,
    notes: "File RDA with Dedham Conservation Commission if uncertain whether project is within 100-foot buffer zone. Less costly than full NOI. Conservation Commission issues Determination at public meeting.",
  },
];

// ─── Seed function ─────────────────────────────────────────────────────────────

export async function seedDedhamRules() {
  const seeds = [
    {
      jurisdictionCode: "DEDHAM_MA",
      jurisdictionName: "Dedham, MA — Building Department",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: [
        ...dedhamBuildingRules,
        ...dedhamInspectionRules,
        ...dedhamZbaRules,
        ...dedhamHdcRules,
        ...dedhamConComRules,
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
