import { db } from "@/db";
import { jurisdictionRules } from "@/db/schema";
import type { JurisdictionRule } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── CANTON, MA — Building Department ────────────────────────────────────────
// Building Department: 801 Washington St, Canton MA 02021 | (781) 821-5000 x515
// Portal: https://www.town.canton.ma.us/236/Building-Department
// Norfolk County | Borders Blue Hills Reservation (DCR land); Neponset River watershed;
// significant stormwater and wetland sensitivity

const cantonBuildingRules: JurisdictionRule[] = [
  // Building permit requirements
  {
    id: "canton-bld-001",
    requirementType: "building_permit_application",
    description: "Submit building permit application to Canton Building Department (801 Washington St) in person or via online portal",
    requiredDocuments: ["permit_application", "deed"],
    typicalTimelineDays: 10,
    isRequired: true,
    notes: "Canton Building Dept accepts in-person applications at Town Hall. Check canton.ma.us for online portal availability. Over-the-counter permits for minor residential work. Full plan review 2–3 weeks for additions, 4–6 weeks for new construction. Fee: $12 per $1,000 construction cost (min $50). Contact Building Dept at (781) 821-5000 x515.",
  },
  {
    id: "canton-bld-002",
    requirementType: "architectural_drawings",
    description: "Architectural plans stamped by Massachusetts-licensed architect",
    requiredDocuments: ["architectural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, commercial projects, and changes of use. Must show floor plans, elevations, sections, egress paths, and code analysis per 780 CMR 9th Edition.",
  },
  {
    id: "canton-bld-003",
    requirementType: "structural_drawings",
    description: "Structural engineering drawings stamped by Massachusetts-licensed PE",
    requiredDocuments: ["structural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, and structural modifications. Canton has variable soil conditions near Blue Hills and Neponset River valley — geotechnical report often required.",
  },
  {
    id: "canton-bld-004",
    requirementType: "site_plan",
    description: "Certified site plan showing lot dimensions, setbacks, building footprint, impervious surface, and grading",
    requiredDocuments: ["site_plan", "survey"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Prepared by licensed MA land surveyor or civil engineer. Must show compliance with Canton Zoning Bylaw dimensional requirements. Include impervious surface calculation — critical given Canton's stormwater sensitivity near Blue Hills and Neponset watershed.",
  },
  {
    id: "canton-bld-005",
    requirementType: "zoning_compliance_review",
    description: "Zoning compliance review by Canton Building Inspector per Canton Zoning Bylaw",
    requiredDocuments: ["zoning_compliance_letter"],
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "Canton has residential zones (R-1, R-2, R-3), Business, Industrial, and Historic Overlay districts. Building Inspector reviews setbacks, lot coverage, height, and use. Zoning Bylaw at town.canton.ma.us. Note: parts of Canton are in the Blue Hills Reservation vicinity — check for any DCR overlay restrictions.",
  },
  {
    id: "canton-bld-006",
    requirementType: "contractor_documentation",
    description: "Licensed contractor documentation: MA CSL/HIC license, workers comp, liability insurance",
    requiredDocuments: ["contractor_license", "workers_comp", "liability_insurance"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "CSL required for structural work. HIC registration for residential home improvement. Workers comp Certificate of Insurance naming Town of Canton required. Licensed subcontractors for each trade.",
  },
  {
    id: "canton-bld-007",
    requirementType: "energy_code_compliance",
    description: "MA Energy Code compliance — Canton has adopted MA Stretch Energy Code",
    requiredDocuments: ["energy_compliance_report", "rescheck_or_comcheck"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Canton adopted MA Stretch Energy Code. REScheck for residential, COMcheck for commercial. New residential blower door test required ≤3.0 ACH50. Heated basement and crawl space insulation must meet Stretch Code requirements.",
  },
  {
    id: "canton-bld-008",
    requirementType: "construction_cost_estimate",
    description: "Itemized construction cost estimate for permit fee calculation",
    requiredDocuments: ["cost_estimate"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Canton permit fee: $12 per $1,000 construction cost, minimum $50. Additional DPW fees may apply for street opening or utility connections. Confirm fee schedule with Building Dept.",
  },
  {
    id: "canton-bld-009",
    requirementType: "stormwater_management_plan",
    description: "Stormwater management plan for projects with significant impervious surface increase near Blue Hills watershed or Neponset River",
    requiredDocuments: [
      "stormwater_management_plan",
      "drainage_calculations",
      "erosion_control_plan",
    ],
    typicalTimelineDays: 0,
    isRequired: false,
    notes: "Strongly recommended and often required by Canton Conservation Commission for projects near Blue Hills Reservation, Pequit Brook, Neponset River, and associated wetlands. Follow MA DEP Stormwater Management Standards. Coordinate with Conservation Commission early.",
  },
  {
    id: "canton-bld-010",
    requirementType: "dig_safe_reference",
    description: "Dig Safe reference number (digsafe.com or 811) before any excavation",
    requiredDocuments: ["dig_safe_reference"],
    typicalTimelineDays: 3,
    isRequired: true,
    notes: "MA law requires Dig Safe before ground disturbance. Expires 30 days. Note on permit application. Canton has significant utility infrastructure and gas distribution lines.",
  },
  {
    id: "canton-bld-011",
    requirementType: "mep_sub_permits",
    description: "Separate electrical, plumbing, and gas/mechanical permits filed with Canton Building Department",
    requiredDocuments: ["electrical_permit_application", "plumbing_permit_application"],
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "Trade permits filed separately by licensed tradespeople. Electrical per MA 527 CMR, plumbing/gas per 248 CMR. Canton has dedicated wire inspector and plumbing inspector.",
  },
];

// ─── CANTON — Inspection Sequence ────────────────────────────────────────────

const cantonInspectionRules: JurisdictionRule[] = [
  {
    id: "canton-insp-001",
    requirementType: "foundation_inspection",
    description: "Foundation inspection by Canton Building Inspector before concrete pour",
    inspectionSequence: 1,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Schedule 48 hours in advance by calling Canton Building Dept (781) 821-5000 x515. Footings must bear on suitable soil. Canton's variable soils near Blue Hills and river valley may require geotechnical verification before pour. Waterproofing details reviewed for sites near high water table areas.",
  },
  {
    id: "canton-insp-002",
    requirementType: "framing_inspection",
    description: "Rough framing inspection before insulation, sheathing, or drywall",
    inspectionSequence: 2,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "All structural framing complete and exposed. Fire blocking, draft stopping, hurricane straps, and joist hangers visible. Wind load strapping required per 780 CMR.",
  },
  {
    id: "canton-insp-003",
    requirementType: "rough_mep_inspection",
    description: "Rough MEP inspections (electrical, plumbing, mechanical/gas) before insulation or close-up",
    inspectionSequence: 3,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Separate inspections by Canton wire inspector, plumbing inspector, and gas inspector. All must pass before insulation proceeds. Fire sprinkler rough inspected by Fire Prevention if applicable.",
  },
  {
    id: "canton-insp-004",
    requirementType: "insulation_inspection",
    description: "Insulation inspection per MA Stretch Energy Code",
    inspectionSequence: 4,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Verify R-values per Stretch Code, air sealing, and vapor control. Blower door test required for new residential (submit results). Foundation insulation critical for Canton's variable climate exposure.",
  },
  {
    id: "canton-insp-005",
    requirementType: "final_inspection_and_co",
    description: "Final building inspection and Certificate of Occupancy from Canton Building Department",
    inspectionSequence: 5,
    typicalTimelineDays: 3,
    isRequired: true,
    notes: "All sub-trade finals, fire department finals, and Conservation Commission Order of Conditions compliance must be satisfied before building final. CO required before occupancy.",
  },
  {
    id: "canton-insp-006",
    requirementType: "conservation_final_compliance",
    description: "Canton Conservation Commission certificate of compliance for projects with Order of Conditions",
    inspectionSequence: 6,
    typicalTimelineDays: 21,
    isRequired: false,
    notes: "If project required an Order of Conditions from Conservation Commission, a Certificate of Compliance must be obtained after all wetland protection and stormwater measures are in place and inspected. File completion report with Conservation Commission.",
  },
];

// ─── CANTON — ZBA Variance Workflow ──────────────────────────────────────────

const cantonZbaRules: JurisdictionRule[] = [
  {
    id: "canton-zba-001",
    requirementType: "zba_variance_application",
    description: "ZBA variance application for dimensional relief filed with Canton Town Clerk",
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
    notes: "File with Canton Town Clerk at 801 Washington St. ZBA meets monthly — typically third Wednesday. Application due 3–4 weeks before hearing. Filing fee: $150–200. Must demonstrate hardship per MGL c.40A §10. Canton ZBA is active given suburban growth pressures.",
  },
  {
    id: "canton-zba-002",
    requirementType: "abutters_notification",
    description: "Certified mail notification to abutters within 300 feet at least 14 days before ZBA hearing",
    requiredDocuments: ["abutters_list", "certified_mail_receipts"],
    typicalTimelineDays: 21,
    isRequired: true,
    notes: "Abutters list from Canton Assessors Office. Certified mail required. Bring green card receipts to hearing. For properties near Blue Hills Reservation, DCR (MA Dept of Conservation & Recreation) is technically an abutter for state-owned parcels.",
  },
  {
    id: "canton-zba-003",
    requirementType: "legal_notice_publication",
    description: "Legal notice publication in Canton Journal or designated newspaper at least 14 days before hearing",
    requiredDocuments: ["legal_notice_proof"],
    typicalTimelineDays: 14,
    isRequired: true,
    notes: "Town Clerk arranges legal notice publication per MGL c.40A §11. Confirm designated newspaper with Canton Town Clerk.",
  },
  {
    id: "canton-zba-004",
    requirementType: "special_permit_adu",
    description: "ZBA Special Permit for accessory dwelling units (ADUs) under Canton Zoning Bylaw",
    requiredDocuments: [
      "special_permit_application",
      "site_plan",
      "floor_plans",
      "parking_plan",
    ],
    typicalTimelineDays: 75,
    isRequired: false,
    notes: "Canton allows ADUs by special permit in residential zones subject to size, parking, and owner-occupancy requirements. Review current Canton Zoning Bylaw for ADU provisions, which may have been updated post-2023 per MA ADU law.",
  },
];

// ─── CANTON — Conservation Commission (Blue Hills / Stormwater) ───────────────

const cantonConComRules: JurisdictionRule[] = [
  {
    id: "canton-concom-001",
    requirementType: "notice_of_intent_wetlands",
    description: "Notice of Intent (NOI) to Canton Conservation Commission per MA Wetlands Protection Act (310 CMR 10.00)",
    requiredDocuments: [
      "notice_of_intent",
      "wetland_delineation",
      "site_plan",
      "stormwater_report",
      "erosion_control_plan",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Required for work within 100-foot buffer zone of wetland resource areas. Canton has extensive wetland areas including Neponset River headwaters, Pequit Brook, Blue Hills Brook, and numerous isolated wetlands near Blue Hills Reservation. File with Canton Conservation Commission AND MA DEP eDEP. Conservation Commission meets bi-weekly. Early pre-application meeting strongly recommended.",
  },
  {
    id: "canton-concom-002",
    requirementType: "canton_stormwater_bylaw",
    description: "Canton Stormwater Management Bylaw compliance — enhanced requirements for Blue Hills watershed and Neponset River tributaries",
    requiredDocuments: [
      "stormwater_management_plan",
      "drainage_calculations",
      "erosion_sediment_control_plan",
      "operations_maintenance_plan",
    ],
    typicalTimelineDays: 45,
    isRequired: false,
    notes: "Canton's proximity to Blue Hills Reservation and Neponset River watershed triggers strict stormwater requirements. Projects disturbing over 500 SF of land or adding significant impervious area must comply with Canton Stormwater Bylaw and MA DEP Stormwater Management Standards. Low-impact development (LID) techniques preferred. Review by Conservation Commission.",
  },
  {
    id: "canton-concom-003",
    requirementType: "blue_hills_reservation_buffer",
    description: "DCR coordination for projects adjacent to Blue Hills Reservation state land",
    requiredDocuments: [
      "site_plan",
      "wetland_delineation",
      "stormwater_report",
    ],
    typicalTimelineDays: 30,
    isRequired: false,
    notes: "Projects adjacent to Blue Hills Reservation (DCR land) must coordinate with MA Department of Conservation and Recreation in addition to Canton Conservation Commission. DCR has authority over any work affecting reservation land or water resources flowing onto reservation. Contact DCR Blue Hills Regional HQ at (617) 698-1802.",
  },
  {
    id: "canton-concom-004",
    requirementType: "request_for_determination",
    description: "Request for Determination of Applicability (RDA) to Canton Conservation Commission",
    requiredDocuments: ["rda_application", "site_plan"],
    typicalTimelineDays: 21,
    isRequired: false,
    notes: "File if uncertain whether project is within wetland jurisdiction. Important for Canton given extensive wetland resources. Conservation Commission issues Determination within 21 days.",
  },
];

// ─── CANTON — Planning Board ──────────────────────────────────────────────────

const cantonPlanningRules: JurisdictionRule[] = [
  {
    id: "canton-planning-001",
    requirementType: "site_plan_review",
    description: "Canton Planning Board site plan review for commercial, industrial, and multi-family development",
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
    notes: "Required for new commercial/industrial construction, expansions, and multi-family projects per Canton Zoning Bylaw. Planning Board meets monthly. Given proximity to I-95/Route 138 interchange area, traffic studies often required. Site plan approval required before building permit.",
  },
  {
    id: "canton-planning-002",
    requirementType: "subdivision_approval",
    description: "Canton Planning Board subdivision approval (Definitive Plan) or ANR endorsement for lot divisions",
    requiredDocuments: ["definitive_plan", "survey", "utility_plans"],
    typicalTimelineDays: 180,
    isRequired: false,
    notes: "Required for any division of land creating new lots requiring new roads. ANR (Approval Not Required) endorsement for divisions not requiring new streets. Canton Planning Board reviews for conformance with Subdivision Control Law (MGL c.41 §81K) and Town standards.",
  },
];

// ─── Seed function ─────────────────────────────────────────────────────────────

export async function seedCantonRules() {
  const seeds = [
    {
      jurisdictionCode: "CANTON_MA",
      jurisdictionName: "Canton, MA — Building Department",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: [
        ...cantonBuildingRules,
        ...cantonInspectionRules,
        ...cantonZbaRules,
        ...cantonConComRules,
        ...cantonPlanningRules,
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
