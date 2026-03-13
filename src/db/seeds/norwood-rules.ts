import { db } from "@/db";
import { jurisdictionRules } from "@/db/schema";
import type { JurisdictionRule } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── NORWOOD, MA — Building Department ───────────────────────────────────────
// Building Department: 566 Washington St, Norwood MA 02062 | (781) 762-1240 x136
// Portal: https://www.norwood-ma.gov/building-department
// Norfolk County | Mixed residential + active commercial/industrial corridor (Rte 1, Rte 1A)

const norwoodBuildingRules: JurisdictionRule[] = [
  // Building permit requirements
  {
    id: "norwood-bld-001",
    requirementType: "building_permit_application",
    description: "Submit building permit application to Norwood Building Department at 566 Washington St or via online portal",
    requiredDocuments: ["permit_application", "deed"],
    typicalTimelineDays: 10,
    isRequired: true,
    notes: "Norwood Building Dept accepts online and in-person applications. Over-the-counter permits for minor residential work. Commercial projects and new construction require full plan review (2–4 weeks). Fee: $10 per $1,000 construction cost (min $35). Contact Inspector of Buildings at (781) 762-1240 x136.",
  },
  {
    id: "norwood-bld-002",
    requirementType: "architectural_drawings",
    description: "Architectural plans stamped by Massachusetts-licensed architect",
    requiredDocuments: ["architectural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, change of use, and commercial projects. Norwood has significant commercial/industrial inventory along Rte 1 and Washington St requiring detailed architectural and code analysis.",
  },
  {
    id: "norwood-bld-003",
    requirementType: "structural_drawings",
    description: "Structural engineering drawings stamped by Massachusetts-licensed PE",
    requiredDocuments: ["structural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, and structural work. Commercial projects on Route 1 corridor often involve steel construction requiring detailed connection and foundation design.",
  },
  {
    id: "norwood-bld-004",
    requirementType: "site_plan",
    description: "Certified site plan showing lot dimensions, setbacks, parking, stormwater, and utility connections",
    requiredDocuments: ["site_plan", "survey"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Prepared by licensed MA land surveyor or civil engineer. Commercial projects require full civil site plan including grading, drainage, utilities, and ADA parking per 521 CMR. Show compliance with Norwood Zoning Bylaw.",
  },
  {
    id: "norwood-bld-005",
    requirementType: "zoning_compliance_review",
    description: "Zoning compliance review by Norwood Building Inspector per Norwood Zoning Bylaw",
    requiredDocuments: ["zoning_compliance_letter"],
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "Norwood has diverse zoning districts including residential (R1–R4), Business, Industrial, and Highway Business (Rte 1). Confirm use, dimensional compliance, and parking requirements. Zoning Bylaw at norwood-ma.gov.",
  },
  {
    id: "norwood-bld-006",
    requirementType: "contractor_documentation",
    description: "Licensed contractor documentation: MA CSL/HIC license, workers comp, liability insurance",
    requiredDocuments: ["contractor_license", "workers_comp", "liability_insurance"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "CSL required for structural work. HIC for residential home improvement. Workers comp Certificate of Insurance naming Town of Norwood. Commercial GCs must also provide evidence of required bonding.",
  },
  {
    id: "norwood-bld-007",
    requirementType: "energy_code_compliance",
    description: "MA Energy Code compliance — Norwood has adopted MA Stretch Energy Code",
    requiredDocuments: ["energy_compliance_report", "rescheck_or_comcheck"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Norwood adopted MA Stretch Energy Code. REScheck for residential, COMcheck for commercial. Commercial projects on Route 1 must also comply with ASHRAE 90.1 for envelope and mechanical systems.",
  },
  {
    id: "norwood-bld-008",
    requirementType: "construction_cost_estimate",
    description: "Itemized construction cost estimate for permit fee calculation",
    requiredDocuments: ["cost_estimate"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Norwood permit fee: $10 per $1,000 construction cost, minimum $35. Commercial projects may also have Planning Board review fees. Confirm with Building Dept.",
  },
  {
    id: "norwood-bld-009",
    requirementType: "fire_prevention_review",
    description: "Norwood Fire Department review for commercial buildings, sprinkler systems, and fire alarm work",
    requiredDocuments: ["fire_protection_drawings", "fire_alarm_drawings"],
    typicalTimelineDays: 14,
    isRequired: false,
    notes: "Norwood Fire Prevention Bureau (781-762-1625) reviews all commercial fire suppression and fire alarm installations. Separate fire permit required. New commercial buildings must meet NFPA 13 sprinkler and NFPA 72 fire alarm requirements per 527 CMR.",
  },
  {
    id: "norwood-bld-010",
    requirementType: "mep_sub_permits",
    description: "Separate electrical, plumbing, and mechanical permits filed with Norwood Building Department",
    requiredDocuments: ["electrical_permit_application", "plumbing_permit_application"],
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "All trade permits filed separately. Electrical by MA-licensed electrician (527 CMR), plumbing/gas by MA-licensed plumber/gas fitter (248 CMR). Commercial MEP often requires engineer-stamped drawings.",
  },
  {
    id: "norwood-bld-011",
    requirementType: "dig_safe_reference",
    description: "Dig Safe reference number (digsafe.com or 811) before any excavation",
    requiredDocuments: ["dig_safe_reference"],
    typicalTimelineDays: 3,
    isRequired: true,
    notes: "MA law requires Dig Safe clearance before ground disturbance. Norwood has extensive underground utility infrastructure near commercial corridors. Reference expires 30 days.",
  },
];

// ─── NORWOOD — Inspection Sequence ───────────────────────────────────────────

const norwoodInspectionRules: JurisdictionRule[] = [
  {
    id: "norwood-insp-001",
    requirementType: "foundation_inspection",
    description: "Foundation inspection by Norwood Building Inspector before concrete pour",
    inspectionSequence: 1,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Schedule 48 hours in advance by calling (781) 762-1240 x136. Footings must be on undisturbed soil or per geotechnical report. Commercial foundations may require special inspection by third-party engineer.",
  },
  {
    id: "norwood-insp-002",
    requirementType: "framing_inspection",
    description: "Rough framing inspection before insulation, sheathing, or drywall",
    inspectionSequence: 2,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "All structural framing exposed. Fire blocking, draft stopping, and connections visible. Commercial steel framing requires inspector coordination with structural engineer.",
  },
  {
    id: "norwood-insp-003",
    requirementType: "rough_mep_inspection",
    description: "Rough MEP inspections (electrical, plumbing, mechanical) before insulation or close-up",
    inspectionSequence: 3,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Separate inspections by Norwood wire inspector and plumbing inspector. Fire suppression rough also inspected by Fire Dept for commercial. All must pass before proceeding.",
  },
  {
    id: "norwood-insp-004",
    requirementType: "insulation_inspection",
    description: "Insulation inspection per MA Stretch Energy Code",
    inspectionSequence: 4,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Verify R-values and air sealing. Blower door test for new residential. Commercial buildings: verify continuous insulation and thermal bridging compliance per COMcheck.",
  },
  {
    id: "norwood-insp-005",
    requirementType: "final_inspection_and_co",
    description: "Final building inspection and Certificate of Occupancy from Norwood Building Department",
    inspectionSequence: 5,
    typicalTimelineDays: 3,
    isRequired: true,
    notes: "All sub-trade and fire department finals required before building final. CO required before occupancy. Commercial CO may require Health Department sign-off for food service and AAB compliance letter.",
  },
];

// ─── NORWOOD — ZBA Variance Workflow ──────────────────────────────────────────

const norwoodZbaRules: JurisdictionRule[] = [
  {
    id: "norwood-zba-001",
    requirementType: "zba_variance_application",
    description: "ZBA variance application for dimensional relief filed with Norwood Town Clerk",
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
    notes: "File with Norwood Town Clerk at 566 Washington St. ZBA meets monthly — typically second Tuesday. Application due 4 weeks before hearing. Filing fee: $150–200. Hardship required per MGL c.40A §10. Commercial variances on Route 1 may face closer scrutiny due to traffic and design review.",
  },
  {
    id: "norwood-zba-002",
    requirementType: "abutters_notification",
    description: "Certified mail notification to abutters within 300 feet at least 14 days before ZBA hearing",
    requiredDocuments: ["abutters_list", "certified_mail_receipts"],
    typicalTimelineDays: 21,
    isRequired: true,
    notes: "Obtain abutters list from Norwood Assessors Office (781-762-1240 x108). Send certified mail at least 14 days before hearing. Bring green receipts. For commercial projects on Route 1, notify abutters in adjacent towns if within 300 feet.",
  },
  {
    id: "norwood-zba-003",
    requirementType: "legal_notice_publication",
    description: "Legal notice publication in Norwood Transcript at least 14 days before hearing",
    requiredDocuments: ["legal_notice_proof"],
    typicalTimelineDays: 14,
    isRequired: true,
    notes: "Town Clerk arranges publication per MGL c.40A §11. Norwood Transcript is the designated newspaper for legal notices.",
  },
  {
    id: "norwood-zba-004",
    requirementType: "special_permit_commercial",
    description: "ZBA Special Permit for commercial uses in Highway Business (HB) or Business zones per Norwood Zoning Bylaw",
    requiredDocuments: [
      "special_permit_application",
      "site_plan",
      "traffic_study",
      "parking_analysis",
      "use_description",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Many Route 1 commercial uses (drive-throughs, gas stations, auto service, large retail) require Special Permit. Traffic study typically required for commercial special permits given high traffic volumes on Route 1.",
  },
];

// ─── NORWOOD — Planning Board ─────────────────────────────────────────────────

const norwoodPlanningRules: JurisdictionRule[] = [
  {
    id: "norwood-planning-001",
    requirementType: "site_plan_review",
    description: "Norwood Planning Board site plan review for commercial, industrial, and multi-family development",
    requiredDocuments: [
      "site_plan_review_application",
      "site_plan",
      "architectural_drawings",
      "traffic_study",
      "stormwater_report",
      "landscape_plan",
      "lighting_plan",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Required per Norwood Zoning Bylaw for new commercial construction, expansions, change of use, and multi-family projects. Planning Board meets monthly. Site plan approval required before building permit for covered projects. Traffic peer review may be required for Route 1 commercial development.",
  },
  {
    id: "norwood-planning-002",
    requirementType: "commercial_district_design_review",
    description: "Commercial design standards compliance for Route 1 and Washington St corridor projects",
    requiredDocuments: [
      "architectural_renderings",
      "material_palette",
      "signage_plan",
      "lighting_plan",
    ],
    typicalTimelineDays: 45,
    isRequired: false,
    notes: "Norwood has design standards for commercial corridors. Planning Board reviews building design, landscaping, parking layout, and signage for conformance. Projects on Route 1 (Highway Business zone) may face heightened scrutiny.",
  },
];

// ─── NORWOOD — Conservation Commission ───────────────────────────────────────

const norwoodConComRules: JurisdictionRule[] = [
  {
    id: "norwood-concom-001",
    requirementType: "notice_of_intent_wetlands",
    description: "Notice of Intent (NOI) to Norwood Conservation Commission per MA Wetlands Protection Act (310 CMR 10.00)",
    requiredDocuments: [
      "notice_of_intent",
      "wetland_delineation",
      "site_plan",
      "stormwater_report",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Required for work within 100-foot buffer zone of wetland resource areas including Neponset River tributaries and associated wetlands. File with Norwood Conservation Commission AND MA DEP eDEP. Norwood Conservation Commission meets bi-weekly.",
  },
  {
    id: "norwood-concom-002",
    requirementType: "request_for_determination",
    description: "Request for Determination of Applicability (RDA) to Norwood Conservation Commission",
    requiredDocuments: ["rda_application", "site_plan"],
    typicalTimelineDays: 21,
    isRequired: false,
    notes: "File RDA if uncertain whether project is within wetland jurisdiction. Conservation Commission issues determination at public meeting. Industrial and commercial sites near Neponset watershed require careful wetland analysis.",
  },
];

// ─── Seed function ─────────────────────────────────────────────────────────────

export async function seedNorwoodRules() {
  const seeds = [
    {
      jurisdictionCode: "NORWOOD_MA",
      jurisdictionName: "Norwood, MA — Building Department",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: [
        ...norwoodBuildingRules,
        ...norwoodInspectionRules,
        ...norwoodZbaRules,
        ...norwoodPlanningRules,
        ...norwoodConComRules,
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
