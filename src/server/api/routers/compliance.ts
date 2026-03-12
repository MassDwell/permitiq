import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { complianceItems, projects, jurisdictionRules, complianceSnapshots } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  BOSTON_BUILDING_REQUIREMENTS,
  BOSTON_TRADE_REQUIREMENTS,
  CAMBRIDGE_BUILDING_REQUIREMENTS,
  BROOKLINE_BUILDING_REQUIREMENTS,
  SALEM_BUILDING_REQUIREMENTS,
  LOWELL_BUILDING_REQUIREMENTS,
  SPRINGFIELD_BUILDING_REQUIREMENTS,
  MA_STATE_REQUIREMENTS,
} from "@/lib/permit-requirements";

// Detect jurisdiction from a free-text permit type string
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
  return null; // trigger AI fallback
}

const BOSTON_DEMOLITION_REQUIREMENTS = [
  {
    requirementType: "demolition_delay_approval",
    description: "Article 85 Demolition Delay approval from Boston Landmarks Commission",
    sourceUrl: "https://www.boston.gov/departments/landmarks-commission/how-file-article-85-demolition-review",
    sourceText: "You must obtain an Article 85 Demolition Delay approval from the Boston Landmarks Commission.",
    reasoning: "Required to verify building has no historic preservation status before demolition.",
  },
  {
    requirementType: "utility_shutoff_notices",
    description: "Utility shut-off notices (gas, electrical, telephone, cable)",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/how-get-demolition-permit",
    sourceText: "Shut off notices from all underground and overhead utilities, such as: gas, electrical, telephone and cable companies.",
    reasoning: "All utilities must be disconnected before demolition can begin safely.",
  },
  {
    requirementType: "bwsc_closed_gsa",
    description: "Boston Water and Sewer Commission (BWSC) closed GSA",
    sourceUrl: "https://www.bwsc.org/",
    sourceText: "The Boston Water and Sewer Commission closed general service agreement GSA.",
    reasoning: "Water and sewer connections must be formally closed and documented.",
  },
  {
    requirementType: "dep_hazmat_approval",
    description: "DEP hazardous materials approval",
    sourceUrl: "https://www.mass.gov/orgs/massachusetts-department-of-environmental-protection",
    sourceText: "Department of Environmental Protection (DEP) approval for hazardous materials 617-292-5500",
    reasoning: "Massachusetts DEP must approve hazardous material handling and disposal plan.",
  },
  {
    requirementType: "dig_safe_reference",
    description: "Dig Safe reference number",
    sourceUrl: "https://www.digsafe.com",
    sourceText: "Dig Safe reference number is required.",
    reasoning: "State law requires Dig Safe clearance before any ground disturbance.",
  },
  {
    requirementType: "pest_control_letter",
    description: "Pest control contractor letter",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/how-get-demolition-permit",
    sourceText: "A letter or bill from a pest control contractor stating the pest management will be performed before and after the demolition project begins.",
    reasoning: "Boston ISD requires documented pest management before and after demolition.",
  },
  {
    requirementType: "licensed_builder_documents",
    description: "Licensed builder + supporting documents (Workers Comp, Mattocks Higgins Affidavit, contract, liability insurance, builder license)",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/how-get-demolition-permit",
    sourceText: "A licensed builder is required with supporting documents, such as: the Workers Compensation Form, Mattocks Higgins Affidavit, contract between parties, liability insurance, copy of your builders license front and back side.",
    reasoning: "Boston ISD requires licensed contractor with full documentation package.",
  },
  {
    requirementType: "fire_prevention_permit",
    description: "Boston Fire Prevention permit",
    sourceUrl: "https://www.boston.gov/departments/fire-prevention",
    sourceText: "Obtain a permit from Boston Fire Prevention pertaining to the demolition.",
    reasoning: "Separate Fire Prevention permit required in addition to ISD demolition permit.",
  },
  {
    requirementType: "environmental_services_review",
    description: "Environmental Services Division review",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/how-get-demolition-permit",
    sourceText: "You will also need a review from our Environmental Services Division on the 4th floor here at 1010 Massachusetts Avenue, or isdenvironmental@boston.gov",
    reasoning: "ISD Environmental Services must review the demolition plan for environmental compliance.",
  },
];

export const complianceRouter = createTRPCRouter({
  listForProject: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
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

      if (!item || item.project.userId !== ctx.dbUser.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compliance item not found",
        });
      }

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
        status: z.enum(["pending", "met", "overdue", "not_applicable"]).optional(),
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

      // Filter rules applicable to this project type
      const applicableRules = ruleSet.rules.filter(
        (rule) =>
          !ruleSet.projectTypes ||
          ruleSet.projectTypes.length === 0 ||
          ruleSet.projectTypes.includes(project.projectType)
      );

      // Create compliance items for each rule
      const createdItems = [];
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
              jurisdiction: ruleSet.jurisdictionCode,
              notes: rule.notes,
              source: "rule_based",
              ruleId: rule.id,
              status: "pending",
            })
            .returning();

          createdItems.push(item);
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

      const jurisdiction = detectJurisdiction(input.permitType);
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

      const curated = getRequirementsForPermit(jurisdiction, category);

      if (curated) {
        requirementsData = curated;
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
          const text = message.content[0].type === "text" ? message.content[0].text : "[]";
          const parsed = JSON.parse(text) as Array<{
            requirementType: string;
            description: string;
            sourceText: string;
            reasoning: string;
          }>;
          requirementsData = parsed.map((r) => ({ ...r, sourceUrl: googleSearchUrl }));
        } catch {
          requirementsData = MA_STATE_REQUIREMENTS;
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
            source: "rule_based",
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
      };
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
});
