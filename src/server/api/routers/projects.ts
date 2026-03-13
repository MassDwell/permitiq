import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { projects, documents, complianceItems, complianceSnapshots, projectMembers } from "@/db/schema";
import { eq, and, desc, count, sql, gte, lte, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sendProjectCreatedEmail } from "@/lib/email";
import { assertProjectAccess } from "../project-access";
import {
  BOSTON_BUILDING_REQUIREMENTS,
  BOSTON_DEMOLITION_REQUIREMENTS,
  BOSTON_TRADE_REQUIREMENTS,
  CAMBRIDGE_BUILDING_REQUIREMENTS,
  BROOKLINE_BUILDING_REQUIREMENTS,
  SALEM_BUILDING_REQUIREMENTS,
  LOWELL_BUILDING_REQUIREMENTS,
  SPRINGFIELD_BUILDING_REQUIREMENTS,
  MA_STATE_REQUIREMENTS,
  BOSTON_ARTICLE_80_LARGE_REQUIREMENTS,
  BOSTON_ARTICLE_80_SMALL_REQUIREMENTS,
  type RequirementData,
} from "@/lib/permit-requirements";

// Detect jurisdiction from address string
function detectJurisdictionFromAddress(address: string | undefined | null): string {
  if (!address) return "boston";
  const lower = address.toLowerCase();
  if (/cambridge/.test(lower)) return "cambridge";
  if (/brookline/.test(lower)) return "brookline";
  if (/somerville/.test(lower)) return "somerville";
  if (/salem/.test(lower)) return "salem";
  if (/lowell/.test(lower)) return "lowell";
  if (/springfield/.test(lower)) return "springfield";
  if (/\bma\b|massachusetts/.test(lower) && !/boston/.test(lower)) return "ma_statewide";
  return "boston";
}

// Detect permit category from project type
function detectPermitCategoryFromProjectType(
  projectType: string
): string {
  switch (projectType) {
    case "residential":
    case "commercial":
    case "mixed_use":
      return "building";
    case "renovation":
      return "building";
    case "adu":
      return "building";
    default:
      return "building";
  }
}

// Get requirements for jurisdiction + category
function getRequirementsForProject(
  jurisdiction: string,
  category: string
): RequirementData[] | null {
  if (jurisdiction === "boston") {
    if (category === "demolition") return BOSTON_DEMOLITION_REQUIREMENTS;
    if (category === "building") return BOSTON_BUILDING_REQUIREMENTS;
    if (category === "trade") return BOSTON_TRADE_REQUIREMENTS;
    if (category === "article_80_large") return BOSTON_ARTICLE_80_LARGE_REQUIREMENTS;
    if (category === "article_80_small") return BOSTON_ARTICLE_80_SMALL_REQUIREMENTS;
    return BOSTON_BUILDING_REQUIREMENTS;
  }
  if (jurisdiction === "cambridge") return CAMBRIDGE_BUILDING_REQUIREMENTS;
  if (jurisdiction === "brookline") return BROOKLINE_BUILDING_REQUIREMENTS;
  if (jurisdiction === "salem") return SALEM_BUILDING_REQUIREMENTS;
  if (jurisdiction === "lowell") return LOWELL_BUILDING_REQUIREMENTS;
  if (jurisdiction === "springfield") return SPRINGFIELD_BUILDING_REQUIREMENTS;
  if (jurisdiction === "ma_statewide") return MA_STATE_REQUIREMENTS;
  // Default fallback
  return MA_STATE_REQUIREMENTS;
}

// Get display name for jurisdiction
function getJurisdictionDisplay(jurisdiction: string): string {
  const map: Record<string, string> = {
    boston: "Boston, MA",
    cambridge: "Cambridge, MA",
    brookline: "Brookline, MA",
    somerville: "Somerville, MA",
    salem: "Salem, MA",
    lowell: "Lowell, MA",
    springfield: "Springfield, MA",
    ma_statewide: "Massachusetts",
  };
  return map[jurisdiction] ?? "Boston, MA";
}

export const projectsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    // Owned projects
    const ownedProjects = await ctx.db.query.projects.findMany({
      where: eq(projects.userId, ctx.dbUser.id),
      orderBy: [desc(projects.updatedAt)],
      with: {
        complianceItems: true,
        documents: true,
      },
    });

    // Projects where user is an accepted collaborator
    const memberships = await ctx.db.query.projectMembers.findMany({
      where: and(
        eq(projectMembers.userId, ctx.userId),
        eq(projectMembers.inviteStatus, "accepted"),
      ),
    });

    let collaboratorProjects: typeof ownedProjects = [];
    if (memberships.length > 0) {
      const memberProjectIds = memberships.map((m) => m.projectId);
      collaboratorProjects = await ctx.db.query.projects.findMany({
        where: inArray(projects.id, memberProjectIds),
        orderBy: [desc(projects.updatedAt)],
        with: {
          complianceItems: true,
          documents: true,
        },
      });
    }

    // Merge and sort by updatedAt (owned first for duplicates, but there shouldn't be any)
    const ownedIds = new Set(ownedProjects.map((p) => p.id));
    const allProjects = [
      ...ownedProjects,
      ...collaboratorProjects.filter((p) => !ownedIds.has(p.id)),
    ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // Calculate health scores
    return allProjects.map((project) => {
      const totalItems = project.complianceItems.length;
      const metItems = project.complianceItems.filter((i) => i.status === "met").length;
      const overdueItems = project.complianceItems.filter((i) => i.status === "overdue").length;
      const healthScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 100;

      let healthStatus: "green" | "yellow" | "red" = "green";
      if (overdueItems > 0) {
        healthStatus = "red";
      } else if (healthScore < 80) {
        healthStatus = "yellow";
      }

      return {
        ...project,
        healthScore,
        healthStatus,
        totalItems,
        metItems,
        overdueItems,
        documentCount: project.documents.length,
      };
    });
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify owner or accepted collaborator
      await assertProjectAccess(ctx.db, input.id, ctx.dbUser.id, ctx.userId);

      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, input.id),
        with: {
          complianceItems: {
            with: {
              document: true,
            },
            orderBy: [desc(complianceItems.deadline)],
          },
          documents: {
            orderBy: [desc(documents.createdAt)],
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Calculate health metrics
      const totalItems = project.complianceItems.length;
      const metItems = project.complianceItems.filter((i) => i.status === "met").length;
      const overdueItems = project.complianceItems.filter((i) => i.status === "overdue").length;
      const pendingItems = project.complianceItems.filter((i) => i.status === "pending").length;
      const healthScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 100;

      let healthStatus: "green" | "yellow" | "red" = "green";
      if (overdueItems > 0) {
        healthStatus = "red";
      } else if (healthScore < 80) {
        healthStatus = "yellow";
      }

      return {
        ...project,
        healthScore,
        healthStatus,
        totalItems,
        metItems,
        overdueItems,
        pendingItems,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        jurisdiction: z.string().optional(),
        projectType: z.enum(["residential", "commercial", "adu", "mixed_use", "renovation"]),
        description: z.string().optional(),
        unitCount: z.number().int().positive().optional(),
        grossFloorArea: z.number().int().positive().optional(),
        articleEightyTrack: z.enum(["none", "spr", "lpr"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check plan limits
      const projectCount = await ctx.db
        .select({ count: count() })
        .from(projects)
        .where(
          and(
            eq(projects.userId, ctx.dbUser.id),
            eq(projects.status, "active")
          )
        );

      // AUDIT-FIX: Updated limits to match pricing page — Solo(starter)=3, Developer(professional)=10, Portfolio(enterprise)=unlimited
      const maxProjects = ctx.dbUser.plan === "starter" ? 3 : ctx.dbUser.plan === "professional" ? 10 : Infinity;

      if (projectCount[0].count >= maxProjects) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Your ${ctx.dbUser.plan} plan allows a maximum of ${maxProjects} active project(s). Please upgrade to add more.`,
        });
      }

      const [newProject] = await ctx.db
        .insert(projects)
        .values({
          userId: ctx.dbUser.id,
          name: input.name,
          address: input.address,
          jurisdiction: input.jurisdiction,
          projectType: input.projectType,
          description: input.description,
          unitCount: input.unitCount,
          grossFloorArea: input.grossFloorArea,
          articleEightyTrack: input.articleEightyTrack,
        })
        .returning();

      // Send welcome email (fire-and-forget)
      sendProjectCreatedEmail({
        to: ctx.dbUser.email,
        userName: ctx.dbUser.name,
        projectName: newProject.name,
        projectId: newProject.id,
      }).catch((err) => console.error("[email] project created email failed:", err));

      // CLA-104: Auto-trigger requirements on project creation (fire-and-forget)
      const autoTriggerRequirements = async () => {
        try {
          // Detect jurisdiction from address
          const jurisdiction = detectJurisdictionFromAddress(newProject.address);
          const jurisdictionDisplay = getJurisdictionDisplay(jurisdiction);

          // Detect permit category from project type
          const category = detectPermitCategoryFromProjectType(newProject.projectType);

          // Get requirements for this jurisdiction + category
          const requirements = getRequirementsForProject(jurisdiction, category);

          if (requirements && requirements.length > 0) {
            // Insert compliance items for the new project
            await ctx.db.insert(complianceItems).values(
              requirements.map((r) => ({
                projectId: newProject.id,
                requirementType: r.requirementType,
                description: r.description,
                jurisdiction: jurisdictionDisplay,
                source: "rule_based" as const,
                sourceUrl: r.sourceUrl,
                sourceText: r.sourceText,
                reasoning: r.reasoning,
                status: "pending" as const,
              }))
            );
            console.log(
              `[auto-requirements] Created ${requirements.length} items for project ${newProject.id} (${jurisdictionDisplay})`
            );
          }
        } catch (err) {
          console.error("[auto-requirements] Failed to auto-trigger requirements:", err);
        }
      };

      // Fire-and-forget — don't await, don't block response
      autoTriggerRequirements();

      return newProject;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        jurisdiction: z.string().optional(),
        projectType: z.enum(["residential", "commercial", "adu", "mixed_use", "renovation"]).optional(),
        status: z.enum(["active", "completed", "on_hold", "archived"]).optional(),
        description: z.string().optional(),
        unitCount: z.number().int().positive().nullable().optional(),
        grossFloorArea: z.number().int().positive().nullable().optional(),
        articleEightyTrack: z.enum(["none", "spr", "lpr"]).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const [updated] = await ctx.db
        .update(projects)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(projects.id, id), eq(projects.userId, ctx.dbUser.id)))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(projects)
        .where(and(eq(projects.id, input.id), eq(projects.userId, ctx.dbUser.id)))
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return { success: true };
    }),

  takeSnapshot: protectedProcedure.mutation(async ({ ctx }) => {
    const userProjects = await ctx.db.query.projects.findMany({
      where: eq(projects.userId, ctx.dbUser.id),
      with: { complianceItems: true },
    });

    const snapshots = [];
    for (const project of userProjects) {
      const totalItems = project.complianceItems.length;
      const metItems = project.complianceItems.filter((i) => i.status === "met").length;
      const healthScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 100;

      const [snapshot] = await ctx.db
        .insert(complianceSnapshots)
        .values({
          projectId: project.id,
          userId: ctx.dbUser.id,
          healthScore,
          totalItems,
          metItems,
        })
        .returning();
      snapshots.push(snapshot);
    }

    return snapshots;
  }),

  getComplianceVelocity: protectedProcedure.query(async ({ ctx }) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28); // last 4 weeks

    const snapshots = await ctx.db.query.complianceSnapshots.findMany({
      where: and(
        eq(complianceSnapshots.userId, ctx.dbUser.id),
        gte(complianceSnapshots.snapshotDate, startDate)
      ),
      orderBy: [complianceSnapshots.snapshotDate],
    });

    // Bucket into 4 weekly buckets
    const now = new Date();
    const weeks: { label: string; scores: number[] }[] = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(now.getTime() - (3 - i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - (3 - i) * 7 * 24 * 60 * 60 * 1000);
      const label = i === 3 ? "This week" : `${3 - i}w ago`;
      const scores = snapshots
        .filter((s) => s.snapshotDate >= weekStart && s.snapshotDate < weekEnd)
        .map((s) => s.healthScore);
      return { label, scores };
    });

    return weeks.map((w) => ({
      label: w.label,
      avgScore: w.scores.length > 0 ? Math.round(w.scores.reduce((a, b) => a + b, 0) / w.scores.length) : null,
      snapshotCount: w.scores.length,
    }));
  }),

  getUpcomingDeadlines: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + input.days);

      const items = await ctx.db.query.complianceItems.findMany({
        where: and(
          sql`${complianceItems.deadline} >= ${now}`,
          sql`${complianceItems.deadline} <= ${futureDate}`,
          eq(complianceItems.status, "pending")
        ),
        with: {
          project: {
            columns: {
              id: true,
              name: true,
              userId: true,
            },
          },
        },
        orderBy: [complianceItems.deadline],
      });

      // Filter to only user's projects
      return items.filter((item) => item.project.userId === ctx.dbUser.id);
    }),

  getPortfolioStats: protectedProcedure.query(async ({ ctx }) => {
    const userProjects = await ctx.db.query.projects.findMany({
      where: eq(projects.userId, ctx.dbUser.id),
      orderBy: [desc(projects.updatedAt)],
      with: {
        complianceItems: true,
        documents: true,
      },
    });

    const now = new Date();
    const future60 = new Date();
    future60.setDate(future60.getDate() + 60);

    const projectStats = userProjects.map((project) => {
      const totalItems = project.complianceItems.length;
      const metItems = project.complianceItems.filter((i) => i.status === "met").length;
      const openItems = project.complianceItems.filter(
        (i) => i.status === "pending" || i.status === "overdue"
      ).length;
      const complianceScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 0;

      const pendingWithDeadline = project.complianceItems
        .filter((i) => (i.status === "pending" || i.status === "overdue") && i.deadline)
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

      const nextDeadline = pendingWithDeadline[0]?.deadline ?? null;
      const daysToDeadline = nextDeadline
        ? Math.ceil((new Date(nextDeadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      let status: "critical" | "attention" | "on-track" = "on-track";
      if (complianceScore < 30 || (daysToDeadline !== null && daysToDeadline < 7)) {
        status = "critical";
      } else if (complianceScore < 60 || (daysToDeadline !== null && daysToDeadline < 30)) {
        status = "attention";
      }

      return {
        id: project.id,
        name: project.name,
        address: project.address ?? null,
        complianceScore,
        nextDeadline: nextDeadline ? new Date(nextDeadline).toISOString() : null,
        daysToDeadline,
        openItems,
        status,
      };
    });

    const deadlineItems = await ctx.db.query.complianceItems.findMany({
      where: and(
        sql`${complianceItems.deadline} >= ${now}`,
        sql`${complianceItems.deadline} <= ${future60}`,
        eq(complianceItems.status, "pending")
      ),
      with: {
        project: {
          columns: { id: true, name: true, userId: true },
        },
      },
      orderBy: [complianceItems.deadline],
    });

    const upcomingDeadlines = deadlineItems
      .filter((item) => item.project.userId === ctx.dbUser.id)
      .map((item) => ({
        projectId: item.project.id,
        projectName: item.project.name,
        requirement: item.description,
        dueDate: item.deadline ? new Date(item.deadline).toISOString() : null,
        daysRemaining: item.deadline
          ? Math.ceil((new Date(item.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
      }));

    const totalProjects = projectStats.length;
    const avgComplianceScore =
      totalProjects > 0
        ? Math.round(projectStats.reduce((acc, p) => acc + p.complianceScore, 0) / totalProjects)
        : 0;
    const deadlinesNext30Days = upcomingDeadlines.filter(
      (d) => d.daysRemaining !== null && d.daysRemaining <= 30
    ).length;
    const projectsNeedingAttention = projectStats.filter((p) => p.complianceScore < 50).length;
    const activePermits = userProjects.reduce(
      (acc, p) => acc + p.complianceItems.filter((i) => i.status === "pending" || i.status === "in_progress").length,
      0
    );
    const docsProcessed = userProjects.reduce(
      (acc, p) => acc + p.documents.filter((d) => d.processingStatus === "completed").length,
      0
    );

    return {
      totalProjects,
      avgComplianceScore,
      deadlinesNext30Days,
      projectsNeedingAttention,
      activePermits,
      docsProcessed,
      projects: projectStats,
      upcomingDeadlines,
    };
  }),
});
