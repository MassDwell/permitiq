import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { jurisdictionRules } from "../src/db/schema";
import type { JurisdictionRule } from "../src/db/schema";

config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Massachusetts General Residential Permits
const maResidentialRules: JurisdictionRule[] = [
  {
    id: "ma-res-001",
    requirementType: "building_permit",
    description: "Building Permit Application",
    requiredDocuments: ["Site plan", "Floor plans", "Structural drawings"],
    isRequired: true,
    notes: "Required for all new construction and major renovations",
  },
  {
    id: "ma-res-002",
    requirementType: "electrical_permit",
    description: "Electrical Permit",
    requiredDocuments: ["Electrical load calculations", "Panel schedule"],
    isRequired: true,
    notes: "Required for all electrical work",
  },
  {
    id: "ma-res-003",
    requirementType: "plumbing_permit",
    description: "Plumbing Permit",
    requiredDocuments: ["Plumbing riser diagram", "Fixture schedule"],
    isRequired: true,
    notes: "Required for all plumbing installations",
  },
  {
    id: "ma-res-004",
    requirementType: "foundation_inspection",
    description: "Foundation Inspection",
    inspectionSequence: 1,
    typicalTimelineDays: 7,
    isRequired: true,
    notes: "Must be completed before pouring concrete",
  },
  {
    id: "ma-res-005",
    requirementType: "framing_inspection",
    description: "Rough Framing Inspection",
    inspectionSequence: 2,
    typicalTimelineDays: 14,
    isRequired: true,
    notes: "Must be completed before insulation",
  },
  {
    id: "ma-res-006",
    requirementType: "rough_electrical",
    description: "Rough Electrical Inspection",
    inspectionSequence: 3,
    typicalTimelineDays: 7,
    isRequired: true,
    notes: "Must be completed before drywall",
  },
  {
    id: "ma-res-007",
    requirementType: "rough_plumbing",
    description: "Rough Plumbing Inspection",
    inspectionSequence: 3,
    typicalTimelineDays: 7,
    isRequired: true,
    notes: "Must be completed before drywall",
  },
  {
    id: "ma-res-008",
    requirementType: "insulation_inspection",
    description: "Insulation Inspection",
    inspectionSequence: 4,
    typicalTimelineDays: 3,
    isRequired: true,
    notes: "MA Energy Code compliance required",
  },
  {
    id: "ma-res-009",
    requirementType: "final_electrical",
    description: "Final Electrical Inspection",
    inspectionSequence: 5,
    typicalTimelineDays: 7,
    isRequired: true,
    notes: "All fixtures must be installed",
  },
  {
    id: "ma-res-010",
    requirementType: "final_plumbing",
    description: "Final Plumbing Inspection",
    inspectionSequence: 5,
    typicalTimelineDays: 7,
    isRequired: true,
    notes: "All fixtures must be installed",
  },
  {
    id: "ma-res-011",
    requirementType: "final_building",
    description: "Final Building Inspection",
    inspectionSequence: 6,
    typicalTimelineDays: 7,
    isRequired: true,
    notes: "All work must be complete",
  },
  {
    id: "ma-res-012",
    requirementType: "certificate_of_occupancy",
    description: "Certificate of Occupancy",
    isRequired: true,
    notes: "Required before building can be occupied",
  },
];

// Boston City-Specific Requirements
const bostonRules: JurisdictionRule[] = [
  {
    id: "bos-001",
    requirementType: "building_permit",
    description: "Boston ISD Building Permit Application",
    requiredDocuments: [
      "ISD Form B",
      "Architectural drawings",
      "Site plan",
      "Owner authorization",
    ],
    isRequired: true,
    notes: "Submit to Inspectional Services Department",
  },
  {
    id: "bos-002",
    requirementType: "zoning_review",
    description: "Boston Zoning Review",
    isRequired: true,
    notes: "Required for all new construction and additions",
  },
  {
    id: "bos-003",
    requirementType: "bwsc_approval",
    description: "Boston Water & Sewer Commission Approval",
    requiredDocuments: ["Site plan showing utilities", "Tap application"],
    isRequired: true,
    notes: "Required for new water/sewer connections",
  },
  {
    id: "bos-004",
    requirementType: "historic_review",
    description: "Boston Landmarks Commission Review",
    isRequired: false,
    notes: "Required if property is in historic district",
  },
  {
    id: "bos-005",
    requirementType: "fire_prevention",
    description: "Boston Fire Prevention Permit",
    isRequired: true,
    notes: "Required for fire suppression and alarm systems",
  },
  {
    id: "bos-006",
    requirementType: "accessibility_review",
    description: "Accessibility Compliance Review",
    isRequired: true,
    notes: "MA AAB compliance required for all projects",
  },
  {
    id: "bos-007",
    requirementType: "electrical_permit",
    description: "Boston Electrical Permit",
    isRequired: true,
    notes: "Separate from building permit",
  },
  {
    id: "bos-008",
    requirementType: "gas_permit",
    description: "Boston Gas Permit",
    isRequired: true,
    notes: "Required for all gas installations",
  },
  {
    id: "bos-009",
    requirementType: "foundation_inspection",
    description: "Foundation Inspection",
    inspectionSequence: 1,
    isRequired: true,
  },
  {
    id: "bos-010",
    requirementType: "framing_inspection",
    description: "Structural Framing Inspection",
    inspectionSequence: 2,
    isRequired: true,
  },
  {
    id: "bos-011",
    requirementType: "rough_inspection",
    description: "Rough MEP Inspection",
    inspectionSequence: 3,
    isRequired: true,
    notes: "Mechanical, electrical, plumbing",
  },
  {
    id: "bos-012",
    requirementType: "energy_inspection",
    description: "Energy Code Compliance Inspection",
    inspectionSequence: 4,
    isRequired: true,
    notes: "Stretch Energy Code applies in Boston",
  },
  {
    id: "bos-013",
    requirementType: "final_inspection",
    description: "Final Inspection",
    inspectionSequence: 5,
    isRequired: true,
  },
  {
    id: "bos-014",
    requirementType: "certificate_of_occupancy",
    description: "Certificate of Occupancy",
    isRequired: true,
    notes: "Issued by ISD after all inspections pass",
  },
];

// Generic Multi-Family Residential
const multifamilyRules: JurisdictionRule[] = [
  {
    id: "mf-001",
    requirementType: "building_permit",
    description: "Multi-Family Building Permit",
    requiredDocuments: [
      "Architectural drawings",
      "Structural drawings",
      "MEP drawings",
      "Site plan",
    ],
    isRequired: true,
  },
  {
    id: "mf-002",
    requirementType: "fire_protection_plan",
    description: "Fire Protection Plan Review",
    requiredDocuments: ["Fire sprinkler plans", "Fire alarm plans"],
    isRequired: true,
    notes: "NFPA 13 compliance required for 3+ units",
  },
  {
    id: "mf-003",
    requirementType: "accessibility_review",
    description: "ADA/FHA Accessibility Review",
    isRequired: true,
    notes: "Required for buildings with 4+ units",
  },
  {
    id: "mf-004",
    requirementType: "site_plan_approval",
    description: "Site Plan Approval",
    requiredDocuments: ["Survey", "Landscape plan", "Grading plan"],
    isRequired: true,
  },
  {
    id: "mf-005",
    requirementType: "stormwater_management",
    description: "Stormwater Management Plan",
    isRequired: true,
    notes: "Required for projects disturbing >1 acre",
  },
  {
    id: "mf-006",
    requirementType: "parking_review",
    description: "Parking Requirements Review",
    isRequired: true,
    notes: "Must meet zoning parking minimums",
  },
  {
    id: "mf-007",
    requirementType: "foundation_inspection",
    description: "Foundation Inspection",
    inspectionSequence: 1,
    isRequired: true,
  },
  {
    id: "mf-008",
    requirementType: "structural_steel",
    description: "Structural Steel Inspection",
    inspectionSequence: 2,
    isRequired: false,
    notes: "If applicable",
  },
  {
    id: "mf-009",
    requirementType: "framing_inspection",
    description: "Framing Inspection",
    inspectionSequence: 2,
    isRequired: true,
  },
  {
    id: "mf-010",
    requirementType: "fire_suppression",
    description: "Fire Sprinkler Rough Inspection",
    inspectionSequence: 3,
    isRequired: true,
  },
  {
    id: "mf-011",
    requirementType: "rough_mep",
    description: "Rough MEP Inspection",
    inspectionSequence: 3,
    isRequired: true,
  },
  {
    id: "mf-012",
    requirementType: "insulation",
    description: "Insulation Inspection",
    inspectionSequence: 4,
    isRequired: true,
  },
  {
    id: "mf-013",
    requirementType: "elevator_inspection",
    description: "Elevator Inspection",
    inspectionSequence: 5,
    isRequired: false,
    notes: "If applicable",
  },
  {
    id: "mf-014",
    requirementType: "fire_alarm_final",
    description: "Fire Alarm Final Inspection",
    inspectionSequence: 5,
    isRequired: true,
  },
  {
    id: "mf-015",
    requirementType: "final_mep",
    description: "Final MEP Inspection",
    inspectionSequence: 6,
    isRequired: true,
  },
  {
    id: "mf-016",
    requirementType: "final_building",
    description: "Final Building Inspection",
    inspectionSequence: 7,
    isRequired: true,
  },
  {
    id: "mf-017",
    requirementType: "certificate_of_occupancy",
    description: "Certificate of Occupancy",
    isRequired: true,
    notes: "Required before any unit can be occupied",
  },
];

async function seedJurisdictions() {
  console.log("Seeding jurisdiction rules...");

  try {
    // Massachusetts General Residential
    await db.insert(jurisdictionRules).values({
      jurisdictionCode: "MA",
      jurisdictionName: "Massachusetts (General Residential)",
      projectTypes: ["residential", "renovation", "adu"],
      rules: maResidentialRules,
    });
    console.log("  ✓ Massachusetts rules seeded");

    // Boston, MA
    await db.insert(jurisdictionRules).values({
      jurisdictionCode: "BOSTON_MA",
      jurisdictionName: "Boston, MA",
      projectTypes: ["residential", "commercial", "mixed_use", "renovation", "adu"],
      rules: bostonRules,
    });
    console.log("  ✓ Boston rules seeded");

    // Generic Multi-Family
    await db.insert(jurisdictionRules).values({
      jurisdictionCode: "GENERIC_MULTIFAMILY",
      jurisdictionName: "Generic Multi-Family Residential",
      projectTypes: ["residential", "mixed_use"],
      rules: multifamilyRules,
    });
    console.log("  ✓ Multi-Family rules seeded");

    console.log("\nJurisdiction seeding complete!");
  } catch (error) {
    console.error("Error seeding jurisdictions:", error);
    throw error;
  }
}

seedJurisdictions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
