import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  users,
  projects,
  documents,
  complianceItems,
  alerts,
  userSettings,
} from "../src/db/schema";
import { eq } from "drizzle-orm";

config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("Seeding demo data...");

  try {
    // Check if demo user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "demo@meritlayer.com"))
      .limit(1);

    let demoUser;

    if (existingUser.length > 0) {
      demoUser = existingUser[0];
      console.log("  ℹ Demo user already exists");
    } else {
      // Create demo user
      const [newUser] = await db
        .insert(users)
        .values({
          clerkId: "demo_user_clerk_id",
          email: "demo@meritlayer.com",
          name: "Demo User",
          plan: "professional",
        })
        .returning();
      demoUser = newUser;
      console.log("  ✓ Demo user created");

      // Create user settings
      await db.insert(userSettings).values({
        userId: demoUser.id,
        emailAlerts: true,
        alertLeadDays: 7,
        dailyDigest: false,
      });
      console.log("  ✓ User settings created");
    }

    // Create demo project 1: Main Street Renovation
    const [project1] = await db
      .insert(projects)
      .values({
        userId: demoUser.id,
        name: "123 Main Street Renovation",
        address: "123 Main Street, Boston, MA 02108",
        jurisdiction: "BOSTON_MA",
        projectType: "renovation",
        description:
          "Full interior renovation of 3-story townhouse including new kitchen, bathrooms, and electrical upgrade.",
        status: "active",
      })
      .returning();
    console.log("  ✓ Project 1 created");

    // Create compliance items for project 1
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

    await db.insert(complianceItems).values([
      {
        projectId: project1.id,
        requirementType: "building_permit",
        description: "Building Permit Application",
        status: "met",
        jurisdiction: "BOSTON_MA",
        source: "manual",
        notes: "Permit #BP-2024-12345 issued",
      },
      {
        projectId: project1.id,
        requirementType: "electrical_permit",
        description: "Electrical Permit",
        status: "met",
        jurisdiction: "BOSTON_MA",
        source: "manual",
      },
      {
        projectId: project1.id,
        requirementType: "plumbing_permit",
        description: "Plumbing Permit",
        status: "pending",
        deadline: in7Days,
        jurisdiction: "BOSTON_MA",
        source: "manual",
        notes: "Application submitted, waiting for approval",
      },
      {
        projectId: project1.id,
        requirementType: "foundation_inspection",
        description: "Foundation Inspection",
        status: "met",
        jurisdiction: "BOSTON_MA",
        source: "rule_based",
      },
      {
        projectId: project1.id,
        requirementType: "framing_inspection",
        description: "Rough Framing Inspection",
        status: "pending",
        deadline: in3Days,
        jurisdiction: "BOSTON_MA",
        source: "rule_based",
        notes: "Schedule with inspector at least 48 hours in advance",
      },
      {
        projectId: project1.id,
        requirementType: "rough_electrical",
        description: "Rough Electrical Inspection",
        status: "pending",
        deadline: in14Days,
        jurisdiction: "BOSTON_MA",
        source: "rule_based",
      },
      {
        projectId: project1.id,
        requirementType: "energy_inspection",
        description: "Energy Code Compliance Documentation",
        status: "overdue",
        deadline: yesterday,
        jurisdiction: "BOSTON_MA",
        source: "manual",
        notes: "HERS rating report required",
      },
    ]);
    console.log("  ✓ Compliance items for project 1 created");

    // Create demo documents for project 1
    await db.insert(documents).values([
      {
        projectId: project1.id,
        userId: demoUser.id,
        filename: "Building_Permit_BP-2024-12345.pdf",
        storageUrl: "https://example.com/demo/building-permit.pdf",
        docType: "permit",
        processingStatus: "completed",
        processedAt: now,
        extractedData: {
          documentType: "permit",
          permitNumbers: ["BP-2024-12345"],
          issuingJurisdiction: "Boston ISD",
          issueDate: "2024-01-15",
          expirationDate: "2025-01-15",
          projectAddress: "123 Main Street, Boston, MA 02108",
          summary:
            "Building permit for interior renovation including kitchen, bathrooms, and electrical upgrade.",
        },
      },
      {
        projectId: project1.id,
        userId: demoUser.id,
        filename: "Electrical_Permit_EP-2024-67890.pdf",
        storageUrl: "https://example.com/demo/electrical-permit.pdf",
        docType: "permit",
        processingStatus: "completed",
        processedAt: now,
        extractedData: {
          documentType: "permit",
          permitNumbers: ["EP-2024-67890"],
          issuingJurisdiction: "Boston ISD",
          issueDate: "2024-01-20",
          summary: "Electrical permit for 200A panel upgrade and rewiring.",
        },
      },
      {
        projectId: project1.id,
        userId: demoUser.id,
        filename: "Architectural_Plans_v2.pdf",
        storageUrl: "https://example.com/demo/arch-plans.pdf",
        docType: "plan",
        processingStatus: "completed",
        processedAt: now,
        extractedData: {
          documentType: "plan",
          summary:
            "Architectural floor plans showing proposed layout for all three floors.",
        },
      },
    ]);
    console.log("  ✓ Documents for project 1 created");

    // Create demo project 2: ADU Construction
    const [project2] = await db
      .insert(projects)
      .values({
        userId: demoUser.id,
        name: "45 Oak Lane ADU",
        address: "45 Oak Lane, Cambridge, MA 02139",
        jurisdiction: "MA",
        projectType: "adu",
        description:
          "New 650 sq ft accessory dwelling unit (ADU) in backyard of existing single-family home.",
        status: "active",
      })
      .returning();
    console.log("  ✓ Project 2 created");

    // Create compliance items for project 2
    await db.insert(complianceItems).values([
      {
        projectId: project2.id,
        requirementType: "building_permit",
        description: "ADU Building Permit Application",
        status: "pending",
        deadline: in7Days,
        jurisdiction: "MA",
        source: "manual",
        notes: "Submitted, pending zoning review",
      },
      {
        projectId: project2.id,
        requirementType: "site_plan_approval",
        description: "Site Plan Approval",
        status: "pending",
        deadline: in14Days,
        jurisdiction: "MA",
        source: "rule_based",
      },
      {
        projectId: project2.id,
        requirementType: "septic_approval",
        description: "Septic System Approval",
        status: "met",
        jurisdiction: "MA",
        source: "manual",
        notes: "Tie-in to existing septic approved",
      },
      {
        projectId: project2.id,
        requirementType: "utility_connection",
        description: "Utility Connection Application",
        status: "pending",
        deadline: in30Days,
        jurisdiction: "MA",
        source: "manual",
      },
    ]);
    console.log("  ✓ Compliance items for project 2 created");

    // Create some alerts
    await db.insert(alerts).values([
      {
        userId: demoUser.id,
        projectId: project1.id,
        alertType: "deadline_3_days",
        message:
          "Rough Framing Inspection for 123 Main Street Renovation is due in 3 days. Schedule your inspection now.",
        isRead: false,
      },
      {
        userId: demoUser.id,
        projectId: project1.id,
        alertType: "overdue",
        message:
          "OVERDUE: Energy Code Compliance Documentation for 123 Main Street Renovation is past its deadline.",
        isRead: false,
      },
      {
        userId: demoUser.id,
        projectId: project1.id,
        alertType: "document_processed",
        message:
          "Document processed: Building_Permit_BP-2024-12345.pdf has been analyzed. 2 deadlines and 3 requirements extracted.",
        isRead: true,
        sentAt: now,
      },
    ]);
    console.log("  ✓ Alerts created");

    console.log("\nDemo data seeding complete!");
    console.log("\nDemo account:");
    console.log("  Email: demo@meritlayer.com");
    console.log("  Note: This account uses a mock Clerk ID. For real testing,");
    console.log(
      "        create a new account through the Clerk sign-up flow."
    );
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
