import { db } from "@/db";
import { jurisdictionRules } from "@/db/schema";
import type { JurisdictionRule } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── NEWTON ISD — Inspectional Services Department ───────────────────────────

const newtonIsdRules: JurisdictionRule[] = [
  // Building permit requirements
  {
    id: "newton-isd-building-001",
    requirementType: "isd_portal_application",
    description: "Submit building permit application to Newton ISD via Newton Permits portal (newtonma.gov/government/inspectional-services)",
    requiredDocuments: ["permit_application"],
    typicalTimelineDays: 14,
    isRequired: true,
    notes: "Newton ISD is located at 1000 Commonwealth Ave. Newton uses an online permitting portal for applications. Minor work may qualify for expedited review. Full plan review for new construction and major renovations: 3–4 weeks residential, 6–8 weeks commercial. Phone: 617-796-1000.",
    feeStructure: "$12 per $1,000 of construction cost (min $60) for residential; $15 per $1,000 for commercial",
  },
  {
    id: "newton-isd-building-002",
    requirementType: "architectural_drawings",
    description: "Architectural plans stamped by Massachusetts-licensed architect",
    requiredDocuments: ["architectural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions >300 SF, and any change of use. Newton ISD requires 3 sets of stamped drawings. Digital submissions accepted. Drawings must include all code compliance notes (780 CMR, 521 CMR).",
  },
  {
    id: "newton-isd-building-003",
    requirementType: "structural_drawings",
    description: "Structural engineering drawings stamped by Massachusetts-licensed PE",
    requiredDocuments: ["structural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for all new construction, additions, and structural modifications. Newton has glacial soils and variable subsurface conditions — geotechnical investigation often required for larger projects.",
  },
  {
    id: "newton-isd-building-004",
    requirementType: "mep_drawings",
    description: "MEP drawings (Mechanical, Electrical, Plumbing) each stamped by licensed engineers",
    requiredDocuments: ["mep_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Separate sub-permits for electrical, plumbing, gas, and mechanical. Newton issues each as a separate permit through ISD. All trade contractors must be MA licensed.",
  },
  {
    id: "newton-isd-building-005",
    requirementType: "site_plan_and_survey",
    description: "Certified site plan showing lot dimensions, setbacks, building footprint, and tree locations",
    requiredDocuments: ["site_plan", "survey"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Must be prepared by a MA licensed land surveyor. Newton's Zoning Ordinance requires compliance with setback, lot coverage, and impervious surface limits. Newton also has a Tree Preservation Bylaw — significant trees must be shown on the site plan. Check Middlesex County (South) Registry of Deeds.",
  },
  {
    id: "newton-isd-building-006",
    requirementType: "deed_and_title",
    description: "Recorded deed showing current ownership of the property",
    requiredDocuments: ["deed"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Must match current Middlesex County (South) Registry of Deeds records. masslandrecords.com.",
  },
  {
    id: "newton-isd-building-007",
    requirementType: "zoning_compliance_review",
    description: "Zoning compliance review against Newton Zoning Ordinance (NZO) — Newton has 41 Village Centers and complex zoning districts",
    requiredDocuments: ["zoning_compliance_letter"],
    typicalTimelineDays: 10,
    isRequired: true,
    notes: "Newton's Zoning Ordinance is among the most complex in MA, with 41 village-scale districts. Verify zone, dimensional requirements, and allowed uses via Newton GIS (maps.newtonma.gov). Village Center overlays have additional height, design, and use provisions. ISD review confirms compliance before permit issuance.",
  },
  {
    id: "newton-isd-building-008",
    requirementType: "contractor_documentation",
    description: "Licensed contractor documentation: MA CSL, workers comp, liability insurance, HIC registration",
    requiredDocuments: ["contractor_license", "workers_comp", "liability_insurance"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "All GCs must hold MA Construction Supervisor License (CSL). HIC registration required for residential work. Workers comp COI required. Newton ISD verifies all licensing before permit issuance.",
  },
  {
    id: "newton-isd-building-009",
    requirementType: "construction_cost_estimate",
    description: "Itemized construction cost estimate for permit fee calculation",
    requiredDocuments: ["cost_estimate"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Newton ISD fee: $12 per $1,000 of construction cost for residential (min $60); $15 per $1,000 for commercial.",
    feeStructure: "$12/$1,000 residential (min $60); $15/$1,000 commercial",
  },
  {
    id: "newton-isd-building-010",
    requirementType: "tree_removal_permit",
    description: "Newton Tree Removal Permit — required for removal of any tree with 6+ inch diameter at breast height (DBH)",
    requiredDocuments: ["tree_removal_application", "arborist_report", "site_plan_tree_locations"],
    typicalTimelineDays: 21,
    isRequired: false,
    notes: "Newton Tree Preservation Bylaw requires a permit from Newton DPW Urban Forestry for removal of any tree ≥6 inches DBH. Tree replacement may be required. Cannot remove trees during construction without separate permit. DPW Forestry: 617-796-1000.",
    feeStructure: "Tree removal permit: $100 per tree + replacement value assessment",
  },
  // Inspection sequence
  {
    id: "newton-isd-insp-001",
    requirementType: "foundation_inspection",
    description: "Foundation inspection by Newton ISD inspector before concrete pour",
    inspectionSequence: 1,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Schedule 48 hours in advance by calling Newton ISD at 617-796-1000. Foundation design must account for Newton's variable soils — inspector may request geotechnical confirmation.",
  },
  {
    id: "newton-isd-insp-002",
    requirementType: "framing_inspection",
    description: "Rough framing inspection by Newton ISD before insulation or drywall",
    inspectionSequence: 2,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "All structural framing must be complete and exposed. Schedule via Newton ISD phone or online portal.",
  },
  {
    id: "newton-isd-insp-003",
    requirementType: "rough_mep_inspection",
    description: "Rough MEP inspections (mechanical, electrical, plumbing) before insulation",
    inspectionSequence: 3,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Separate inspections by Newton Wiring Inspector, Plumbing Inspector, and Gas Inspector. All must be approved before insulation proceeds.",
  },
  {
    id: "newton-isd-insp-004",
    requirementType: "insulation_inspection",
    description: "Insulation inspection per MA Energy Code — Newton has adopted MA Stretch Energy Code",
    inspectionSequence: 4,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Newton adopted the MA Stretch Energy Code. Blower door test ≤3.0 ACH50 for new residential. COMCHECK for commercial. Newton also has a local Renewable Energy requirement for certain projects.",
  },
  {
    id: "newton-isd-insp-005",
    requirementType: "final_inspection_and_co",
    description: "Final building inspection and Certificate of Occupancy (CO) from Newton ISD",
    inspectionSequence: 5,
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "All sub-trade finals must be approved before building final. CO required before occupancy. Newton ISD Building Commissioner issues CO.",
  },
];

// ─── NEWTON ZBA — Zoning Board of Appeals ─────────────────────────────────────

const newtonZbaRules: JurisdictionRule[] = [
  {
    id: "newton-zba-variance-001",
    requirementType: "zba_variance_application",
    description: "Newton ZBA variance application for dimensional relief under Newton Zoning Ordinance",
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
    notes: "Newton ZBA meets bi-weekly at City Hall, 1000 Commonwealth Ave. File application with Newton ISD. Hearing scheduled ~6–8 weeks after filing. Must demonstrate specific hardship or meet special permit criteria under Newton Zoning Ordinance. $350 filing fee for variance. Decisions appealable to Land Court within 20 days.",
    feeStructure: "ZBA variance filing fee: $350; special permit fee: $250–$500",
  },
  {
    id: "newton-zba-variance-002",
    requirementType: "abutters_notification_certified_mail",
    description: "Certified mail notification to all abutters within 300 feet of the parcel",
    requiredDocuments: ["abutters_list", "certified_mail_receipts"],
    typicalTimelineDays: 21,
    isRequired: true,
    notes: "Newton requires 300-foot abutter notification. Obtain abutters list from Newton Assessor's Office (617-796-1000). Mail at least 14 days before hearing. Bring certified mail receipts to hearing.",
  },
  {
    id: "newton-zba-variance-003",
    requirementType: "ward_alderman_notification",
    description: "Notification to Newton Ward Alderman for the affected ward",
    requiredDocuments: ["alderman_notification_letter"],
    typicalTimelineDays: 14,
    isRequired: false,
    notes: "Newton has 24 Aldermen (Board of Aldermen). ZBA gives significant weight to aldermanic input. Contact your Ward Alderman via newtonma.gov/government/city-council.",
  },
  {
    id: "newton-zba-special-permit-001",
    requirementType: "special_permit_village_center",
    description: "Newton ZBA/Planning special permit for projects in Village Center Overlay Districts",
    requiredDocuments: [
      "special_permit_application",
      "site_plan",
      "architectural_drawings",
      "urban_design_analysis",
      "pedestrian_access_plan",
    ],
    typicalTimelineDays: 120,
    isRequired: false,
    notes: "Newton has 13 designated Village Centers (Newton Corner, West Newton Square, Newtonville, etc.) with overlay zoning allowing higher density by special permit. Special permit criteria emphasize design quality, pedestrian environment, and compatibility with village character. Application to Newton Planning and Development Dept or ZBA depending on the provision.",
    feeStructure: "Village Center special permit fee: $500–$2,000",
  },
  {
    id: "newton-zba-appeal-001",
    requirementType: "zba_appeal_of_isd_decision",
    description: "Appeal of Newton ISD building permit denial or zoning determination to ZBA",
    requiredDocuments: ["appeal_application", "isd_denial_letter", "site_plan"],
    typicalTimelineDays: 60,
    isRequired: false,
    notes: "Must be filed within 30 days of ISD decision. $200 appeal filing fee.",
    feeStructure: "Appeal filing fee: $200",
  },
];

// ─── NEWTON — Conservation Commission + Special Reviews ──────────────────────

const newtonSpecialReviewRules: JurisdictionRule[] = [
  {
    id: "newton-conservation-noi-001",
    requirementType: "conservation_commission_notice_of_intent",
    description: "Notice of Intent (NOI) to Newton Conservation Commission under MA Wetlands Protection Act",
    requiredDocuments: [
      "notice_of_intent",
      "wetland_delineation",
      "site_plan",
      "resource_area_map",
      "stormwater_management_report",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Newton has numerous wetland resource areas — Charles River corridor, Crystal Lake, Cheesecake Brook, and many isolated wetlands. File NOI for any work within 100-foot wetland buffer zone. Newton Conservation Commission meets bi-weekly. 617-796-1000. File via MA DEP eDEP system. Newton also has local wetland bylaws providing additional protection beyond state minimums.",
  },
  {
    id: "newton-conservation-rda-001",
    requirementType: "conservation_commission_request_for_determination",
    description: "Request for Determination of Applicability (RDA) for projects potentially near wetlands",
    requiredDocuments: ["rda_application", "site_plan", "photos"],
    typicalTimelineDays: 30,
    isRequired: false,
    notes: "If uncertain whether a project triggers wetlands jurisdiction, file an RDA with Newton Conservation Commission. RDA is a faster, less costly process than full NOI. Newton Conservation Administrator: 617-796-1000. Response within 21 days.",
  },
  {
    id: "newton-village-center-design-001",
    requirementType: "village_center_design_review",
    description: "Village Center design review by Newton Planning and Development for projects in designated Village Center areas",
    requiredDocuments: [
      "design_application",
      "site_plan",
      "architectural_drawings",
      "streetscape_elevation",
      "materials_palette",
      "landscape_plan",
    ],
    typicalTimelineDays: 60,
    isRequired: false,
    notes: "Newton's 13 Village Centers have design review requirements for new construction and major alterations. Review criteria: scale compatibility, building materials, pedestrian environment, parking configuration, signage. Contact Newton Planning and Development, 1000 Commonwealth Ave, 617-796-1120.",
  },
  {
    id: "newton-affordable-housing-001",
    requirementType: "newton_inclusionary_zoning",
    description: "Newton Inclusionary Zoning — 15% affordable units for projects with 10+ units",
    requiredDocuments: ["inclusionary_housing_plan", "affordability_restriction"],
    typicalTimelineDays: 30,
    isRequired: true,
    notes: "Newton requires 15% of units be affordable (income-restricted) for residential projects with 10 or more units. Units at ≤80% AMI for ownership; ≤60% AMI for rental. Fee in lieu option available. Administered by Newton Planning and Development. Affordability restriction recorded at Middlesex County Registry of Deeds.",
  },
  {
    id: "newton-historical-commission-001",
    requirementType: "newton_historical_commission_review",
    description: "Newton Historical Commission (NHC) review for demolition delay of structures >75 years old",
    requiredDocuments: ["demolition_application", "historical_assessment", "photos"],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Newton's Demolition Delay Bylaw imposes a 12-month delay on demolition of structures determined significant by NHC (>75 years old, contributing to historic character). NHC meets monthly. Applications to NHC via Newton ISD. Contact Newton Planning and Development, 617-796-1120.",
  },
];

// ─── Seed function ─────────────────────────────────────────────────────────────

export async function seedNewtonRules() {
  const seeds = [
    {
      jurisdictionCode: "NEWTON_ISD",
      jurisdictionName: "Newton Inspectional Services Dept (ISD)",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: newtonIsdRules,
    },
    {
      jurisdictionCode: "NEWTON_ZBA",
      jurisdictionName: "Newton Zoning Board of Appeals (ZBA)",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: newtonZbaRules,
    },
    {
      jurisdictionCode: "NEWTON_PLANNING",
      jurisdictionName: "Newton Conservation Commission & Special Reviews",
      projectTypes: ["residential", "commercial", "mixed_use"],
      rules: newtonSpecialReviewRules,
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
