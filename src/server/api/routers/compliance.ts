import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { complianceItems, projects, jurisdictionRules, complianceSnapshots, jurisdictionRequests, complianceItemDocuments, documents } from "@/db/schema";
import { eq, and, desc, sql, isNull, lt } from "drizzle-orm";
import { assertProjectAccess } from "../project-access";
import { TRPCError } from "@trpc/server";
import Anthropic from "@anthropic-ai/sdk";
import { dispatchWebhook, createRequirementStatusPayload } from "@/lib/webhooks";
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

// Detect jurisdiction from a free-text permit type string
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

function detectJurisdiction(permitType: string): string {
  const lower = permitType.toLowerCase();
  if (/cambridge/.test(lower)) return "cambridge";
  if (/brookline/.test(lower)) return "brookline";
  if (/salem/.test(lower)) return "salem";
  if (/lowell/.test(lower)) return "lowell";
  if (/springfield/.test(lower)) return "springfield";
  if (/\bma\b|massachusetts|statewide|state-wide/.test(lower)) return "ma_statewide";
  return "boston"; // primary market default
}

// Detect permit category from a free-text permit type string
function detectPermitCategory(permitType: string): string {
  const lower = permitType.toLowerCase();
  if (/demo(lition)?|tear.?down/.test(lower)) return "demolition";
  if (/trade|electrical|plumbing|gas\b|mechanical|hvac/.test(lower)) return "trade";
  if (/article.?80.*(large|lpr)|lpr|large.project.review/.test(lower)) return "article_80_large";
  if (/article.?80.*(small|spr)|spr|small.project.review/.test(lower)) return "article_80_small";
  if (/article.?80|bpda.review/.test(lower)) return "article_80_large"; // default to LPR for generic "article 80"
  if (/building|construction|new.construction|addition|renovation|alteration/.test(lower)) return "building";
  return "unknown";
}

// Resolve requirements array for a given jurisdiction + category
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
    // Boston default: building
    return BOSTON_BUILDING_REQUIREMENTS;
  }
  if (jurisdiction === "cambridge") return CAMBRIDGE_BUILDING_REQUIREMENTS;
  if (jurisdiction === "brookline") return BROOKLINE_BUILDING_REQUIREMENTS;
  if (jurisdiction === "salem") return SALEM_BUILDING_REQUIREMENTS;
  if (jurisdiction === "lowell") return LOWELL_BUILDING_REQUIREMENTS;
  if (jurisdiction === "springfield") return SPRINGFIELD_BUILDING_REQUIREMENTS;
  if (jurisdiction === "ma_statewide") return MA_STATE_REQUIREMENTS;
  // Unknown jurisdiction — use MA state-wide as fallback before AI
  if (category === "demolition") return BOSTON_DEMOLITION_REQUIREMENTS;
  if (category === "trade") return BOSTON_TRADE_REQUIREMENTS;
  if (category === "article_80_large") return BOSTON_ARTICLE_80_LARGE_REQUIREMENTS;
  if (category === "article_80_small") return BOSTON_ARTICLE_80_SMALL_REQUIREMENTS;
  return null; // trigger AI fallback
}



export const complianceRouter = createTRPCRouter({
  listForProject: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await assertProjectAccess(ctx.db, input.projectId, ctx.dbUser.id, ctx.userId);

      return ctx.db.query.complianceItems.findMany({
        where: eq(complianceItems.projectId, input.projectId),
        orderBy: [complianceItems.deadline, desc(complianceItems.createdAt)],
        with: {
          document: {
            columns: {
              id: true,
              filename: true,
            },
          },
        },
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.query.complianceItems.findFirst({
        where: eq(complianceItems.id, input.id),
        with: {
          project: true,
          document: true,
        },
      });

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compliance item not found",
        });
      }

      await assertProjectAccess(ctx.db, item.project.id, ctx.dbUser.id, ctx.userId);

      return item;
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        requirementType: z.string(),
        description: z.string(),
        deadline: z.date().optional(),
        jurisdiction: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Custom compliance rules are enterprise-only
      if (ctx.dbUser.plan !== "enterprise") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Custom compliance rules require an Enterprise plan.",
        });
      }

      // Verify project ownership
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.dbUser.id)
        ),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const [item] = await ctx.db
        .insert(complianceItems)
        .values({
          projectId: input.projectId,
          requirementType: input.requirementType,
          description: input.description,
          deadline: input.deadline,
          jurisdiction: input.jurisdiction || project.jurisdiction,
          notes: input.notes,
          source: "manual",
          status: "pending",
        })
        .returning();

      return item;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["pending", "in_progress", "met", "overdue", "not_applicable"]).optional(),
        description: z.string().optional(),
        deadline: z.date().nullable().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      // Get existing item and verify ownership
      const existing = await ctx.db.query.complianceItems.findFirst({
        where: eq(complianceItems.id, id),
        with: {
          project: true,
        },
      });

      if (!existing || existing.project.userId !== ctx.dbUser.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compliance item not found",
        });
      }

      const [updated] = await ctx.db
        .update(complianceItems)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(complianceItems.id, id))
        .returning();

      // Dispatch webhook if status changed
      if (input.status && input.status !== existing.status) {
        dispatchWebhook(
          ctx.dbUser.id,
          "requirement.status_changed",
          createRequirementStatusPayload({
            projectId: existing.projectId,
            projectName: existing.project.name,
            requirementId: existing.id,
            requirementType: existing.requirementType,
            description: existing.description,
            oldStatus: existing.status,
            newStatus: input.status,
          })
        );
      }

      // Auto-snapshot: record health score after status change
      const allItems = await ctx.db.query.complianceItems.findMany({
        where: eq(complianceItems.projectId, existing.projectId),
      });
      const totalItems = allItems.length;
      const metItems = allItems.filter((i) => i.status === "met").length;
      const healthScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 100;
      await ctx.db.insert(complianceSnapshots).values({
        projectId: existing.projectId,
        userId: ctx.dbUser.id,
        healthScore,
        totalItems,
        metItems,
      });

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.complianceItems.findFirst({
        where: eq(complianceItems.id, input.id),
        with: {
          project: true,
        },
      });

      if (!existing || existing.project.userId !== ctx.dbUser.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compliance item not found",
        });
      }

      await ctx.db.delete(complianceItems).where(eq(complianceItems.id, input.id));

      return { success: true };
    }),

  // Apply jurisdiction rules to a project
  applyJurisdictionRules: protectedProcedure
    .input(z.object({ projectId: z.string().uuid(), jurisdictionCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.dbUser.id)
        ),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Get jurisdiction rules
      const ruleSet = await ctx.db.query.jurisdictionRules.findFirst({
        where: eq(jurisdictionRules.jurisdictionCode, input.jurisdictionCode),
      });

      if (!ruleSet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Jurisdiction rules not found",
        });
      }

      // Also fetch MA_STATE baseline rules (always merged in)
      const maStateRuleSet = input.jurisdictionCode !== "MA_STATE"
        ? await ctx.db.query.jurisdictionRules.findFirst({
            where: eq(jurisdictionRules.jurisdictionCode, "MA_STATE"),
          })
        : null;

      // Build combined list: jurisdiction-specific first, then MA_STATE baseline
      const ruleSetsToApply = [
        ruleSet,
        ...(maStateRuleSet ? [maStateRuleSet] : []),
      ];

      // Create compliance items for each rule set
      const createdItems = [];
      for (const rs of ruleSetsToApply) {
        // Filter rules applicable to this project type
        const applicableRules = rs.rules.filter(
          (rule) =>
            !rs.projectTypes ||
            rs.projectTypes.length === 0 ||
            rs.projectTypes.includes(project.projectType)
        );

        const itemSource = rs.source === "ai_generated" ? "ai_generated" : "rule_based";

        for (const rule of applicableRules) {
          // Check if item already exists
          const existing = await ctx.db.query.complianceItems.findFirst({
            where: and(
              eq(complianceItems.projectId, input.projectId),
              eq(complianceItems.ruleId, rule.id)
            ),
          });

          if (!existing) {
            const [item] = await ctx.db
              .insert(complianceItems)
              .values({
                projectId: input.projectId,
                requirementType: rule.requirementType,
                description: rule.description,
                jurisdiction: rs.jurisdictionCode,
                notes: rule.notes,
                source: itemSource,
                ruleId: rule.id,
                status: "pending",
              })
              .returning();

            createdItems.push(item);
          }
        }
      }

      // Update project jurisdiction
      await ctx.db
        .update(projects)
        .set({
          jurisdiction: ruleSet.jurisdictionCode,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, input.projectId));

      return { createdCount: createdItems.length, items: createdItems };
    }),

  // Get available jurisdiction rule sets
  getJurisdictions: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.jurisdictionRules.findMany({
      columns: {
        id: true,
        jurisdictionCode: true,
        jurisdictionName: true,
        projectTypes: true,
      },
    });
  }),

  // Auto-detect whether project needs Article 80 review based on jurisdiction, GFA, and unit count
  // Official thresholds (bostonplans.org):
  //   LPR: 50,000+ sq ft GFA
  //   SPR: 20,000+ sq ft GFA OR 15+ dwelling units (and under LPR threshold)
  //   None: <20,000 sq ft AND <15 units
  detectArticle80: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const project = await assertProjectAccess(ctx.db, input.projectId, ctx.dbUser.id, ctx.userId);

      const jurisdictionLower = (project.jurisdiction ?? "").toLowerCase();
      const isBoston = /boston/.test(jurisdictionLower);

      if (!isBoston) {
        return { applies: false, reviewType: "none" as const };
      }

      const gfa = project.grossFloorArea ?? 0;
      const units = project.unitCount ?? 0;

      if (gfa >= 50000) {
        return { applies: true, reviewType: "lpr" as const };
      }
      if (gfa >= 20000 || units >= 15) {
        return { applies: true, reviewType: "spr" as const };
      }
      return { applies: false, reviewType: "none" as const };
    }),

  researchRequirements: protectedProcedure
    .input(z.object({ projectId: z.string().uuid(), permitType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.dbUser.id)
        ),
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      // Prefer saved project jurisdiction over permit-type parsing
      const jurisdiction = project.jurisdiction
        ? normalizeJurisdiction(project.jurisdiction)
        : detectJurisdiction(input.permitType);
      const category = detectPermitCategory(input.permitType);

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

      // Dedup: remove any existing items for this project+jurisdiction+category before re-inserting
      const existingForCategory = await ctx.db.query.complianceItems.findMany({
        where: and(
          eq(complianceItems.projectId, input.projectId),
          eq(complianceItems.jurisdiction, JURISDICTION_DISPLAY[jurisdiction] ?? "Boston, MA")
        ),
        columns: { id: true },
      });
      if (existingForCategory.length > 0) {
        await ctx.db.delete(complianceItems).where(
          and(
            eq(complianceItems.projectId, input.projectId),
            eq(complianceItems.jurisdiction, JURISDICTION_DISPLAY[jurisdiction] ?? "Boston, MA")
          )
        );
      }

      const curated = getRequirementsForPermit(jurisdiction, category);
      let isAiGenerated = false;

      if (curated) {
        requirementsData = curated;
      } else {
        // Unknown jurisdiction — check AI cache first
        const cacheKey = `AI_${jurisdiction.toUpperCase()}_${category.toUpperCase()}`;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const cached = await ctx.db.query.jurisdictionRules.findFirst({
          where: eq(jurisdictionRules.jurisdictionCode, cacheKey),
        });

        if (
          cached &&
          cached.source === "ai_generated" &&
          cached.cachedAt &&
          cached.cachedAt > thirtyDaysAgo
        ) {
          // Use cached AI-generated rules
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
          const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(input.permitType + " permit requirements Massachusetts")}`;

          const message = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            messages: [
              {
                role: "user",
                content: `List the key permit requirements for a "${input.permitType}" permit in Massachusetts. Return a JSON array of objects with fields: requirementType (snake_case identifier), description (clear one-line description), sourceText (a plausible regulatory citation from 780 CMR or local code), reasoning (one sentence explaining why it applies). Return only valid JSON, no markdown.`,
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

          // Cache the AI-generated rules in jurisdictionRules
          // We store extra fields (sourceUrl, reasoning) in the JSONB alongside JurisdictionRule fields
          const rulesToCache = requirementsData.map((r, i) => ({
            id: `${cacheKey.toLowerCase()}-${i + 1}`,
            requirementType: r.requirementType,
            description: r.description,
            isRequired: true,
            notes: r.sourceText,
            // Extra fields stored in JSONB (not in TypeScript type but persisted)
            sourceUrl: r.sourceUrl,
            reasoning: r.reasoning,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          })) as any;

          if (cached) {
            await ctx.db
              .update(jurisdictionRules)
              .set({
                rules: rulesToCache,
                source: "ai_generated",
                cachedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(jurisdictionRules.jurisdictionCode, cacheKey));
          } else {
            await ctx.db.insert(jurisdictionRules).values({
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
          const jurisdictionCode = cacheKey;
          const existing = await ctx.db.query.jurisdictionRequests.findFirst({
            where: eq(jurisdictionRequests.jurisdictionCode, jurisdictionCode),
          });
          if (existing) {
            await ctx.db
              .update(jurisdictionRequests)
              .set({
                requestCount: existing.requestCount + 1,
                lastRequestedAt: new Date(),
              })
              .where(eq(jurisdictionRequests.jurisdictionCode, jurisdictionCode));
          } else {
            await ctx.db.insert(jurisdictionRequests).values({
              jurisdictionCode,
              jurisdictionName: jurisdictionDisplay,
              requestCount: 1,
            });
          }
        }
      }

      const insertedItems = await ctx.db
        .insert(complianceItems)
        .values(
          requirementsData.map((r) => ({
            projectId: input.projectId,
            requirementType: r.requirementType,
            description: r.description,
            jurisdiction: jurisdictionDisplay,
            source: isAiGenerated ? "ai_generated" : "rule_based",
            sourceUrl: r.sourceUrl,
            sourceText: r.sourceText,
            reasoning: r.reasoning,
            status: "pending" as const,
          }))
        )
        .returning();

      return {
        items: insertedItems,
        jurisdiction: jurisdictionDisplay,
        permitType: input.permitType,
        isAiGenerated,
      };
    }),

  // Toggle an Article 80 step — upserts if missing, cycles pending → in_progress → met → pending
  toggleArticle80Step: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        stepId: z.string(), // requirementType / step id
        stepDescription: z.string(),
        currentStatus: z.enum(["pending", "in_progress", "met"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.dbUser.id)
        ),
      });
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      // Cycle: pending → in_progress → met → pending
      const nextStatus =
        input.currentStatus === "pending"
          ? "in_progress"
          : input.currentStatus === "in_progress"
          ? "met"
          : "pending";

      // Try to find existing compliance item for this step
      const existing = await ctx.db.query.complianceItems.findFirst({
        where: and(
          eq(complianceItems.projectId, input.projectId),
          eq(complianceItems.requirementType, input.stepId)
        ),
      });

      if (existing) {
        const [updated] = await ctx.db
          .update(complianceItems)
          .set({ status: nextStatus, updatedAt: new Date() })
          .where(eq(complianceItems.id, existing.id))
          .returning();
        return updated;
      } else {
        // Create the compliance item for this Article 80 step
        const [created] = await ctx.db
          .insert(complianceItems)
          .values({
            projectId: input.projectId,
            requirementType: input.stepId,
            description: input.stepDescription,
            jurisdiction: project.jurisdiction ?? "BOSTON_ISD",
            source: "rule_based",
            status: nextStatus,
          })
          .returning();
        return created;
      }
    }),

  // Check for overdue items and update status
  checkOverdueItems: protectedProcedure.mutation(async ({ ctx }) => {
    const now = new Date();

    // Find all pending items with past deadlines for user's projects
    const userProjects = await ctx.db.query.projects.findMany({
      where: eq(projects.userId, ctx.dbUser.id),
      columns: { id: true },
    });

    const projectIds = userProjects.map((p) => p.id);

    if (projectIds.length === 0) {
      return { updatedCount: 0 };
    }

    const result = await ctx.db
      .update(complianceItems)
      .set({ status: "overdue", updatedAt: new Date() })
      .where(
        and(
          sql`${complianceItems.projectId} IN ${projectIds}`,
          eq(complianceItems.status, "pending"),
          sql`${complianceItems.deadline} < ${now}`
        )
      )
      .returning();

    return { updatedCount: result.length };
  }),

  // CLA-108: Attach a document to a compliance item
  attachDocument: protectedProcedure
    .input(z.object({
      complianceItemId: z.string().uuid(),
      documentId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify compliance item exists and user has access
      const item = await ctx.db.query.complianceItems.findFirst({
        where: eq(complianceItems.id, input.complianceItemId),
        with: { project: true },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Compliance item not found" });
      }

      await assertProjectAccess(ctx.db, item.project.id, ctx.dbUser.id, ctx.userId);

      // Verify document exists and belongs to the same project
      const doc = await ctx.db.query.documents.findFirst({
        where: and(
          eq(documents.id, input.documentId),
          eq(documents.projectId, item.project.id)
        ),
      });

      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found in this project" });
      }

      // Check if already attached
      const existing = await ctx.db.query.complianceItemDocuments.findFirst({
        where: and(
          eq(complianceItemDocuments.complianceItemId, input.complianceItemId),
          eq(complianceItemDocuments.documentId, input.documentId)
        ),
      });

      if (existing) {
        return existing; // Already attached
      }

      const [record] = await ctx.db
        .insert(complianceItemDocuments)
        .values({
          complianceItemId: input.complianceItemId,
          documentId: input.documentId,
        })
        .returning();

      return record;
    }),

  // CLA-108: Detach a document from a compliance item
  detachDocument: protectedProcedure
    .input(z.object({
      complianceItemId: z.string().uuid(),
      documentId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify compliance item exists and user has access
      const item = await ctx.db.query.complianceItems.findFirst({
        where: eq(complianceItems.id, input.complianceItemId),
        with: { project: true },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Compliance item not found" });
      }

      await assertProjectAccess(ctx.db, item.project.id, ctx.dbUser.id, ctx.userId);

      await ctx.db
        .delete(complianceItemDocuments)
        .where(
          and(
            eq(complianceItemDocuments.complianceItemId, input.complianceItemId),
            eq(complianceItemDocuments.documentId, input.documentId)
          )
        );

      return { success: true };
    }),

  // CLA-108: Get compliance items with their attached documents
  getItemsWithDocuments: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await assertProjectAccess(ctx.db, input.projectId, ctx.dbUser.id, ctx.userId);

      return ctx.db.query.complianceItems.findMany({
        where: eq(complianceItems.projectId, input.projectId),
        orderBy: [complianceItems.deadline, desc(complianceItems.createdAt)],
        with: {
          document: {
            columns: {
              id: true,
              filename: true,
            },
          },
          attachedDocuments: {
            with: {
              document: {
                columns: {
                  id: true,
                  filename: true,
                  storageUrl: true,
                  docType: true,
                },
              },
            },
          },
        },
      });
    }),

  // CLA-111: Set the submitted date for a compliance item
  setSubmittedDate: protectedProcedure
    .input(z.object({
      complianceItemId: z.string().uuid(),
      submittedAt: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.query.complianceItems.findFirst({
        where: eq(complianceItems.id, input.complianceItemId),
        with: { project: true },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Compliance item not found" });
      }

      await assertProjectAccess(ctx.db, item.project.id, ctx.dbUser.id, ctx.userId);

      const [updated] = await ctx.db
        .update(complianceItems)
        .set({
          submittedAt: input.submittedAt,
          status: "in_progress", // Auto-set to in_progress when submitted
          updatedAt: new Date(),
        })
        .where(eq(complianceItems.id, input.complianceItemId))
        .returning();

      return updated;
    }),

  // CLA-111: Snooze follow-up reminders for a compliance item
  snoozeFollowUp: protectedProcedure
    .input(z.object({
      complianceItemId: z.string().uuid(),
      days: z.number().min(1).max(90).default(7),
    }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.query.complianceItems.findFirst({
        where: eq(complianceItems.id, input.complianceItemId),
        with: { project: true },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Compliance item not found" });
      }

      await assertProjectAccess(ctx.db, item.project.id, ctx.dbUser.id, ctx.userId);

      const snoozedUntil = new Date();
      snoozedUntil.setDate(snoozedUntil.getDate() + input.days);

      const [updated] = await ctx.db
        .update(complianceItems)
        .set({
          followUpSnoozedUntil: snoozedUntil,
          updatedAt: new Date(),
        })
        .where(eq(complianceItems.id, input.complianceItemId))
        .returning();

      return updated;
    }),

  // CLA-111: Get items pending follow-up (submitted >7 days ago, still in_progress, not snoozed)
  getPendingFollowUps: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await assertProjectAccess(ctx.db, input.projectId, ctx.dbUser.id, ctx.userId);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const now = new Date();

      // Get items where:
      // - submitted_at IS NOT NULL
      // - status = 'in_progress'
      // - (follow_up_snoozed_until IS NULL OR follow_up_snoozed_until < NOW())
      // - submitted_at < NOW() - 7 days
      const items = await ctx.db.query.complianceItems.findMany({
        where: and(
          eq(complianceItems.projectId, input.projectId),
          eq(complianceItems.status, "in_progress"),
          sql`${complianceItems.submittedAt} IS NOT NULL`,
          lt(complianceItems.submittedAt, sevenDaysAgo),
          sql`(${complianceItems.followUpSnoozedUntil} IS NULL OR ${complianceItems.followUpSnoozedUntil} < ${now})`
        ),
        with: {
          project: {
            columns: {
              id: true,
              name: true,
              address: true,
              jurisdiction: true,
            },
          },
        },
      });

      return items;
    }),
});
