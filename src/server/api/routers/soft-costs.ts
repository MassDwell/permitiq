import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { softCosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { assertProjectAccess } from "../project-access";

const CATEGORIES = [
  "legal",
  "architectural",
  "engineering",
  "survey",
  "permit_fees",
  "consulting",
  "other",
] as const;

export const softCostsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertProjectAccess(ctx.db, input.projectId, ctx.dbUser.id, ctx.userId);
      return ctx.db
        .select()
        .from(softCosts)
        .where(eq(softCosts.projectId, input.projectId))
        .orderBy(softCosts.createdAt);
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        category: z.enum(CATEGORIES),
        description: z.string().min(1),
        vendor: z.string().optional(),
        amount: z.number().int().positive(), // cents
        isPaid: z.boolean().optional().default(false),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertProjectAccess(ctx.db, input.projectId, ctx.dbUser.id, ctx.userId);
      const [row] = await ctx.db
        .insert(softCosts)
        .values({
          projectId: input.projectId,
          category: input.category,
          description: input.description,
          vendor: input.vendor ?? null,
          amount: input.amount,
          isPaid: input.isPaid ?? false,
          paidAt: input.isPaid ? new Date() : null,
          notes: input.notes ?? null,
        })
        .returning();
      return row;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        category: z.enum(CATEGORIES).optional(),
        description: z.string().min(1).optional(),
        vendor: z.string().optional(),
        amount: z.number().int().positive().optional(),
        isPaid: z.boolean().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.softCosts.findFirst({
        where: eq(softCosts.id, input.id),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      await assertProjectAccess(ctx.db, existing.projectId, ctx.dbUser.id, ctx.userId);

      const { id, ...fields } = input;
      const updateData: Partial<typeof softCosts.$inferInsert> = { ...fields };

      if (fields.isPaid === true && !existing.isPaid) {
        updateData.paidAt = new Date();
      } else if (fields.isPaid === false) {
        updateData.paidAt = null;
      }
      updateData.updatedAt = new Date();

      const [row] = await ctx.db
        .update(softCosts)
        .set(updateData)
        .where(eq(softCosts.id, id))
        .returning();
      return row;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.softCosts.findFirst({
        where: eq(softCosts.id, input.id),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      await assertProjectAccess(ctx.db, existing.projectId, ctx.dbUser.id, ctx.userId);
      await ctx.db.delete(softCosts).where(eq(softCosts.id, input.id));
      return { success: true };
    }),

  summary: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertProjectAccess(ctx.db, input.projectId, ctx.dbUser.id, ctx.userId);
      const rows = await ctx.db
        .select()
        .from(softCosts)
        .where(eq(softCosts.projectId, input.projectId));

      const totalBudgeted = rows.reduce((s, r) => s + r.amount, 0);
      const totalPaid = rows.filter((r) => r.isPaid).reduce((s, r) => s + r.amount, 0);
      const totalUnpaid = totalBudgeted - totalPaid;

      const byCategory: Record<string, number> = {};
      for (const row of rows) {
        byCategory[row.category] = (byCategory[row.category] ?? 0) + row.amount;
      }

      const largestCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      return { totalBudgeted, totalPaid, totalUnpaid, byCategory, largestCategory };
    }),
});
