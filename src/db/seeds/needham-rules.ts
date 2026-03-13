import { db } from "@/db";
import { jurisdictionRules } from "@/db/schema";
import type { JurisdictionRule } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── NEEDHAM, MA — Building Department ───────────────────────────────────────
// Building Department: 1471 Highland Ave, Needham MA 02492 | (781) 455-7550
// Portal: https://www.needhamma.gov/254/Building-Department (Viewpoint Cloud)
// Norfolk County | Suburban town, strong historic district near Great Plain Ave

const needhamBuildingRules: JurisdictionRule[] = [
  // Building permit requirements
  {
    id: "needham-bld-001",
    requirementType: "building_permit_application",
    description: "Submit building permit application via Viewpoint Cloud online portal or in-person at Needham Building Department (1471 Highland Ave)",
    requiredDocuments: ["permit_application", "deed"],
    typicalTimelineDays: 10,
    isRequired: true,
    notes: "Needham uses Viewpoint Cloud for online permit applications and tracking (needhamma.viewpointcloud.com). Over-the-counter permits for minor work. Full plan review for new construction and additions typically 2–4 weeks. Fee: $10 per $1,000 construction cost (min $35).",
  },
  {
    id: "needham-bld-002",
    requirementType: "architectural_drawings",
    description: "Architectural plans stamped by Massachusetts-licensed architect",
    requiredDocuments: ["architectural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, change of use, and projects over $10,000. Must include floor plans, elevations, sections, window/door schedules per 780 CMR.",
  },
  {
    id: "needham-bld-003",
    requirementType: "structural_drawings",
    description: "Structural engineering drawings stamped by Massachusetts-licensed PE",
    requiredDocuments: ["structural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, and structural changes. Needham has high water table in some areas — foundation waterproofing details required.",
  },
  {
    id: "needham-bld-004",
    requirementType: "site_plan",
    description: "Certified site plan showing lot dimensions, setbacks, building footprint, impervious coverage, and utilities",
    requiredDocuments: ["site_plan", "survey"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Prepared by licensed MA land surveyor. Show compliance with Needham Zoning Bylaw (e.g., R1: 50-ft front, 15-ft side, 30-ft rear). Lot coverage and impervious area calculations required.",
  },
  {
    id: "needham-bld-005",
    requirementType: "zoning_compliance_review",
    description: "Zoning compliance review by Needham Building Inspector per Needham Zoning Bylaw",
    requiredDocuments: ["zoning_compliance_letter"],
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "Inspector confirms setbacks, lot coverage, height, parking. Needham Zoning Bylaw is available at needhamma.gov. For Great Plain Ave area, check Historic District overlay requirements.",
  },
  {
    id: "needham-bld-006",
    requirementType: "contractor_documentation",
    description: "Licensed contractor documentation: MA CSL license, HIC registration, workers comp, liability insurance",
    requiredDocuments: ["contractor_license", "workers_comp", "liability_insurance"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "CSL required for all structural work. HIC registration for residential home improvement. Workers comp Certificate of Insurance naming Town of Needham required.",
  },
  {
    id: "needham-bld-007",
    requirementType: "energy_code_compliance",
    description: "MA Energy Code compliance — Needham has adopted MA Stretch Energy Code",
    requiredDocuments: ["energy_compliance_report", "rescheck_or_comcheck"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Needham adopted MA Stretch Energy Code. REScheck for residential, COMcheck for commercial. New residential: blower door ≤3.0 ACH50. Commercial: ASHRAE 90.1-2019 baseline.",
  },
  {
    id: "needham-bld-008",
    requirementType: "construction_cost_estimate",
    description: "Itemized construction cost estimate for permit fee calculation",
    requiredDocuments: ["cost_estimate"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Needham permit fee: $10 per $1,000 construction cost, minimum $35. Separate technology surcharge and state fees may apply. Confirm current fee schedule with Building Dept.",
  },
  {
    id: "needham-bld-009",
    requirementType: "dig_safe_reference",
    description: "Dig Safe reference number (digsafe.com or 811) before any excavation",
    requiredDocuments: ["dig_safe_reference"],
    typicalTimelineDays: 3,
    isRequired: true,
    notes: "MA law requires Dig Safe before ground disturbance. Reference number expires 30 days. Required on Viewpoint Cloud application.",
  },
  {
    id: "needham-bld-010",
    requirementType: "mep_sub_permits",
    description: "Separate electrical, plumbing, and gas/mechanical permits via Viewpoint Cloud",
    requiredDocuments: ["electrical_permit_application", "plumbing_permit_application"],
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "All trade permits filed through Viewpoint Cloud by licensed tradespeople. Needham has dedicated wire inspector and plumbing/gas inspector. Schedule inspections online.",
  },
];

// ─── NEEDHAM — Inspection Sequence ───────────────────────────────────────────

const needhamInspectionRules: JurisdictionRule[] = [
  {
    id: "needham-insp-001",
    requirementType: "foundation_inspection",
    description: "Foundation inspection by Needham Building Inspector before concrete pour",
    inspectionSequence: 1,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Schedule via Viewpoint Cloud or call (781) 455-7550. 48-hour advance notice required. Footings must bear on undisturbed soil. Needham soils may require geotechnical verification.",
  },
  {
    id: "needham-insp-002",
    requirementType: "framing_inspection",
    description: "Rough framing inspection before insulation or sheathing installation",
    inspectionSequence: 2,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "All structural framing complete and exposed. Fire blocking, draft stopping, and hurricane strapping must be visible. Schedule via Viewpoint Cloud.",
  },
  {
    id: "needham-insp-003",
    requirementType: "rough_mep_inspection",
    description: "Rough MEP inspections (electrical, plumbing, mechanical/gas) before insulation",
    inspectionSequence: 3,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Separate inspections by Needham wire inspector and plumbing inspector. All rough inspections must be approved before proceeding to insulation.",
  },
  {
    id: "needham-insp-004",
    requirementType: "insulation_inspection",
    description: "Insulation inspection per MA Stretch Energy Code",
    inspectionSequence: 4,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "R-values verified per Stretch Code requirements. Air sealing inspected. Blower door test required for new residential construction. Submit test results.",
  },
  {
    id: "needham-insp-005",
    requirementType: "final_inspection_and_co",
    description: "Final building inspection and Certificate of Occupancy from Needham Building Department",
    inspectionSequence: 5,
    typicalTimelineDays: 3,
    isRequired: true,
    notes: "All sub-trade finals required first. CO issued by Building Dept. No occupancy before CO. Buildings in Historic District must also have HDC final sign-off.",
  },
];

// ─── NEEDHAM — ZBA Variance Workflow ─────────────────────────────────────────

const needhamZbaRules: JurisdictionRule[] = [
  {
    id: "needham-zba-001",
    requirementType: "zba_variance_application",
    description: "ZBA variance application for dimensional relief filed with Needham Town Clerk",
    requiredDocuments: [
      "zba_application",
      "site_plan",
      "architectural_drawings",
      "deed",
      "abutters_list",
      "hardship_statement",
      "dimensional_table",
    ],
    typicalTimelineDays: 75,
    isRequired: true,
    notes: "File with Needham Town Clerk (1471 Highland Ave). ZBA meets monthly — typically second Thursday. Application due ~3 weeks before hearing. Filing fee: $200. Hardship per MGL c.40A §10. Needham ZBA is thorough; professional representation recommended.",
  },
  {
    id: "needham-zba-002",
    requirementType: "abutters_notification",
    description: "Certified mail notification to abutters within 300 feet at least 14 days before ZBA hearing",
    requiredDocuments: ["abutters_list", "certified_mail_receipts"],
    typicalTimelineDays: 21,
    isRequired: true,
    notes: "Obtain abutters list from Needham Assessors Office. Send by certified mail. Bring green card receipts to hearing. Needham is a dense suburban town — expect many abutters in residential areas.",
  },
  {
    id: "needham-zba-003",
    requirementType: "legal_notice_publication",
    description: "Legal notice in Needham Times newspaper at least 14 days before hearing",
    requiredDocuments: ["legal_notice_proof"],
    typicalTimelineDays: 14,
    isRequired: true,
    notes: "Town Clerk arranges publication in Needham Times per MGL c.40A §11. Confirm with Town Clerk office.",
  },
  {
    id: "needham-zba-004",
    requirementType: "special_permit_accessory_dwelling",
    description: "ZBA Special Permit for accessory dwelling units (ADUs) under Needham Zoning Bylaw",
    requiredDocuments: [
      "special_permit_application",
      "site_plan",
      "floor_plans",
      "parking_plan",
    ],
    typicalTimelineDays: 75,
    isRequired: false,
    notes: "Needham allows ADUs by special permit in residential zones. Must meet dimensional standards, parking, and owner-occupancy requirements. Same ZBA hearing process.",
  },
  {
    id: "needham-zba-005",
    requirementType: "planning_board_special_permit",
    description: "Planning Board Special Permit for certain uses and site plan approval under Needham Zoning Bylaw",
    requiredDocuments: [
      "planning_board_application",
      "site_plan",
      "traffic_study",
      "stormwater_report",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Planning Board Special Permit required for multi-family (3+ units), commercial >5,000 SF, and other uses specified in Needham Zoning Bylaw. Planning Board meets monthly.",
  },
];

// ─── NEEDHAM — Historic District Commission ───────────────────────────────────

const needhamHdcRules: JurisdictionRule[] = [
  {
    id: "needham-hdc-001",
    requirementType: "historic_district_review",
    description: "Needham Historic District Commission (HDC) review for properties in Great Plain Avenue and other locally designated historic districts",
    requiredDocuments: [
      "hdc_application",
      "site_plan",
      "architectural_drawings",
      "material_specifications",
      "photos_existing_conditions",
      "color_samples",
    ],
    typicalTimelineDays: 45,
    isRequired: false,
    notes: "Required for any exterior changes (additions, windows, doors, siding, roofing, fences, signage) to properties within Needham's locally designated historic districts (Great Plain Ave area and others). HDC meets monthly. Certificate of Appropriateness required before Building Dept will issue permit. Contact Needham Planning Dept (781-455-7580) to confirm district boundaries. HDC reviews for compatibility with historic character.",
  },
  {
    id: "needham-hdc-002",
    requirementType: "demolition_delay_bylaw",
    description: "Needham Demolition Delay Bylaw review for structures over 50 years old",
    requiredDocuments: [
      "demolition_permit_application",
      "historic_significance_assessment",
    ],
    typicalTimelineDays: 45,
    isRequired: false,
    notes: "Needham has a demolition delay bylaw requiring HDC review for structures 50+ years old before demolition. Up to 12-month delay if structure is determined historically significant. File with Building Dept which will refer to HDC.",
  },
];

// ─── NEEDHAM — Conservation Commission ───────────────────────────────────────

const needhamConComRules: JurisdictionRule[] = [
  {
    id: "needham-concom-001",
    requirementType: "notice_of_intent_wetlands",
    description: "Notice of Intent (NOI) to Needham Conservation Commission per MA Wetlands Protection Act (310 CMR 10.00)",
    requiredDocuments: [
      "notice_of_intent",
      "wetland_delineation",
      "site_plan",
      "stormwater_report",
      "dewatering_plan",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Required for work within 100-foot buffer zone of wetland resource areas including Charles River, Stony Brook, and numerous ponds. File with Needham Conservation Commission (781-455-7550 ext. 255) AND MA DEP eDEP. Needham has strict local stormwater regulations. Conservation Commission meets bi-weekly.",
  },
  {
    id: "needham-concom-002",
    requirementType: "needham_stormwater_bylaw",
    description: "Needham Stormwater Management Bylaw compliance for projects disturbing over 500 SF",
    requiredDocuments: [
      "stormwater_management_plan",
      "drainage_calculations",
      "erosion_control_plan",
    ],
    typicalTimelineDays: 30,
    isRequired: false,
    notes: "Needham has a local stormwater bylaw more stringent than state requirements. Projects disturbing >500 SF must submit stormwater management plan. Infiltration preferred. Review by Conservation Commission or DPW depending on project type.",
  },
];

// ─── Seed function ─────────────────────────────────────────────────────────────

export async function seedNeedhamRules() {
  const seeds = [
    {
      jurisdictionCode: "NEEDHAM_MA",
      jurisdictionName: "Needham, MA — Building Department",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: [
        ...needhamBuildingRules,
        ...needhamInspectionRules,
        ...needhamZbaRules,
        ...needhamHdcRules,
        ...needhamConComRules,
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
