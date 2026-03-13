import { db } from "@/db";
import { jurisdictionRules } from "@/db/schema";
import type { JurisdictionRule } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── QUINCY ISD — Inspectional Services Department ───────────────────────────

const quincyIsdRules: JurisdictionRule[] = [
  // Building permit requirements
  {
    id: "quincy-isd-building-001",
    requirementType: "isd_portal_application",
    description: "Submit building permit application to Quincy ISD at City Hall, 1305 Hancock St, Room 113",
    requiredDocuments: ["permit_application"],
    typicalTimelineDays: 14,
    isRequired: true,
    notes: "Quincy ISD accepts in-person and online applications. Check quincyma.gov/government/departments/inspectional_services for current online portal access. Phone: 617-376-1090. Plan review typically 2–3 weeks for residential; 4–6 weeks for commercial.",
    feeStructure: "$12 per $1,000 of construction cost (min $50) for residential; $15 per $1,000 for commercial",
  },
  {
    id: "quincy-isd-building-002",
    requirementType: "architectural_drawings",
    description: "Architectural plans stamped by Massachusetts-licensed architect",
    requiredDocuments: ["architectural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, and change of use. Quincy ISD requires 2 full sets of stamped drawings for plan review. Digital submission accepted via email.",
  },
  {
    id: "quincy-isd-building-003",
    requirementType: "structural_drawings",
    description: "Structural engineering drawings stamped by Massachusetts-licensed PE",
    requiredDocuments: ["structural_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Required for new construction, additions, and structural modifications. Quincy's coastal and fill conditions require careful foundation design — geotechnical report often required.",
  },
  {
    id: "quincy-isd-building-004",
    requirementType: "mep_drawings",
    description: "MEP drawings (Mechanical, Electrical, Plumbing) each stamped by licensed engineers",
    requiredDocuments: ["mep_drawings"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Separate sub-permits required for electrical, plumbing, and gas. All trade permits filed through Quincy ISD. Trade contractors must be MA licensed.",
  },
  {
    id: "quincy-isd-building-005",
    requirementType: "site_plan_and_survey",
    description: "Certified site plan showing lot dimensions, setbacks, building footprint, and proximity to water/wetlands",
    requiredDocuments: ["site_plan", "survey"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Must be prepared by a MA licensed land surveyor. Quincy requires special attention to coastal setbacks, FEMA flood zones, and wetland buffer zones. Verify against Norfolk County Registry of Deeds.",
  },
  {
    id: "quincy-isd-building-006",
    requirementType: "deed_and_title",
    description: "Recorded deed showing current ownership of the property",
    requiredDocuments: ["deed"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Must match Norfolk County Registry of Deeds records. Search at masslandrecords.com.",
  },
  {
    id: "quincy-isd-building-007",
    requirementType: "zoning_compliance_review",
    description: "Zoning compliance review against Quincy Zoning By-Law by ISD Zoning Division",
    requiredDocuments: ["zoning_compliance_letter"],
    typicalTimelineDays: 10,
    isRequired: true,
    notes: "Quincy's Zoning By-Law governs height, FAR, setbacks, lot coverage, and parking. Quincy has waterfront districts (Wollaston Beach, Marina Bay, Quincy Shore) with special regulations. Verify zoning district via Quincy GIS (quincymagis.com).",
  },
  {
    id: "quincy-isd-building-008",
    requirementType: "contractor_documentation",
    description: "Licensed contractor documentation: MA CSL, workers comp, liability insurance, HIC registration",
    requiredDocuments: ["contractor_license", "workers_comp", "liability_insurance"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "All GCs must hold MA Construction Supervisor License (CSL). HIC registration required for residential work. Workers comp COI required by Quincy ISD before permit issuance.",
  },
  {
    id: "quincy-isd-building-009",
    requirementType: "construction_cost_estimate",
    description: "Itemized construction cost estimate for permit fee calculation",
    requiredDocuments: ["cost_estimate"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes: "Quincy ISD fee: $12 per $1,000 of construction cost for residential (min $50); $15 per $1,000 for commercial.",
    feeStructure: "$12/$1,000 residential (min $50); $15/$1,000 commercial",
  },
  {
    id: "quincy-isd-building-010",
    requirementType: "fema_flood_zone_compliance",
    description: "FEMA flood zone compliance — Quincy has extensive Zone AE and VE coastal flood hazard areas",
    requiredDocuments: ["flood_zone_determination", "elevation_certificate", "floodplain_development_permit"],
    typicalTimelineDays: 21,
    isRequired: false,
    notes: "Quincy has significant FEMA flood zones including Zone VE (coastal high hazard) at Wollaston Beach and Zone AE along Quincy Bay and Blacks Creek. Elevation certificate from licensed surveyor required. Freeboard requirements apply. Contact Quincy DPW Floodplain Administrator: 617-376-1900.",
  },
  // Inspection sequence
  {
    id: "quincy-isd-insp-001",
    requirementType: "foundation_inspection",
    description: "Foundation inspection by Quincy ISD inspector before concrete pour",
    inspectionSequence: 1,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Schedule 48 hours in advance by calling Quincy ISD at 617-376-1090. In coastal areas, soil bearing capacity verification may be required before foundation approval.",
  },
  {
    id: "quincy-isd-insp-002",
    requirementType: "framing_inspection",
    description: "Rough framing inspection by Quincy ISD before insulation or drywall",
    inspectionSequence: 2,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "All structural framing must be complete and exposed. Hurricane/coastal wind load connections are reviewed carefully in Quincy given coastal exposure.",
  },
  {
    id: "quincy-isd-insp-003",
    requirementType: "rough_mep_inspection",
    description: "Rough MEP inspections (mechanical, electrical, plumbing) before insulation",
    inspectionSequence: 3,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Separate inspections by Quincy Wiring Inspector, Plumbing Inspector, and Gas Inspector. All must be approved before insulation proceeds.",
  },
  {
    id: "quincy-isd-insp-004",
    requirementType: "insulation_inspection",
    description: "Insulation inspection per MA Energy Code — Quincy has adopted MA Stretch Energy Code",
    inspectionSequence: 4,
    typicalTimelineDays: 2,
    isRequired: true,
    notes: "Quincy adopted the MA Stretch Energy Code. Blower door test ≤3.0 ACH50 for new residential. Coastal climate zone considerations apply for moisture management.",
  },
  {
    id: "quincy-isd-insp-005",
    requirementType: "final_inspection_and_co",
    description: "Final building inspection and Certificate of Occupancy (CO) from Quincy ISD",
    inspectionSequence: 5,
    typicalTimelineDays: 5,
    isRequired: true,
    notes: "All sub-trade finals must be approved before building final. CO required before occupancy. Coastal elevation certificate must be on file.",
  },
];

// ─── QUINCY ZBA — Zoning Board of Appeals ─────────────────────────────────────

const quincyZbaRules: JurisdictionRule[] = [
  {
    id: "quincy-zba-variance-001",
    requirementType: "zba_variance_application",
    description: "Quincy ZBA variance application for dimensional relief under Quincy Zoning By-Law",
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
    notes: "Quincy ZBA meets monthly at City Hall, 1305 Hancock St. File application with Quincy ISD. Hearing scheduled ~6 weeks after filing. Must demonstrate specific hardship under Quincy Zoning By-Law §8. $200 filing fee for residential; $400 for commercial. Decisions posted on quincyma.gov.",
    feeStructure: "ZBA filing fee: $200 residential / $400 commercial",
  },
  {
    id: "quincy-zba-variance-002",
    requirementType: "abutters_notification_certified_mail",
    description: "Certified mail notification to all abutters within 300 feet of the parcel",
    requiredDocuments: ["abutters_list", "certified_mail_receipts"],
    typicalTimelineDays: 21,
    isRequired: true,
    notes: "Quincy requires 300-foot abutter notification. Obtain abutters list from Quincy Assessor's Office (617-376-1130). Mail at least 14 days before hearing. Bring certified mail receipts to hearing.",
  },
  {
    id: "quincy-zba-variance-003",
    requirementType: "councilor_at_large_notification",
    description: "Notification to Quincy City Councilor(s) representing the ward",
    requiredDocuments: ["councilor_notification_letter"],
    typicalTimelineDays: 14,
    isRequired: false,
    notes: "Recommended. Quincy ZBA considers input from local councilors. Quincy has 9 ward councilors — identify the relevant ward at quincyma.gov/government.",
  },
  {
    id: "quincy-zba-special-permit-001",
    requirementType: "special_permit_application",
    description: "Quincy ZBA special permit for uses requiring authorization in specific zoning districts",
    requiredDocuments: [
      "special_permit_application",
      "site_plan",
      "use_description",
      "parking_analysis",
      "traffic_impact_analysis",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Required for certain uses in Business, Industrial, and Waterfront districts. Includes drive-throughs, multi-family in some zones, marinas, and outdoor dining. Review Quincy Zoning By-Law use tables carefully.",
    feeStructure: "Special permit fee: $300–$1,500",
  },
  {
    id: "quincy-zba-appeal-001",
    requirementType: "zba_appeal_of_isd_decision",
    description: "Appeal of Quincy ISD building permit denial or zoning determination to ZBA",
    requiredDocuments: ["appeal_application", "isd_denial_letter", "site_plan"],
    typicalTimelineDays: 60,
    isRequired: false,
    notes: "Must be filed within 30 days of ISD decision. $100 appeal filing fee.",
    feeStructure: "Appeal filing fee: $100",
  },
];

// ─── QUINCY — Waterfront, Coastal & Historic Review ──────────────────────────

const quincySpecialReviewRules: JurisdictionRule[] = [
  {
    id: "quincy-coastal-waterfront-001",
    requirementType: "quincy_waterfront_district_review",
    description: "Quincy Waterfront District / Marina Bay review for coastal development projects",
    requiredDocuments: [
      "site_plan",
      "architectural_drawings",
      "coastal_impact_statement",
      "sea_level_rise_analysis",
    ],
    typicalTimelineDays: 60,
    isRequired: false,
    notes: "Quincy's Waterfront Districts (Marina Bay, Quincy Shore Drive, Wollaston Beach) have special design requirements emphasizing public access, coastal resilience, and visual compatibility. Review Quincy Waterfront Development Plan. Contact Quincy Planning Division, 617-376-1168.",
  },
  {
    id: "quincy-coastal-conservation-001",
    requirementType: "conservation_commission_notice_of_intent",
    description: "Notice of Intent (NOI) to Quincy Conservation Commission under MA Wetlands Protection Act",
    requiredDocuments: [
      "notice_of_intent",
      "wetland_delineation",
      "site_plan",
      "resource_area_map",
      "coastal_engineering_report",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Required for work within 100 feet of any wetland resource area, 200 feet of a perennial stream, or within the coastal bank. Quincy has extensive coastal resource areas including salt marsh, rocky intertidal, and coastal dunes. Quincy Conservation Commission: 617-376-1375. File NOI via DEP eDEP system.",
  },
  {
    id: "quincy-historic-commission-001",
    requirementType: "quincy_historical_commission_review",
    description: "Quincy Historical Commission (QHC) review for demolition or alteration of historically significant structures",
    requiredDocuments: ["demolition_application", "historical_assessment", "photos", "site_plan"],
    typicalTimelineDays: 90,
    isRequired: false,
    notes: "Quincy has significant historic resources including the Adams National Historical Park, Presidents' Hill neighborhood, and numerous colonial-era structures. QHC reviews demolition of structures >50 years old. 12-month demolition delay possible for designated landmarks. QHC: 617-376-1130. The Adams National Historical Park (NPS) has its own review for nearby properties.",
  },
  {
    id: "quincy-historic-commission-002",
    requirementType: "president_district_design_review",
    description: "Presidents' Hill and Quincy Center Historic District design review",
    requiredDocuments: [
      "design_application",
      "architectural_drawings",
      "materials_palette",
      "photos_existing_conditions",
    ],
    typicalTimelineDays: 60,
    isRequired: false,
    notes: "Properties within or adjacent to Quincy's locally-designated historic districts require QHC design approval for exterior alterations, additions, and new construction. Applies to Presidents' Hill, Quincy Center, and other locally-listed areas. Contact QHC before design development.",
  },
  {
    id: "quincy-mepa-001",
    requirementType: "mepa_environmental_review",
    description: "Massachusetts Environmental Policy Act (MEPA) review for large coastal and waterfront projects",
    requiredDocuments: ["environmental_notification_form", "site_plan", "environmental_impact_report"],
    typicalTimelineDays: 180,
    isRequired: false,
    notes: "MEPA review triggered for coastal projects: new residential >25 units on coastal land, commercial >25,000 SF on tidal land, significant dredging or fill. File Environmental Notification Form (ENF) with MEPA Office. EIR may be required. mepa.eea.mass.gov.",
  },
];

// ─── Seed function ─────────────────────────────────────────────────────────────

export async function seedQuincyRules() {
  const seeds = [
    {
      jurisdictionCode: "QUINCY_ISD",
      jurisdictionName: "Quincy Inspectional Services Dept (ISD)",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: quincyIsdRules,
    },
    {
      jurisdictionCode: "QUINCY_ZBA",
      jurisdictionName: "Quincy Zoning Board of Appeals (ZBA)",
      projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
      rules: quincyZbaRules,
    },
    {
      jurisdictionCode: "QUINCY_COASTAL",
      jurisdictionName: "Quincy Waterfront, Coastal & Historic Review",
      projectTypes: ["residential", "commercial", "mixed_use"],
      rules: quincySpecialReviewRules,
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
