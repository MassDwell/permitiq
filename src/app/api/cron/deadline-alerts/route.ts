import { NextResponse } from "next/server";
import { db } from "@/db";
import { complianceItems, alerts, users, projects, userSettings } from "@/db/schema";
import { eq, and, sql, lte, gte, isNull, or } from "drizzle-orm";
import { Resend } from "resend";
import { generateAlertMessage } from "@/lib/ai/document-processor";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow in development or if no secret is set
    if (process.env.NODE_ENV === "production" && process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate date ranges
    const in1Day = new Date(today);
    in1Day.setDate(in1Day.getDate() + 1);

    const in3Days = new Date(today);
    in3Days.setDate(in3Days.getDate() + 3);

    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    // Find all pending compliance items with upcoming deadlines
    const upcomingItems = await db.query.complianceItems.findMany({
      where: and(
        eq(complianceItems.status, "pending"),
        lte(complianceItems.deadline, in7Days),
        gte(complianceItems.deadline, today)
      ),
      with: {
        project: {
          with: {
            user: {
              with: {
                settings: true,
              },
            },
          },
        },
      },
    });

    // Find overdue items
    const overdueItems = await db.query.complianceItems.findMany({
      where: and(
        eq(complianceItems.status, "pending"),
        lte(complianceItems.deadline, today)
      ),
      with: {
        project: {
          with: {
            user: {
              with: {
                settings: true,
              },
            },
          },
        },
      },
    });

    // Mark overdue items
    for (const item of overdueItems) {
      await db
        .update(complianceItems)
        .set({ status: "overdue", updatedAt: new Date() })
        .where(eq(complianceItems.id, item.id));
    }

    const alertsSent: string[] = [];
    const emailsSent: string[] = [];

    // Process upcoming deadlines
    for (const item of upcomingItems) {
      if (!item.deadline || !item.project.user) continue;

      const settings = item.project.user.settings;
      const deadline = new Date(item.deadline);
      const daysUntil = Math.ceil(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine alert type
      let alertType: "deadline_7_days" | "deadline_3_days" | "deadline_1_day" | null = null;

      if (daysUntil <= 1) {
        alertType = "deadline_1_day";
      } else if (daysUntil <= 3) {
        alertType = "deadline_3_days";
      } else if (daysUntil <= 7) {
        alertType = "deadline_7_days";
      }

      if (!alertType) continue;

      // Check if we already sent this alert today
      const existingAlert = await db.query.alerts.findFirst({
        where: and(
          eq(alerts.complianceItemId, item.id),
          eq(alerts.alertType, alertType),
          gte(alerts.createdAt, today)
        ),
      });

      if (existingAlert) continue;

      // Generate alert message using AI
      const message = await generateAlertMessage(
        {
          description: item.description,
          deadline: item.deadline,
          requirementType: item.requirementType,
        },
        item.project.name,
        daysUntil
      );

      // Create in-app alert
      const [newAlert] = await db
        .insert(alerts)
        .values({
          userId: item.project.user.id,
          projectId: item.projectId,
          complianceItemId: item.id,
          alertType,
          message,
        })
        .returning();

      alertsSent.push(newAlert.id);

      // Send email if enabled
      if (settings?.emailAlerts && process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "PermitIQ <alerts@permitiq.com>",
            to: item.project.user.email,
            subject: `Deadline Alert: ${item.description}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1f2937;">Deadline Alert</h2>
                <p style="color: #4b5563;">${message}</p>
                <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <p style="margin: 0; color: #1f2937;"><strong>Project:</strong> ${item.project.name}</p>
                  <p style="margin: 8px 0 0; color: #1f2937;"><strong>Requirement:</strong> ${item.description}</p>
                  <p style="margin: 8px 0 0; color: #1f2937;"><strong>Deadline:</strong> ${deadline.toLocaleDateString()}</p>
                </div>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${item.projectId}"
                   style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  View Project
                </a>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
                  You're receiving this because you have deadline alerts enabled.
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">Manage preferences</a>
                </p>
              </div>
            `,
          });

          // Update alert with sent timestamp
          await db
            .update(alerts)
            .set({ sentAt: new Date() })
            .where(eq(alerts.id, newAlert.id));

          emailsSent.push(item.project.user.email);
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      }
    }

    // Process overdue items
    for (const item of overdueItems) {
      if (!item.project.user) continue;

      const settings = item.project.user.settings;

      // Check if we already sent overdue alert today
      const existingAlert = await db.query.alerts.findFirst({
        where: and(
          eq(alerts.complianceItemId, item.id),
          eq(alerts.alertType, "overdue"),
          gte(alerts.createdAt, today)
        ),
      });

      if (existingAlert) continue;

      const message = `OVERDUE: ${item.description} for project ${item.project.name} is past its deadline.`;

      // Create in-app alert
      const [newAlert] = await db
        .insert(alerts)
        .values({
          userId: item.project.user.id,
          projectId: item.projectId,
          complianceItemId: item.id,
          alertType: "overdue",
          message,
        })
        .returning();

      alertsSent.push(newAlert.id);

      // Send email if enabled
      if (settings?.emailAlerts && process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "PermitIQ <alerts@permitiq.com>",
            to: item.project.user.email,
            subject: `OVERDUE: ${item.description}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Overdue Alert</h2>
                <p style="color: #4b5563;">${message}</p>
                <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #dc2626;">
                  <p style="margin: 0; color: #1f2937;"><strong>Project:</strong> ${item.project.name}</p>
                  <p style="margin: 8px 0 0; color: #1f2937;"><strong>Requirement:</strong> ${item.description}</p>
                  <p style="margin: 8px 0 0; color: #dc2626;"><strong>Status:</strong> OVERDUE</p>
                </div>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${item.projectId}"
                   style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Take Action Now
                </a>
              </div>
            `,
          });

          await db
            .update(alerts)
            .set({ sentAt: new Date() })
            .where(eq(alerts.id, newAlert.id));

          emailsSent.push(item.project.user.email);
        } catch (emailError) {
          console.error("Failed to send overdue email:", emailError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      alertsCreated: alertsSent.length,
      emailsSent: emailsSent.length,
      overdueMarked: overdueItems.length,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to process deadline alerts" },
      { status: 500 }
    );
  }
}
