import { db } from "@/db";
import { jurisdictionRules } from "@/db/schema";
import type { JurisdictionRule } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── SOMERVILLE ISD — Inspectional Services Division ─────────────────────────

const somervilleIsdRules: JurisdictionRule[] = [
  // Building permit requirements
  {
    id: "somerville-isd-building-001",
    requirementType: "isd_portal_application",
    description: "Submit building permit application via Somerville ISD portal (somervillema.gov/departments/inspectional-services)",
    requiredDocuments: ["permit_application"],
    typicalTimelineDays: 10,
    isRequired: true,
    notes: "Somerville ISD at 50 Evergreen Ave accepts online and in-person applications. Minor work (<$5k) may qualify for expedited review. Full plan review required for new construction and major renovations. Phone: 617-625-6600 ext 2500.",
    feeStructure: "$10 per $1,000 of construction cost (min $50) for residential; $12 per $1,000 for commercial",
  },
  {
    id: "somerville-isd-building-002",
    requirementType: "architectural_drawings",
    description: "Architectural plans stamped by Massachusetts-licensed architect",
    requiredDocuments: ["architectural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions >200 SF, and change of use. Somerville ISD requires 2 full sets of stamped drawings plus digital PDF submission.",
  },
  {
    id: "somerville-isd-building-003",
    requirementType: "structural_drawings",
    description: "Structural engineering drawings stamped by Massachusetts-licensed PE",
    requiredDocuments: ["structural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for all new construction and structural modifications. Somerville has dense triple-decker housing stock — structural review of party walls and foundations is thorough.",
  },
  {
    id: "somerville-isd-building-004",
    requirementType: "mep_drawings",
    description: "MEP drawings (Mechanical, Electrical, Plumbing) each stamped by licensed engineers",
    requiredDocuments: ["mep_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Separate sub-permits for electrical, plumbing, and gas. All must be filed through Somerville ISD. Sub-permit applications submitted with master building permit application.",
  },
  {
    id: "somerville-isd-building-005",
    requirementType: "site_plan_and_survey",
    description: "Certified site plan showing lot dimensions, setbacks, building footprint, impervious area",
    requiredDocuments: ["site_plan", "survey"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Must be prepared by a MA licensed land surveyor. Somerville zoning enforces strict lot coverage and open space minimums — verify compliance with Somerville Zoning Ordinance. Check Middlesex County Registry of Deeds (Southern District).",
  },
  {
    id: "somerville-isd-building-006",
    requirementType: "deed_and_title",
    description: "Recorded deed showing current ownership of the property",
    requiredDocuments: ["deed"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Must match Middlesex County (South) Registry of Deeds records. Search at masslandrecords.com.",
  },
  {
    id: "somerville-isd-building-007",
    requirementType: "zoning_compliance_review",
    description: "Zoning compliance review against Somerville Zoning Ordinance (SZO) by ISD Zoning Division",
    requiredDocuments: ["zoning_compliance_letter"],
    typicalTimelineDays: 10,
    isRequired: true,
    notes: "Somerville adopted a new Zoning Ordinance in 2019 (SZO). The SZO updated district names and allowed uses significantly. Verify your project's zone via Somerville GIS (somervillegis.com). ISD will review height, FAR, setbacks, lot coverage, and parking.",
  },
  {
    id: "somerville-isd-building-008",
    requirementType: "contractor_documentation",
    description: "Licensed contractor documentation: MA CSL, workers comp, liability insurance, HIC registration",
    requiredDocuments: ["contractor_license", "workers_comp", "liability_insurance"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "All GCs must hold MA Construction Supervisor License (CSL) from OCABR. HIC (Home Improvement Contractor) required for residential work. Workers comp COI required. Somerville ISD verifies insurance before permit issuance.",
  },
  {
    id: "somerville-isd-building-009",
    requirementType: "construction_cost_estimate",
    description: "Itemized construction cost estimate for permit fee calculation",
    requiredDocuments: ["cost_estimate"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Somerville ISD fee: $10 per $1,000 of construction cost for residential (min $50); $12 per $1,000 for commercial.",
    feeStructure: "$10/$1,000 residential (min $50); $12/$1,000 commercial",
  },
  {
    id: "somerville-isd-building-010",
    requirementType: "stormwater_compliance",
    description: "Stormwater management plan for projects disturbing >500 SF of impervious surface",
    requiredDocuments: ["stormwater_management_plan"],
    typicalTimelineDays: 14,
    isRequired: false,
    notes: "Somerville requires stormwater management review for projects creating or disturbing >500 SF of impervious area. Green infrastructure preferred. Contact Somerville DPW, 617-625-6600 ext 4900.",
  },
  // Inspection sequence
  {
    id: "somerville-isd-insp-001",
    requirementType: "foundation_inspection",
    description: "Foundation inspection by Somerville ISD inspector before concrete pour",
    inspectionSequence: 1,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Schedule 48 hours in advance via Somerville ISD (617-625-6600 ext 2500). Inspector must sign off before concrete placement.",
  },
  {
    id: "somerville-isd-insp-002",
    requirementType: "framing_inspection",
    description: "Rough framing inspection by Somerville ISD before insulation or drywall",
    inspectionSequence: 2,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "All structural framing must be complete and exposed. Somerville has many historic multi-family structures — ISD pays close attention to party walls and fire-rated assemblies.",
  },
  {
    id: "somerville-isd-insp-003",
    requirementType: "rough_mep_inspection",
    description: "Rough MEP inspections (mechanical, electrical, plumbing) before insulation",
    inspectionSequence: 3,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Separate inspections by Somerville Wiring Inspector, Plumbing Inspector, and Gas Inspector. All must be approved before insulation proceeds.",
  },
  {
    id: "somerville-isd-insp-004",
    requirementType: "insulation_inspection",
    description: "Insulation inspection per MA Energy Code — Somerville has adopted MA Stretch Energy Code",
    inspectionSequence: 4,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Somerville adopted MA Stretch Energy Code. Blower door test ≤3.0 ACH50 for new residential. COMCHECK for commercial buildings. Energy compliance report required at inspection.",
  },
  {
    id: "somerville-isd-insp-005",
    requirementType: "final_inspection_and_co",
    description: "Final building inspection and Certificate of Occupancy (CO) from Somerville ISD",
    inspectionSequence: 5,
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "All sub-trade finals must be approved before building final. CO issued by Somerville Building Commissioner. Required before occupancy. Temporary CO available in some circumstances.",
  },
];

// ─── SOMERVILLE ZBA + Planning — Zoning Board of Appeals ─────────────────────

const somervilleZbaRules: JurisdictionRule[] = [
  {
    id: "somerville-zba-variance-001",
    requirementType: "zba_variance_application",
    description: "Somerville ZBA variance application for dimensional relief under the Somerville Zoning Ordinance (SZO)",
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
    notes: "Somerville ZBA meets monthly at Somerville City Hall, 93 Highland Ave. File application with ISD. Hearing scheduled ~6 weeks after filing. Must demonstrate specific hardship under SZO §7. $300 filing fee. Decisions posted on somervillema.gov.",
    feeStructure: "ZBA filing fee: $300 (residential) / $500 (commercial)",
  },
  {
    id: "somerville-zba-variance-002",
    requirementType: "abutters_notification_certified_mail",
    description: "Certified mail notification to all abutters within 300 feet of the parcel",
    requiredDocuments: ["abutters_list", "certified_mail_receipts"],
    typicalTimelineDays: 21,
    isRequired: true,
    notes: "Somerville requires 300-foot abutter notification. Obtain abutters list from Somerville Assessor's Office (617-625-6600 ext 4100). Mail at least 14 days before hearing. Bring certified mail receipts to hearing.",
  },
  {
    id: "somerville-zba-variance-003",
    requirementType: "ward_alderman_notification",
    description: "Notification to Somerville Ward City Councilor for the affected ward",
    requiredDocuments: ["councilor_notification_letter"],
    typicalTimelineDays: 14,
    isRequired: false,
    notes: "Recommended best practice. Somerville ZBA gives weight to input from the Ward City Councilor. Contact via somervillema.gov/government/city-council.",
  },
  {
    id: "somerville-zba-special-permit-001",
    requirementType: "special_permit_planning_board",
    description: "Somerville Planning Board special permit for projects in Special Districts or exceeding as-of-right thresholds",
    requiredDocuments: [
      "special_permit_application",
      "site_plan",
      "architectural_drawings",
      "traffic_study",
      "community_impact_statement",
    ],
    typicalTimelineDays: 120,
    isRequired: false,
    notes: "Required for: projects in Union Square Overlay District, Assembly Square Mixed-Use District, or Somerville Avenue corridor. Planning Board meets monthly. Application filed with Somerville Office of Strategic Planning and Community Development (OSPCD). somervillema.gov/OSPCD.",
    feeStructure: "Special permit fee: $500–$3,000 depending on project scale",
  },
  {
    id: "somerville-zba-appeal-001",
    requirementType: "zba_appeal_of_isd_decision",
    description: "Appeal of Somerville ISD building permit denial or zoning determination to ZBA",
    requiredDocuments: ["appeal_application", "isd_denial_letter", "site_plan"],
    typicalTimelineDays: 60,
    isRequired: false,
    notes: "Must be filed within 30 days of ISD decision. $150 appeal filing fee. ZBA has authority to overrule ISD zoning determinations.",
    feeStructure: "Appeal filing fee: $150",
  },
];

// ─── SOMERVILLE — SomerVision 2040 + Overlay Districts ───────────────────────

const somervillePlanningRules: JurisdictionRule[] = [
  {
    id: "somerville-planning-somervision-001",
    requirementType: "somervision_2040_compliance",
    description: "SomerVision 2040 Comprehensive Plan compliance review for major development projects",
    requiredDocuments: [
      "project_description",
      "community_benefits_statement",
      "sustainability_checklist",
    ],
    typicalTimelineDays: 30,
    isRequired: false,
    notes: "SomerVision 2040 is Somerville's comprehensive plan guiding land use decisions. Major projects (>20 units or >10,000 SF commercial) should demonstrate alignment with SomerVision goals: housing diversity, transit-oriented development, climate resilience. Reviewed by OSPCD. somervillema.gov/somervision.",
  },
  {
    id: "somerville-planning-union-square-001",
    requirementType: "union_square_overlay_review",
    description: "Union Square Overlay District (USOD) design review and compliance",
    requiredDocuments: [
      "design_application",
      "site_plan",
      "architectural_drawings",
      "streetscape_plan",
      "ground_floor_activation_plan",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Union Square Overlay District governs development in the Union Square redevelopment area. Projects must comply with USOD design guidelines emphasizing ground-floor activation, pedestrian scale, and Green Line connectivity. Administered by Somerville OSPCD in coordination with US2 developer agreements.",
  },
  {
    id: "somerville-planning-assembly-001",
    requirementType: "assembly_row_mixed_use_review",
    description: "Assembly Square Mixed-Use District (ASMD) design review",
    requiredDocuments: [
      "design_application",
      "site_plan",
      "architectural_drawings",
      "transportation_demand_management_plan",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Assembly Square is a 145-acre mixed-use development area along the Mystic River. ASMD has specific design standards for building height, setbacks, open space, and parking. Projects in ASMD require OSPCD design review. Proximity to Mystic River may trigger Conservation Commission review.",
  },
  {
    id: "somerville-planning-affordable-housing-001",
    requirementType: "somerville_inclusionary_zoning",
    description: "Somerville Inclusionary Zoning Ordinance — 20% affordable units for projects with 8+ units",
    requiredDocuments: ["inclusionary_housing_plan", "affordability_restriction", "financing_plan"],
    typicalTimelineDays: 30,
    isRequired: true,
    notes: "Somerville requires 20% affordable units (at ≤80% AMI) for residential developments with 8 or more units. Fee in lieu option available. Affordability restriction recorded at registry. Administered by Somerville OSPCD Housing Division. somervillema.gov/housing.",
  },
  {
    id: "somerville-planning-green-building-001",
    requirementType: "somerville_green_building_requirement",
    description: "Somerville Green Building Requirements for new construction >5,000 SF",
    requiredDocuments: ["green_building_checklist", "energy_model"],
    typicalTimelineDays: 14,
    isRequired: false,
    notes: "Somerville requires new commercial construction >5,000 SF and residential >10 units to meet green building standards (LEED Silver or equivalent). Climate Resilience requirements per Somerville Climate Forward plan. Contact Somerville Office of Sustainability (617-625-6600 ext 2100).",
  },
];

// ─── Seed function ─────────────────────────────────────────────────────────────

export async function seedSomervilleRules() {
  const seeds = [
    {
      jurisdictionCode: "SOMERVILLE_ISD",
      jurisdictionName: "Somerville Inspectional Services Division (ISD)",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: somervilleIsdRules,
    },
    {
      jurisdictionCode: "SOMERVILLE_ZBA",
      jurisdictionName: "Somerville Zoning Board of Appeals (ZBA)",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: somervilleZbaRules,
    },
    {
      jurisdictionCode: "SOMERVILLE_PLANNING",
      jurisdictionName: "Somerville OSPCD — Planning & Community Development",
      projectTypes: ["residential", "commercial", "mixed_use"],
      rules: somervillePlanningRules,
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
