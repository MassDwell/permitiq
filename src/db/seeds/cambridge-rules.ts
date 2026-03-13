import { db } from "@/db";
import { jurisdictionRules } from "@/db/schema";
import type { JurisdictionRule } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── CAMBRIDGE ISD — Inspectional Services Department ────────────────────────

const cambridgeIsdRules: JurisdictionRule[] = [
  // Building permit requirements
  {
    id: "cambridge-isd-building-001",
    requirementType: "isd_portal_application",
    description: "Submit application via Cambridge ISD Accela online portal (cambridgema.gov/inspection)",
    requiredDocuments: ["permit_application"],
    typicalTimelineDays: 10,
    isRequired: true,
    notes: "Cambridge uses Accela Automation for permit applications. Simple projects (<$10k) may qualify for over-the-counter same-day review. Projects >$10k require full plan review. Portal: cambridgema.gov/inspection.",
    feeStructure: "$20 per $1,000 of construction cost (min $50) + $100 plan review flat fee",
  },
  {
    id: "cambridge-isd-building-002",
    requirementType: "architectural_drawings",
    description: "Architectural plans stamped by Massachusetts-licensed architect",
    requiredDocuments: ["architectural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for projects >$10,000, additions, and any change of use. Cambridge ISD requires 3 full sets of stamped drawings for plan review.",
  },
  {
    id: "cambridge-isd-building-003",
    requirementType: "structural_drawings",
    description: "Structural engineering drawings stamped by Massachusetts-licensed PE",
    requiredDocuments: ["structural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, and structural modifications. Cambridge ISD reviews structural drawings carefully given dense urban context.",
  },
  {
    id: "cambridge-isd-building-004",
    requirementType: "mep_drawings",
    description: "MEP drawings (Mechanical, Electrical, Plumbing) each stamped by licensed engineers",
    requiredDocuments: ["mep_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Separate sub-permits required for each trade. Cambridge issues electrical, plumbing, and gas permits separately through ISD.",
  },
  {
    id: "cambridge-isd-building-005",
    requirementType: "site_plan_and_survey",
    description: "Certified site plan showing lot dimensions, setbacks, building footprint, and existing conditions",
    requiredDocuments: ["site_plan", "survey"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Must be prepared by a MA licensed land surveyor. Cambridge requires compliance with Cambridge Zoning Ordinance (CZO) setbacks, FAR, and lot coverage. Check Middlesex County Registry of Deeds.",
  },
  {
    id: "cambridge-isd-building-006",
    requirementType: "deed_and_title",
    description: "Recorded deed showing current ownership of the property",
    requiredDocuments: ["deed"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Must match current Middlesex County Registry of Deeds (South District) records. masslandrecords.com for search.",
  },
  {
    id: "cambridge-isd-building-007",
    requirementType: "zoning_compliance_letter",
    description: "Zoning compliance determination confirming project meets Cambridge Zoning Ordinance (CZO)",
    requiredDocuments: ["zoning_compliance_letter"],
    typicalTimelineDays: 10,
    isRequired: true,
    notes: "Cambridge ISD Zoning Division reviews against CZO for height, FAR, setbacks, parking, and open space. Cambridge zoning is complex — many residential areas are in multi-family zones. ISD office: 831 Massachusetts Ave.",
  },
  {
    id: "cambridge-isd-building-008",
    requirementType: "contractor_documentation",
    description: "Licensed contractor documentation: MA CSL, workers comp, liability insurance, HIC registration",
    requiredDocuments: ["contractor_license", "workers_comp", "liability_insurance"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "All GCs must hold MA Construction Supervisor License (CSL) from OCABR. HIC registration required for residential work. Workers compensation Certificate of Insurance naming Cambridge as additional insured.",
  },
  {
    id: "cambridge-isd-building-009",
    requirementType: "construction_cost_estimate",
    description: "Itemized construction cost estimate for permit fee calculation",
    requiredDocuments: ["cost_estimate"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Cambridge ISD permit fee: $20 per $1,000 of construction cost (min $50). Separate plan review fee ($100 flat) also applies.",
    feeStructure: "$20 per $1,000 of construction cost (min $50)",
  },
  {
    id: "cambridge-isd-building-010",
    requirementType: "flood_hazard_compliance",
    description: "FEMA flood zone compliance — Cambridge has significant FEMA Zone A/AE areas along Charles River and Alewife Brook",
    requiredDocuments: ["flood_zone_determination", "elevation_certificate"],
    typicalTimelineDays: 14,
    isRequired: false,
    notes: "Check FEMA FIRM panels for Cambridge. Many areas along Fresh Pond, Alewife, and Charles River are in AE flood zones. Elevation certificate from licensed surveyor required if in flood zone. Flood insurance may be required.",
  },
  // Inspection sequence
  {
    id: "cambridge-isd-insp-001",
    requirementType: "foundation_inspection",
    description: "Foundation inspection by Cambridge ISD inspector before concrete pour",
    inspectionSequence: 1,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Schedule 48 hours in advance via cambridgema.gov or 617-349-6100. Inspector must sign off before any concrete placement.",
  },
  {
    id: "cambridge-isd-insp-002",
    requirementType: "framing_inspection",
    description: "Rough framing inspection by Cambridge ISD before insulation or drywall",
    inspectionSequence: 2,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "All structural framing must be complete and exposed. Schedule via ISD online or phone.",
  },
  {
    id: "cambridge-isd-insp-003",
    requirementType: "rough_mep_inspection",
    description: "Rough MEP inspections (mechanical, electrical, plumbing) before insulation",
    inspectionSequence: 3,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Cambridge ISD coordinates all trade inspections. Electrical inspected by Cambridge Wiring Inspector. All trades must be approved before insulation.",
  },
  {
    id: "cambridge-isd-insp-004",
    requirementType: "insulation_inspection",
    description: "Insulation inspection per MA Energy Code — Cambridge has adopted MA Stretch Energy Code",
    inspectionSequence: 4,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Cambridge adopted the MA Stretch Energy Code. New residential: blower door test ≤3.0 ACH50. Commercial: COMCHECK required. Cambridge also has a local Green Building Requirement for certain projects.",
  },
  {
    id: "cambridge-isd-insp-005",
    requirementType: "final_inspection_and_co",
    description: "Final building inspection and Certificate of Occupancy (CO) from Cambridge ISD",
    inspectionSequence: 5,
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "All trade finals must be approved before building final. CO issued by Cambridge ISD Building Commissioner. Required before occupancy.",
  },
];

// ─── CAMBRIDGE CDD — Community Development Department ─────────────────────────

const cambridgeCddRules: JurisdictionRule[] = [
  {
    id: "cambridge-cdd-design-001",
    requirementType: "cdd_design_review",
    description: "Cambridge CDD Design Review for projects in Design Review districts or meeting size thresholds",
    requiredDocuments: [
      "design_application",
      "site_plan",
      "architectural_drawings",
      "massing_model",
      "materials_palette",
      "landscape_plan",
    ],
    typicalTimelineDays: 60,
    isRequired: false,
    notes: "CDD design review required for: new construction >2,500 SF GFA; additions >500 SF; projects in Overlay Districts. Cambridge CDD Design Review Board meets monthly. Application at cambridgema.gov/CDD. Allow 6–8 weeks minimum.",
    feeStructure: "CDD design review fee: $500 base + $1 per SF over 2,500 SF",
  },
  {
    id: "cambridge-cdd-aho-001",
    requirementType: "affordable_housing_overlay_compliance",
    description: "Cambridge Affordable Housing Overlay (AHO) — 100% affordable housing projects get expedited permitting by-right",
    requiredDocuments: [
      "aho_application",
      "affordability_restriction",
      "site_plan",
      "architectural_drawings",
      "financing_commitment_letter",
    ],
    typicalTimelineDays: 30,
    isRequired: false,
    notes: "Cambridge AHO (effective 2020) allows 100% affordable housing projects to build by-right at higher density in residential zones. Minimum 10 units, 100% AMI-restricted. Contact Cambridge CDD Housing Division at cambridgema.gov/CDD/housing.",
  },
  {
    id: "cambridge-cdd-special-permit-001",
    requirementType: "planning_board_special_permit",
    description: "Cambridge Planning Board special permit for projects exceeding as-of-right zoning limits",
    requiredDocuments: [
      "special_permit_application",
      "site_plan",
      "architectural_drawings",
      "traffic_study",
      "shadow_analysis",
      "community_impact_statement",
    ],
    typicalTimelineDays: 120,
    isRequired: false,
    notes: "Required for projects exceeding as-of-right FAR, height, or use by Cambridge Zoning Ordinance. Planning Board meets monthly. Application filed with CDD. Process: application → neighborhood notification → public hearing → decision. Appeal to Superior Court within 20 days.",
    feeStructure: "Special permit fee: $500–$5,000 depending on project size",
  },
  {
    id: "cambridge-cdd-inclusionary-001",
    requirementType: "cambridge_inclusionary_housing",
    description: "Cambridge Inclusionary Housing Ordinance — 20% affordable units for projects with 10+ units",
    requiredDocuments: ["inclusionary_housing_plan", "affordability_restriction"],
    typicalTimelineDays: 30,
    isRequired: true,
    notes: "Cambridge requires 20% of units be affordable (income-restricted) for any residential project with 10+ units. 15% at ≤80% AMI or fee in lieu. Administered by Cambridge CDD Housing Division. IDP Agreement required before building permit issuance.",
  },
  {
    id: "cambridge-cdd-historic-001",
    requirementType: "cambridge_historical_commission_review",
    description: "Cambridge Historical Commission (CHC) review for demolition or alteration of historically significant structures",
    requiredDocuments: ["demolition_application", "historical_assessment", "photos"],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Cambridge has extensive historic districts including Mid-Cambridge, Riverside, and East Cambridge. CHC reviews demolition of structures >50 years old. 12-month demolition delay possible. Review Cambridge Historical Commission list before demolition. 831 Massachusetts Ave, 617-349-4683.",
  },
];

// ─── CAMBRIDGE ZBA — Board of Zoning Appeal ──────────────────────────────────

const cambridgeZbaRules: JurisdictionRule[] = [
  {
    id: "cambridge-zba-variance-001",
    requirementType: "zba_variance_application",
    description: "Cambridge Board of Zoning Appeal (BZA) variance for dimensional relief (setback, FAR, height, lot coverage)",
    requiredDocuments: [
      "bza_application",
      "site_plan",
      "architectural_drawings",
      "deed",
      "survey",
      "abutters_list",
      "hardship_statement",
    ],
    typicalTimelineDays: 90,
    isRequired: true,
    notes: "Cambridge BZA meets bi-weekly. File application at Cambridge ISD, 831 Massachusetts Avenue. Hearing scheduled ~6 weeks after filing. Must demonstrate specific hardship under Cambridge Zoning Ordinance §10.50. Variance decisions appealable to Land Court.",
    feeStructure: "BZA filing fee: $250 (residential) / $500 (commercial)",
  },
  {
    id: "cambridge-zba-variance-002",
    requirementType: "abutters_notification_certified_mail",
    description: "Certified mail and direct-mail notification to all abutters within 300 feet of the parcel",
    requiredDocuments: ["abutters_list", "certified_mail_receipts"],
    typicalTimelineDays: 21,
    isRequired: true,
    notes: "Cambridge requires 300-foot abutter notification. Abutters list from Cambridge Assessor's Office (617-349-4343) or Cambridge GIS. Mail at least 14 days before hearing. Bring original certified mail receipts to hearing.",
  },
  {
    id: "cambridge-zba-variance-003",
    requirementType: "neighborhood_association_notification",
    description: "Notification to Cambridge neighborhood association and CNC (Cambridge Neighborhood Council)",
    requiredDocuments: ["neighborhood_notification_letter"],
    typicalTimelineDays: 14,
    isRequired: false,
    notes: "Cambridge BZA gives weight to neighborhood association input. Contact relevant CNC for your neighborhood. CDD maintains a list of registered neighborhood groups.",
  },
  {
    id: "cambridge-zba-special-permit-001",
    requirementType: "bza_special_permit",
    description: "Cambridge BZA Special Permit for uses requiring authorization (e.g., drive-throughs, large retail, certain residential conversions)",
    requiredDocuments: [
      "special_permit_application",
      "site_plan",
      "use_description",
      "parking_analysis",
      "neighborhood_impact_statement",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Certain uses in Cambridge require BZA special permit even if zoning allows them conditionally. Includes: drive-throughs, gas stations, lodging houses, certain conversions. Review CZO use tables carefully.",
    feeStructure: "Special permit fee: $250–$1,000",
  },
  {
    id: "cambridge-zba-appeal-001",
    requirementType: "bza_appeal_of_isd_decision",
    description: "Appeal of Cambridge ISD building permit denial or zoning determination to BZA",
    requiredDocuments: ["appeal_application", "isd_denial_letter", "site_plan"],
    typicalTimelineDays: 60,
    isRequired: false,
    notes: "Must be filed within 30 days of ISD decision. BZA has authority to overrule ISD zoning determinations. $150 filing fee.",
    feeStructure: "Appeal filing fee: $150",
  },
];

// ─── Seed function ─────────────────────────────────────────────────────────────

export async function seedCambridgeRules() {
  const seeds = [
    {
      jurisdictionCode: "CAMBRIDGE_ISD",
      jurisdictionName: "Cambridge Inspectional Services Dept (ISD)",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: cambridgeIsdRules,
    },
    {
      jurisdictionCode: "CAMBRIDGE_CDD",
      jurisdictionName: "Cambridge Community Development Dept (CDD)",
      projectTypes: ["residential", "commercial", "mixed_use"],
      rules: cambridgeCddRules,
    },
    {
      jurisdictionCode: "CAMBRIDGE_ZBA",
      jurisdictionName: "Cambridge Board of Zoning Appeal (BZA)",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: cambridgeZbaRules,
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
