import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { permitWorkflows, permitComments, projects } from "@/db/schema";
import { eq, and, desc, count, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
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

type PermitCategory =
  | "building"
  | "demolition"
  | "electrical"
  | "plumbing"
  | "gas"
  | "hvac"
  | "zba_variance"
  | "article_80_small"
  | "article_80_large"
  | "bpda_review"
  | "foundation"
  | "excavation"
  | "certificate_of_occupancy"
  | "other";

function getRequirementsSummary(
  permitCategory: PermitCategory,
  jurisdiction: string | null | undefined
): string[] {
  const jur = (jurisdiction ?? "").toLowerCase();
  const isTrade = ["electrical", "plumbing", "gas", "hvac"].includes(permitCategory);
  const isBuilding = permitCategory === "building";

  if (isTrade) {
    if (jur.includes("boston")) return BOSTON_TRADE_REQUIREMENTS.map((r) => r.description);
    return MA_STATE_REQUIREMENTS.filter((r) =>
      ["trade_permits_separate", "insurance_certificates", "contractor_license"].includes(r.requirementType)
    ).map((r) => r.description);
  }

  if (isBuilding) {
    if (jur.includes("boston")) return BOSTON_BUILDING_REQUIREMENTS.map((r) => r.description);
    if (jur.includes("cambridge")) return CAMBRIDGE_BUILDING_REQUIREMENTS.map((r) => r.description);
    if (jur.includes("brookline")) return BROOKLINE_BUILDING_REQUIREMENTS.map((r) => r.description);
    if (jur.includes("salem")) return SALEM_BUILDING_REQUIREMENTS.map((r) => r.description);
    if (jur.includes("lowell")) return LOWELL_BUILDING_REQUIREMENTS.map((r) => r.description);
    if (jur.includes("springfield")) return SPRINGFIELD_BUILDING_REQUIREMENTS.map((r) => r.description);
    return MA_STATE_REQUIREMENTS.map((r) => r.description);
  }

  // For demolition, foundation, excavation — include asbestos/dig safe from MA state
  if (["demolition", "foundation", "excavation"].includes(permitCategory)) {
    return MA_STATE_REQUIREMENTS.filter((r) =>
      ["asbestos_abatement_docs", "dig_safe", "contractor_license", "sealed_plans"].includes(r.requirementType)
    ).map((r) => r.description);
  }

  return [];
}

const permitWorkflowUpdateInput = z.object({
  id: z.string().uuid(),
  assignedTo: z.string().optional(),
  assignedToEmail: z.string().email().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  estimatedFee: z.number().int().optional().nullable(),
  actualFee: z.number().int().optional().nullable(),
  permitNumber: z.string().optional().nullable(),
});

export const permitWorkflowsRouter = createTRPCRouter({
  getByProject: protectedProcedure
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const workflows = await ctx.db.query.permitWorkflows.findMany({
        where: eq(permitWorkflows.projectId, input.projectId),
        orderBy: [desc(permitWorkflows.createdAt)],
      });

      if (workflows.length === 0) return [];

      const commentCounts = await ctx.db
        .select({
          permitWorkflowId: permitComments.permitWorkflowId,
          count: count(),
        })
        .from(permitComments)
        .where(
          inArray(
            permitComments.permitWorkflowId,
            workflows.map((w) => w.id)
          )
        )
        .groupBy(permitComments.permitWorkflowId);

      const countMap = new Map(commentCounts.map((c) => [c.permitWorkflowId, c.count]));

      return workflows.map((w) => ({ ...w, commentCount: countMap.get(w.id) ?? 0 }));
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const workflow = await ctx.db.query.permitWorkflows.findFirst({
        where: and(
          eq(permitWorkflows.id, input.id),
          eq(permitWorkflows.userId, ctx.dbUser.id)
        ),
        with: {
          comments: {
            orderBy: [desc(permitComments.createdAt)],
          },
        },
      });

      if (!workflow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Permit workflow not found" });
      }

      return workflow;
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        permitCategory: z.enum([
          "building",
          "demolition",
          "electrical",
          "plumbing",
          "gas",
          "hvac",
          "zba_variance",
          "article_80_small",
          "article_80_large",
          "bpda_review",
          "foundation",
          "excavation",
          "certificate_of_occupancy",
          "other",
        ]),
        permitName: z.string().min(1),
        jurisdiction: z.string().optional(),
        assignedTo: z.string().optional(),
        assignedToEmail: z.string().email().optional(),
        dueDate: z.date().optional(),
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const jurisdiction = input.jurisdiction ?? project.jurisdiction;
      const requirementsSummary = getRequirementsSummary(input.permitCategory, jurisdiction);

      const [newWorkflow] = await ctx.db
        .insert(permitWorkflows)
        .values({
          projectId: input.projectId,
          userId: ctx.dbUser.id,
          permitCategory: input.permitCategory,
          permitName: input.permitName,
          jurisdiction,
          assignedTo: input.assignedTo,
          assignedToEmail: input.assignedToEmail,
          dueDate: input.dueDate,
          notes: input.notes,
          requirementsSummary: requirementsSummary.length > 0 ? requirementsSummary : null,
          status: "not_started",
        })
        .returning();

      return newWorkflow;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum([
          "not_started",
          "in_progress",
          "submitted",
          "under_review",
          "approved",
          "rejected",
          "on_hold",
        ]),
        permitNumber: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.permitWorkflows.findFirst({
        where: and(
          eq(permitWorkflows.id, input.id),
          eq(permitWorkflows.userId, ctx.dbUser.id)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Permit workflow not found" });
      }

      const now = new Date();
      const [updated] = await ctx.db
        .update(permitWorkflows)
        .set({
          status: input.status,
          ...(input.permitNumber !== undefined ? { permitNumber: input.permitNumber } : {}),
          ...(input.status === "submitted" && !existing.submittedAt ? { submittedAt: now } : {}),
          ...(input.status === "approved" && !existing.approvedAt ? { approvedAt: now } : {}),
          updatedAt: now,
        })
        .where(eq(permitWorkflows.id, input.id))
        .returning();

      return updated;
    }),

  update: protectedProcedure
    .input(permitWorkflowUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.permitWorkflows.findFirst({
        where: and(
          eq(permitWorkflows.id, input.id),
          eq(permitWorkflows.userId, ctx.dbUser.id)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Permit workflow not found" });
      }

      const { id, ...rest } = input;

      const [updated] = await ctx.db
        .update(permitWorkflows)
        .set({ ...rest, updatedAt: new Date() })
        .where(eq(permitWorkflows.id, id))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(permitWorkflows)
        .where(
          and(
            eq(permitWorkflows.id, input.id),
            eq(permitWorkflows.userId, ctx.dbUser.id)
          )
        )
        .returning();

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Permit workflow not found" });
      }

      return { success: true };
    }),

  addComment: protectedProcedure
    .input(
      z.object({
        permitWorkflowId: z.string().uuid(),
        content: z.string().min(1),
        commentType: z.enum(["note", "rejection", "approval_comment", "internal"]).default("note"),
        source: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the workflow belongs to the user
      const workflow = await ctx.db.query.permitWorkflows.findFirst({
        where: and(
          eq(permitWorkflows.id, input.permitWorkflowId),
          eq(permitWorkflows.userId, ctx.dbUser.id)
        ),
      });

      if (!workflow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Permit workflow not found" });
      }

      const [comment] = await ctx.db
        .insert(permitComments)
        .values({
          permitWorkflowId: input.permitWorkflowId,
          userId: ctx.dbUser.id,
          content: input.content,
          commentType: input.commentType,
          source: input.source,
        })
        .returning();

      return comment;
    }),

  getComments: protectedProcedure
    .input(z.object({ permitWorkflowId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const workflow = await ctx.db.query.permitWorkflows.findFirst({
        where: and(
          eq(permitWorkflows.id, input.permitWorkflowId),
          eq(permitWorkflows.userId, ctx.dbUser.id)
        ),
      });

      if (!workflow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Permit workflow not found" });
      }

      return ctx.db.query.permitComments.findMany({
        where: eq(permitComments.permitWorkflowId, input.permitWorkflowId),
        orderBy: [desc(permitComments.createdAt)],
      });
    }),
});
