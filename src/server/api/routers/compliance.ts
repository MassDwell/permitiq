import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { complianceItems, projects, jurisdictionRules } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

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
