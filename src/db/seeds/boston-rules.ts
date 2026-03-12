import { db } from "@/db";
import { jurisdictionRules } from "@/db/schema";
import type { JurisdictionRule } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── BOSTON ISD — Inspectional Services Department ───────────────────────────

const bostonIsdRules: JurisdictionRule[] = [
  // Building permit requirements
  {
    id: "boston-isd-building-001",
    requirementType: "isd_portal_application",
    description: "Submit application via Boston ISD Accela online portal (onlinepermitsandlicenses.boston.gov)",
    requiredDocuments: ["permit_application"],
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "Short-form permits (<$25k work) often processed same day. Long-form >$25k require full plan review.",
  },
  {
    id: "boston-isd-building-002",
    requirementType: "architectural_drawings",
    description: "Architectural plans stamped by Massachusetts-licensed architect",
    requiredDocuments: ["architectural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for projects over $25,000 construction cost, additions, and any change of use.",
  },
  {
    id: "boston-isd-building-003",
    requirementType: "structural_drawings",
    description: "Structural engineering drawings stamped by Massachusetts-licensed PE",
    requiredDocuments: ["structural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, and structural modifications. Includes foundation design.",
  },
  {
    id: "boston-isd-building-004",
    requirementType: "mep_drawings",
    description: "MEP drawings (Mechanical, Electrical, Plumbing) each stamped by licensed engineers",
    requiredDocuments: ["mep_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Separate sub-permits required for each trade. MEP engineers must be licensed in MA.",
  },
  {
    id: "boston-isd-building-005",
    requirementType: "site_plan_and_survey",
    description: "Certified site plan showing lot dimensions, setbacks, building footprint, and parking",
    requiredDocuments: ["site_plan", "survey"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Must be prepared by a licensed Massachusetts land surveyor for new construction and additions.",
  },
  {
    id: "boston-isd-building-006",
    requirementType: "deed_and_title",
    description: "Recorded deed showing current ownership of the property",
    requiredDocuments: ["deed"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Must match current Suffolk County Registry of Deeds records. Download at masslandrecords.com.",
  },
  {
    id: "boston-isd-building-007",
    requirementType: "zoning_compliance_letter",
    description: "Zoning compliance determination from ISD Zoning Division",
    requiredDocuments: ["zoning_compliance_letter"],
    typicalTimelineDays: 10,
    isRequired: true,
    notes: "Confirms project complies with Boston Zoning Code (Article 2A) for height, FAR, setbacks, parking.",
  },
  {
    id: "boston-isd-building-008",
    requirementType: "contractor_documentation",
    description: "Licensed contractor documentation: MA license, workers comp, liability insurance, HIC",
    requiredDocuments: ["contractor_license", "workers_comp", "liability_insurance"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "All GCs must be licensed by MA OCABR. HIC registration required for residential work <$500k. Workers comp Certificate of Insurance required.",
  },
  {
    id: "boston-isd-building-009",
    requirementType: "construction_cost_estimate",
    description: "Itemized construction cost estimate for permit fee calculation",
    requiredDocuments: ["cost_estimate"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Boston ISD permit fee is approximately $50–$100 per $1,000 of construction cost. Must be accurate.",
  },
  // Inspection sequence
  {
    id: "boston-isd-insp-001",
    requirementType: "foundation_inspection",
    description: "Foundation inspection by ISD inspector before concrete pour",
    inspectionSequence: 1,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Schedule minimum 48 hours in advance via boston.gov. Inspector must sign off before concrete placement.",
  },
  {
    id: "boston-isd-insp-002",
    requirementType: "framing_inspection",
    description: "Rough framing inspection by ISD inspector before any insulation or drywall",
    inspectionSequence: 2,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "All structural framing must be complete and exposed. Schedule online.",
  },
  {
    id: "boston-isd-insp-003",
    requirementType: "rough_mep_inspection",
    description: "Rough MEP inspections (mechanical, electrical, plumbing) before insulation",
    inspectionSequence: 3,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Separate inspections for each trade. All must be approved before insulation or drywall may proceed.",
  },
  {
    id: "boston-isd-insp-004",
    requirementType: "insulation_inspection",
    description: "Insulation inspection per Massachusetts Energy Code (IECC 2021 + MA Amendments)",
    inspectionSequence: 4,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "MA Stretch Energy Code effective Jan 2023 for Boston. Blower door test required for new residential. COMCHECK for commercial.",
  },
  {
    id: "boston-isd-insp-005",
    requirementType: "final_inspection_and_co",
    description: "Final building inspection and Certificate of Occupancy (CO) from ISD",
    inspectionSequence: 5,
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "All sub-trade finals must be approved before building final. CO required before occupancy.",
  },
  // Demolition-specific
  {
    id: "boston-isd-demo-001",
    requirementType: "article_85_demolition_delay",
    description: "Article 85 Demolition Delay approval from Boston Landmarks Commission",
    requiredDocuments: ["article_85_application"],
    typicalTimelineDays: 45,
    isRequired: true,
    notes: "90-day delay period for structures >50 years old. Apply to Boston Landmarks Commission before ISD. See boston.gov/landmarks.",
  },
  {
    id: "boston-isd-demo-002",
    requirementType: "asbestos_survey_and_notification",
    description: "Asbestos survey by licensed MA DEP-approved inspector + DEP notification if ACM present",
    requiredDocuments: ["asbestos_survey"],
    typicalTimelineDays: 7,
    isRequired: true,
    notes: "Required for all pre-1980 structures. If ACM found, file MA DEP Form AQ-06 with 10 days notice. Abatement required before demolition.",
  },
  {
    id: "boston-isd-demo-003",
    requirementType: "utility_shutoff_notices",
    description: "Utility shut-off notices from all utilities: gas, electric, water/sewer, telecom",
    requiredDocuments: ["utility_shutoff_notices"],
    typicalTimelineDays: 14,
    isRequired: true,
    notes: "Required from Eversource or National Grid (electric/gas), BWSC (water/sewer closed GSA), telecom carriers. Must be documented.",
  },
  {
    id: "boston-isd-demo-004",
    requirementType: "dep_hazmat_approval",
    description: "MA DEP hazardous materials review and approval (617-292-5500)",
    requiredDocuments: ["dep_approval"],
    typicalTimelineDays: 14,
    isRequired: true,
    notes: "DEP review required for any hazardous materials including lead paint, asbestos, petroleum contamination.",
  },
  {
    id: "boston-isd-demo-005",
    requirementType: "dig_safe_reference",
    description: "Dig Safe reference number (digsafe.com or 811)",
    requiredDocuments: ["dig_safe_reference"],
    typicalTimelineDays: 3,
    isRequired: true,
    notes: "Massachusetts law requires Dig Safe clearance before any ground disturbance. Reference number expires after 30 days.",
  },
  {
    id: "boston-isd-demo-006",
    requirementType: "pest_control_letter",
    description: "Letter from licensed pest control contractor confirming pest management plan",
    requiredDocuments: ["pest_control_letter"],
    typicalTimelineDays: 7,
    isRequired: true,
    notes: "Boston ISD requires documented pest management before AND after demolition. Must be licensed in MA.",
  },
  {
    id: "boston-isd-demo-007",
    requirementType: "fire_prevention_permit",
    description: "Separate demolition permit from Boston Fire Prevention Bureau",
    requiredDocuments: ["fire_prevention_permit"],
    typicalTimelineDays: 14,
    isRequired: true,
    notes: "Separate from ISD permit. Contact Boston Fire Prevention at 617-343-2721.",
  },
  {
    id: "boston-isd-demo-008",
    requirementType: "isd_environmental_review",
    description: "Environmental Services Division review at 1010 Massachusetts Ave, 4th floor",
    requiredDocuments: ["environmental_review"],
    typicalTimelineDays: 7,
    isRequired: true,
    notes: "Contact isdenvironmental@boston.gov or visit ISD 4th floor. Must be completed before permit issuance.",
  },
];

// ─── BOSTON BPDA — Planning & Development Agency ─────────────────────────────

const bostonBpdaRules: JurisdictionRule[] = [
  {
    id: "boston-bpda-art80-small-001",
    requirementType: "article_80_small_project_review",
    description: "Article 80 Small Project Review for projects 20,000–50,000 SF GFA",
    requiredDocuments: [
      "project_notification_form",
      "site_plan",
      "architectural_drawings",
      "community_impact_statement",
      "transportation_access_plan",
    ],
    typicalTimelineDays: 120,
    isRequired: true,
    notes: "Triggered by 20,000–50,000 SF GFA, or any project creating 10+ residential units. BPDA Board approval required. Typical process: 4–6 months.",
  },
  {
    id: "boston-bpda-art80-large-001",
    requirementType: "article_80_large_project_review",
    description: "Article 80 Large Project Review for projects >50,000 SF GFA",
    requiredDocuments: [
      "project_notification_form",
      "site_plan",
      "architectural_drawings",
      "structural_drawings",
      "mep_drawings",
      "deir",
      "traffic_study",
      "shadow_analysis",
      "wind_analysis",
      "inclusionary_housing_plan",
      "community_benefits_agreement",
    ],
    typicalTimelineDays: 365,
    isRequired: true,
    notes: "Projects >50,000 SF GFA. Full DPIR + FEIR + public comment process. Typically 12–24 months. Requires BPDA Board vote.",
  },
  {
    id: "boston-bpda-art80-large-002",
    requirementType: "project_notification_form",
    description: "Project Notification Form (PNF) filed with BPDA — triggers Article 80 review clock",
    requiredDocuments: ["project_notification_form"],
    typicalTimelineDays: 30,
    isRequired: true,
    notes: "Must include: project description, GFA breakdown by use, phasing plan, initial design concept. Electronic submission at bostonplans.org.",
  },
  {
    id: "boston-bpda-art80-large-003",
    requirementType: "traffic_impact_study",
    description: "Traffic Impact and Access Study (TIAS) by licensed traffic engineer",
    requiredDocuments: ["traffic_study"],
    typicalTimelineDays: 60,
    isRequired: true,
    notes: "Required for projects generating >20 vehicle trips per peak hour, or as directed by BTD. Must follow BTD guidelines.",
  },
  {
    id: "boston-bpda-art80-large-004",
    requirementType: "shadow_and_wind_analysis",
    description: "Shadow analysis and wind/pedestrian-level wind study",
    requiredDocuments: ["shadow_analysis", "wind_analysis"],
    typicalTimelineDays: 45,
    isRequired: false,
    notes: "Required for buildings >150 feet or with significant massing near open spaces and public parks.",
  },
  {
    id: "boston-bpda-idp-001",
    requirementType: "inclusionary_development_policy",
    description: "Inclusionary Development Policy (IDP) compliance — 13% on-site or 18% off-site affordable",
    requiredDocuments: ["inclusionary_housing_plan"],
    typicalTimelineDays: 30,
    isRequired: true,
    notes: "Required for all residential projects with 10+ units. 13% on-site at ≤70% AMI or 18% off-site fee. IDP Agreement required before building permit.",
  },
  {
    id: "boston-bpda-design-001",
    requirementType: "bpda_design_review",
    description: "BPDA Design Review Committee (DRC) review for design compliance",
    requiredDocuments: ["architectural_drawings", "site_plan", "massing_model", "materials_palette"],
    typicalTimelineDays: 60,
    isRequired: false,
    notes: "Required for Article 80 projects and projects in design review districts. DRC meets monthly.",
  },
  {
    id: "boston-bpda-green-001",
    requirementType: "green_building_compliance",
    description: "BPDA Green Building Requirements — LEED Silver minimum for large projects",
    requiredDocuments: ["green_building_checklist", "energy_model"],
    typicalTimelineDays: 30,
    isRequired: false,
    notes: "Projects >50,000 SF require LEED Silver or equivalent. Climate Ready Boston standards may apply.",
  },
];

// ─── BOSTON ZBA — Zoning Board of Appeal ─────────────────────────────────────

const bostonZbaRules: JurisdictionRule[] = [
  {
    id: "boston-zba-variance-001",
    requirementType: "zba_variance_application",
    description: "ZBA variance application for dimensional relief (setback, FAR, height, lot coverage, parking)",
    requiredDocuments: [
      "zba_application",
      "site_plan",
      "architectural_drawings",
      "deed",
      "survey",
      "abutters_list",
      "public_notice",
      "hardship_statement",
    ],
    typicalTimelineDays: 90,
    isRequired: true,
    notes: "File at City Hall, Room 801 or online. Hearing scheduled ~4–6 weeks after filing. Must demonstrate hardship or design variance criteria.",
  },
  {
    id: "boston-zba-variance-002",
    requirementType: "abutters_notification_certified_mail",
    description: "Certified mail notification to all abutters within 300 feet of the parcel",
    requiredDocuments: ["abutters_list", "certified_mail_receipts"],
    typicalTimelineDays: 21,
    isRequired: true,
    notes: "Abutters list from Boston Assessing Department. Mail at least 7 days before hearing. Bring receipts to hearing.",
  },
  {
    id: "boston-zba-variance-003",
    requirementType: "neighborhood_association_review",
    description: "Notification to and review by the relevant neighborhood association (ISD-registered)",
    requiredDocuments: ["neighborhood_review_letter"],
    typicalTimelineDays: 30,
    isRequired: false,
    notes: "Strongly recommended. ZBA gives significant weight to neighborhood association support. Contact ISD for relevant associations.",
  },
  {
    id: "boston-zba-cup-001",
    requirementType: "conditional_use_permit",
    description: "Conditional Use Permit (CUP) for uses requiring ZBA special authorization in zoning district",
    requiredDocuments: [
      "cup_application",
      "site_plan",
      "use_description",
      "parking_analysis",
      "neighborhood_impact_statement",
    ],
    typicalTimelineDays: 90,
    isRequired: true,
    notes: "Required for restaurant/food service in residential zones, certain institutional uses, drive-throughs, some retail. ZBA hearing required.",
  },
  {
    id: "boston-zba-appeal-001",
    requirementType: "zba_appeal_of_isd_decision",
    description: "Appeal of ISD building permit denial or zoning determination to ZBA",
    requiredDocuments: ["appeal_application", "isd_denial_letter", "site_plan", "architectural_drawings"],
    typicalTimelineDays: 60,
    isRequired: false,
    notes: "Must be filed within 30 days of ISD decision. ZBA has authority to overrule ISD zoning determinations.",
  },
];

// ─── MASSACHUSETTS GENERIC ────────────────────────────────────────────────────

const maGenericRules: JurisdictionRule[] = [
  {
    id: "ma-generic-building-001",
    requirementType: "ma_building_permit_780cmr",
    description: "Massachusetts Building Permit required per 780 CMR (MA State Building Code, 9th Edition)",
    requiredDocuments: ["permit_application", "architectural_drawings", "contractor_license"],
    typicalTimelineDays: 30,
    isRequired: true,
    notes: "All construction, alteration, repair, or demolition work >$1,000 requires a building permit from local Building Department.",
  },
  {
    id: "ma-generic-energy-001",
    requirementType: "ma_energy_code_compliance",
    description: "Massachusetts Energy Code compliance (IECC 2021 + MA Amendments / Stretch Energy Code)",
    requiredDocuments: ["energy_compliance_report", "rescheck_or_comcheck"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "MA Stretch Code effective January 2023 for adopting municipalities. Blower door test ≤3.0 ACH50 for new residential. COMCHECK for commercial.",
  },
  {
    id: "ma-generic-aab-001",
    requirementType: "ma_accessibility_521cmr",
    description: "Massachusetts Architectural Access Board (AAB) 521 CMR accessibility compliance",
    requiredDocuments: ["aab_compliance_checklist"],
    typicalTimelineDays: 30,
    isRequired: true,
    notes: "File AAB variance application for commercial projects >$100k. Compliance with 521 CMR required for all public buildings and commercial spaces.",
  },
  {
    id: "ma-generic-contractor-001",
    requirementType: "ma_licensed_contractor",
    description: "Massachusetts licensed/registered contractor required (OCABR licensing)",
    requiredDocuments: ["contractor_license", "hic_registration", "workers_comp", "liability_insurance"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "All GCs must be licensed by MA OCABR. HIC (Home Improvement Contractor) registration required for residential work. CSL (Construction Supervisor License) for structural work.",
  },
  {
    id: "ma-generic-fire-001",
    requirementType: "fire_protection_permit",
    description: "Fire protection permit from local fire department (MA CMR 527)",
    requiredDocuments: ["fire_protection_drawings", "sprinkler_permit_application"],
    typicalTimelineDays: 30,
    isRequired: false,
    notes: "Required for all fire suppression systems, fire alarm systems, and sprinkler work. Filed with local fire department, not building department.",
  },
  {
    id: "ma-generic-wetlands-001",
    requirementType: "wetlands_protection_act",
    description: "MA Wetlands Protection Act Notice of Intent (310 CMR 10.00) if within 100-foot buffer zone",
    requiredDocuments: ["notice_of_intent", "wetland_delineation", "site_plan"],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "File with local Conservation Commission if work within 100-foot buffer zone of any wetland resource area. DEP online filing required.",
  },
  {
    id: "ma-generic-water-001",
    requirementType: "water_sewer_connection_permit",
    description: "Water and sewer connection permit from local DPW or water authority",
    requiredDocuments: ["connection_permit_application", "plumbing_drawings"],
    typicalTimelineDays: 30,
    isRequired: true,
    notes: "Required for all new connections or modifications to water/sewer. Filed with local Department of Public Works. Tie-in fee may apply.",
  },
  {
    id: "ma-generic-electrical-001",
    requirementType: "ma_electrical_permit",
    description: "Massachusetts electrical permit required per 527 CMR (Electrical Code)",
    requiredDocuments: ["electrical_permit_application", "electrical_drawings", "electrician_license"],
    typicalTimelineDays: 7,
    isRequired: true,
    notes: "All electrical work requires a permit filed by a MA licensed electrician. Inspected by local wiring inspector. Code: MA 527 CMR (based on NEC 2023).",
  },
  {
    id: "ma-generic-plumbing-001",
    requirementType: "ma_plumbing_permit",
    description: "Massachusetts plumbing permit required per 248 CMR (Plumbing & Gas Code)",
    requiredDocuments: ["plumbing_permit_application", "plumbing_drawings", "plumber_license"],
    typicalTimelineDays: 7,
    isRequired: true,
    notes: "All plumbing work requires a permit filed by a MA licensed plumber. Inspected by local plumbing inspector. Code: 248 CMR.",
  },
];

// ─── Seed function ─────────────────────────────────────────────────────────────

export async function seedBostonRules() {
  const seeds = [
    {
      jurisdictionCode: "BOSTON_ISD",
      jurisdictionName: "Boston Inspectional Services Dept (ISD)",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: bostonIsdRules,
    },
    {
      jurisdictionCode: "BOSTON_BPDA",
      jurisdictionName: "Boston Planning & Development Agency (BPDA)",
      projectTypes: ["commercial", "mixed_use"],
      rules: bostonBpdaRules,
    },
    {
      jurisdictionCode: "BOSTON_ZBA",
      jurisdictionName: "Boston Zoning Board of Appeal (ZBA)",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: bostonZbaRules,
    },
    {
      jurisdictionCode: "MA_GENERIC",
      jurisdictionName: "Massachusetts (Generic Requirements)",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: maGenericRules,
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
