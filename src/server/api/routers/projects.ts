import { dispatchWebhook, createProjectCreatedPayload } from "@/lib/webhooks";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { projects, documents, complianceItems, complianceSnapshots, projectMembers, jurisdictionRules, jurisdictionRequests } from "@/db/schema";
import { eq, and, desc, count, sql, gte, lte, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sendProjectCreatedEmail } from "@/lib/email";
import { assertProjectAccess } from "../project-access";

import Anthropic from "@anthropic-ai/sdk";
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
} from "@/lib/permit-requirements";

// Helper functions for auto-triggering requirements research

function normalizeJurisdiction(jurisdiction: string): string {
  const lower = jurisdiction.toLowerCase();
  if (/cambridge/.test(lower)) return "cambridge";
  if (/somerville/.test(lower)) return "somerville";
  if (/quincy/.test(lower)) return "quincy";
  if (/newton/.test(lower)) return "newton";
  if (/waltham/.test(lower)) return "waltham";
  if (/dedham/.test(lower)) return "dedham";
  if (/westwood/.test(lower)) return "westwood";
  if (/needham/.test(lower)) return "needham";
  if (/norwood/.test(lower)) return "norwood";
  if (/canton/.test(lower)) return "canton";
  if (/brookline/.test(lower)) return "brookline";
  if (/salem/.test(lower)) return "salem";
  if (/lowell/.test(lower)) return "lowell";
  if (/springfield/.test(lower)) return "springfield";
  if (/\bma\b|massachusetts|statewide/.test(lower)) return "ma_statewide";
  if (/boston/.test(lower)) return "boston";
  return lower.split(/[,\s]/)[0] ?? "boston";
}

function detectJurisdiction(address: string): string {
  const lower = address.toLowerCase();
  if (/cambridge/.test(lower)) return "cambridge";
  if (/brookline/.test(lower)) return "brookline";
  if (/salem/.test(lower)) return "salem";
  if (/lowell/.test(lower)) return "lowell";
  if (/springfield/.test(lower)) return "springfield";
  if (/\bma\b|massachusetts|statewide|state-wide/.test(lower)) return "ma_statewide";
  return "boston";
}

function detectPermitCategory(projectType: string): string {
  const lower = projectType.toLowerCase();
  if (/demo(lition)?|tear.?down/.test(lower)) return "demolition";
  if (/trade|electrical|plumbing|gas\b|mechanical|hvac/.test(lower)) return "trade";
  if (/article.?80.*(large|lpr)|lpr|large.project.review/.test(lower)) return "article_80_large";
  if (/article.?80.*(small|spr)|spr|small.project.review/.test(lower)) return "article_80_small";
  if (/article.?80|bpda.review/.test(lower)) return "article_80_large";
  if (/building|construction|new.construction|addition|renovation|alteration|residential|commercial|adu|mixed_use/.test(lower)) return "building";
  return "building";
}

function getRequirementsForPermit(
  jurisdiction: string,
  category: string
): typeof BOSTON_DEMOLITION_REQUIREMENTS | null {
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
  if (category === "demolition") return BOSTON_DEMOLITION_REQUIREMENTS;
  if (category === "trade") return BOSTON_TRADE_REQUIREMENTS;
  if (category === "article_80_large") return BOSTON_ARTICLE_80_LARGE_REQUIREMENTS;
  if (category === "article_80_small") return BOSTON_ARTICLE_80_SMALL_REQUIREMENTS;
  return null;
}

// Auto-trigger requirements research for a new project (fire-and-forget)
async function autoTriggerRequirementsResearch(
  db: typeof import("@/db").db,
  projectId: string,
  projectType: string,
  address?: string,
  savedJurisdiction?: string
) {
  try {
    const jurisdiction = savedJurisdiction
      ? normalizeJurisdiction(savedJurisdiction)
      : address
      ? detectJurisdiction(address)
      : "boston";

    const category = detectPermitCategory(projectType);

    const JURISDICTION_DISPLAY: Record<string, string> = {
      boston: "Boston, MA",
      cambridge: "Cambridge, MA",
      brookline: "Brookline, MA",
      salem: "Salem, MA",
      lowell: "Lowell, MA",
      springfield: "Springfield, MA",
      ma_statewide: "Massachusetts",
    };
    const jurisdictionDisplay = JURISDICTION_DISPLAY[jurisdiction] ?? "Boston, MA";

    let requirementsData: Array<{
      requirementType: string;
      description: string;
      sourceUrl: string;
      sourceText: string;
      reasoning: string;
    }>;

    const curated = getRequirementsForPermit(jurisdiction, category);
    let isAiGenerated = false;

    if (curated) {
      requirementsData = curated;
    } else {
      // Unknown jurisdiction — check AI cache first
      const cacheKey = `AI_${jurisdiction.toUpperCase()}_${category.toUpperCase()}`;
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const cached = await db.query.jurisdictionRules.findFirst({
        where: eq(jurisdictionRules.jurisdictionCode, cacheKey),
      });

      if (
        cached &&
        cached.source === "ai_generated" &&
        cached.cachedAt &&
        cached.cachedAt > thirtyDaysAgo
      ) {
        requirementsData = cached.rules.map((r) => ({
          requirementType: r.requirementType,
          description: r.description,
          sourceUrl: (r as { sourceUrl?: string }).sourceUrl ?? "",
          sourceText: r.notes ?? "",
          reasoning: (r as { reasoning?: string }).reasoning ?? "",
        }));
        isAiGenerated = true;
      } else {
        // Fall back to Claude Haiku for unknown permit types
        const client = new Anthropic();
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(projectType + " permit requirements Massachusetts")}`;

        const message = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `List the key permit requirements for a "${projectType}" permit in Massachusetts. Return a JSON array of objects with fields: requirementType (snake_case identifier), description (clear one-line description), sourceText (a plausible regulatory citation from 780 CMR or local code), reasoning (one sentence explaining why it applies). Return only valid JSON, no markdown.`,
            },
          ],
        });

        try {
          const text =
            message.content[0].type === "text" ? message.content[0].text : "[]";
          const parsed = JSON.parse(text) as Array<{
            requirementType: string;
            description: string;
            sourceText: string;
            reasoning: string;
          }>;
          requirementsData = parsed.map((r) => ({
            ...r,
            sourceUrl: googleSearchUrl,
          }));
        } catch {
          requirementsData = MA_STATE_REQUIREMENTS;
        }

        // Cache the AI-generated rules
        const rulesToCache = requirementsData.map((r, i) => ({
          id: `${cacheKey.toLowerCase()}-${i + 1}`,
          requirementType: r.requirementType,
          description: r.description,
          isRequired: true,
          notes: r.sourceText,
          sourceUrl: r.sourceUrl,
          reasoning: r.reasoning,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })) as any;

        if (cached) {
          await db
            .update(jurisdictionRules)
            .set({
              rules: rulesToCache,
              source: "ai_generated",
              cachedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(jurisdictionRules.jurisdictionCode, cacheKey));
        } else {
          await db.insert(jurisdictionRules).values({
            jurisdictionCode: cacheKey,
            jurisdictionName: `${jurisdictionDisplay} (AI-generated)`,
            projectTypes: ["residential", "commercial", "adu", "mixed_use", "renovation"],
            rules: rulesToCache,
            source: "ai_generated",
            cachedAt: new Date(),
          });
        }

        isAiGenerated = true;

        // Upsert jurisdiction request queue
        const existing = await db.query.jurisdictionRequests.findFirst({
          where: eq(jurisdictionRequests.jurisdictionCode, cacheKey),
        });
        if (existing) {
          await db
            .update(jurisdictionRequests)
            .set({
              requestCount: existing.requestCount + 1,
              lastRequestedAt: new Date(),
            })
            .where(eq(jurisdictionRequests.jurisdictionCode, cacheKey));
        } else {
          await db.insert(jurisdictionRequests).values({
            jurisdictionCode: cacheKey,
            jurisdictionName: jurisdictionDisplay,
            requestCount: 1,
          });
        }
      }
    }

    // Insert compliance items
    await db
      .insert(complianceItems)
      .values(
        requirementsData.map((r) => ({
          projectId,
          requirementType: r.requirementType,
          description: r.description,
          jurisdiction: jurisdictionDisplay,
          source: isAiGenerated ? "ai_generated" : "rule_based",
          sourceUrl: r.sourceUrl,
          sourceText: r.sourceText,
          reasoning: r.reasoning,
          status: "pending" as const,
        }))
      );

    console.log(`[auto-research] Successfully generated ${requirementsData.length} requirements for project ${projectId}`);
  } catch (err) {
    console.error(`[auto-research] Failed to auto-generate requirements for project ${projectId}:`, err);
  }
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

      // Auto-trigger requirements research (fire-and-forget)
      autoTriggerRequirementsResearch(
        ctx.db,
        newProject.id,
        input.projectType,
        input.address,
        input.jurisdiction
      ).catch((err) => console.error("[auto-research] requirements research failed:", err));

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
