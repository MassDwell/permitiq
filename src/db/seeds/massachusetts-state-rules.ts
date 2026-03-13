import { db } from "@/db";
import { jurisdictionRules } from "@/db/schema";
import type { JurisdictionRule } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── MASSACHUSETTS STATE — Rules that apply EVERYWHERE in MA ──────────────────
// These are the baseline requirements for any project in Massachusetts.
// They are merged with jurisdiction-specific rules for a complete picture.

const maStateRules: JurisdictionRule[] = [
  {
    id: "ma-state-building-001",
    requirementType: "ma_780cmr_building_permit",
    description:
      "Massachusetts Building Permit required under 780 CMR (State Building Code, 9th Edition) — filed with local Building Department",
    requiredDocuments: [
      "permit_application",
      "architectural_drawings",
      "contractor_license",
    ],
    typicalTimelineDays: 30,
    isRequired: true,
    notes:
      "780 CMR applies statewide. All construction, alteration, repair, or demolition >$1,000 requires a permit from the local Building Commissioner. Exempt: ordinary repairs and maintenance.",
  },
  {
    id: "ma-state-energy-001",
    requirementType: "ma_stretch_energy_code",
    description:
      "MA Stretch Energy Code compliance (IECC 2021 + MA Amendments) — required in most municipalities",
    requiredDocuments: ["energy_compliance_report", "rescheck_or_comcheck"],
    typicalTimelineDays: 0,
    isRequired: true,
    notes:
      "MA Stretch Code effective January 2023 for adopting municipalities (nearly all). New residential: blower door test ≤3.0 ACH50 required. Commercial: COMCHECK compliance report. Documentation submitted at permit application.",
  },
  {
    id: "ma-state-aab-001",
    requirementType: "ma_aab_521cmr_accessibility",
    description:
      "Massachusetts Architectural Access Board (521 CMR) accessibility compliance — required for new construction and substantial renovation",
    requiredDocuments: ["aab_compliance_checklist"],
    typicalTimelineDays: 30,
    isRequired: true,
    notes:
      "521 CMR (AAB Rules & Regulations) applies to all public buildings and places of public accommodation. File AAB Variance Application for any required deviation. Substantial renovation threshold: project cost exceeds 30% of building assessed value.",
  },
  {
    id: "ma-state-electrical-001",
    requirementType: "ma_electrical_permit_527cmr",
    description:
      "Separate electrical permit required from local Wiring Inspector (527 CMR — MA Electrical Code)",
    requiredDocuments: [
      "electrical_permit_application",
      "electrical_drawings",
      "electrician_license",
    ],
    typicalTimelineDays: 7,
    isRequired: true,
    notes:
      "All electrical work requires a permit filed by a MA licensed electrician (E-1 or E-2 license). Local Wiring Inspector (appointed by municipality) inspects and approves. Based on NEC 2023 with MA amendments.",
  },
  {
    id: "ma-state-plumbing-001",
    requirementType: "ma_plumbing_gas_permit_248cmr",
    description:
      "Separate plumbing and gas permit required from local Plumbing/Gas Inspector (248 CMR)",
    requiredDocuments: [
      "plumbing_permit_application",
      "plumbing_drawings",
      "plumber_license",
    ],
    typicalTimelineDays: 7,
    isRequired: true,
    notes:
      "All plumbing, gas, and drain/waste/vent work requires a permit filed by a MA licensed plumber (MP-1) or pipefitter. Gas work requires separate gas permit. Inspector appointed by local board of health or building department.",
  },
  {
    id: "ma-state-smokedetector-001",
    requirementType: "ma_smoke_co_detector_certification",
    description:
      "Smoke detector and carbon monoxide (CO) alarm certification required before occupancy — MA 527 CMR 31",
    requiredDocuments: ["smoke_detector_certificate"],
    typicalTimelineDays: 3,
    isRequired: true,
    notes:
      "Local fire department must certify smoke and CO detector compliance before occupancy permit is issued. Required for any sale, rental, or occupancy of a dwelling. Interconnected alarms required in new construction. Certificate valid 60 days.",
  },
  {
    id: "ma-state-title5-001",
    requirementType: "ma_title5_septic_inspection",
    description:
      "Title 5 septic system inspection required if project affects septic system (310 CMR 15.00)",
    requiredDocuments: ["title5_inspection_report"],
    typicalTimelineDays: 30,
    isRequired: false,
    notes:
      "Required for: property transfer, building permits for additions increasing flow, any system repair or expansion. Inspection by MA DEP-certified inspector. Valid 2 years (3 years with pump). File with local Board of Health.",
  },
  {
    id: "ma-state-wetlands-001",
    requirementType: "ma_wetlands_protection_act_310cmr10",
    description:
      "MA Wetlands Protection Act (310 CMR 10.00) — Conservation Commission Notice of Intent required within 100-foot buffer zone of wetland resource areas",
    requiredDocuments: [
      "notice_of_intent",
      "wetland_delineation_report",
      "site_plan",
    ],
    typicalTimelineDays: 90,
    isRequired: false,
    notes:
      "File Notice of Intent (NOI) with local Conservation Commission and MA DEP eDEP system if any work is within 100 feet of any wetland, bank, beach, dune, flat, marsh, or within 200 feet of a perennial stream. Orders of Conditions issued by Conservation Commission. Appeal to DEP (MEPA) available.",
  },
  {
    id: "ma-state-chapter91-001",
    requirementType: "ma_chapter91_waterways_license",
    description:
      "MA Chapter 91 Waterways License required for projects near tidal waters or great ponds (310 CMR 9.00)",
    requiredDocuments: ["chapter91_license_application", "site_plan"],
    typicalTimelineDays: 180,
    isRequired: false,
    notes:
      "Required for any filling, dredging, or structure in, on, or over any flowed tidelands, filled tidelands, or great ponds (>10 acres). Filed with MA DEP Waterways Program. Applies to waterfront development, docks, piers, sea walls. Public notice required.",
  },
];

// ─── Seed function ─────────────────────────────────────────────────────────────

export async function seedMassachusettsStateRules() {
  const seed = {
    jurisdictionCode: "MA_STATE",
    jurisdictionName: "Massachusetts (Statewide Requirements)",
    projectTypes: [
      "residential",
      "commercial",
      "adu",
      "mixed_use",
      "renovation",
    ],
    rules: maStateRules,
    source: "curated" as const,
  };

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
        source: seed.source,
        updatedAt: new Date(),
      })
      .where(
        eq(jurisdictionRules.jurisdictionCode, seed.jurisdictionCode)
      );
    console.log("Updated MA_STATE rules");
  } else {
    await db.insert(jurisdictionRules).values({
      jurisdictionCode: seed.jurisdictionCode,
      jurisdictionName: seed.jurisdictionName,
      projectTypes: [...seed.projectTypes],
      rules: [...seed.rules],
      source: seed.source,
    });
    console.log("Inserted MA_STATE rules");
  }

  return {
    seededCount: 1,
    jurisdictions: [seed.jurisdictionCode],
    ruleCount: maStateRules.length,
  };
}

// Run directly: pnpm tsx src/db/seeds/massachusetts-state-rules.ts
if (require.main === module) {
  seedMassachusettsStateRules()
    .then((result) => {
      console.log(
        `Done: seeded ${result.ruleCount} MA state rules for ${result.jurisdictions.join(", ")}`
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
