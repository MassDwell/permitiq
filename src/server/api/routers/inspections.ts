import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { inspections, projects } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const BOSTON_SEQUENCE = [
  { name: "Foundation/Footing", inspectionType: "building", sortOrder: 1 },
  { name: "Underground Plumbing", inspectionType: "plumbing", sortOrder: 2 },
  { name: "Underground Electrical", inspectionType: "electrical", sortOrder: 3 },
  { name: "Rough Framing", inspectionType: "building", sortOrder: 4 },
  { name: "Rough Plumbing", inspectionType: "plumbing", sortOrder: 5 },
  { name: "Rough Electrical", inspectionType: "electrical", sortOrder: 6 },
  { name: "Rough HVAC", inspectionType: "building", sortOrder: 7 },
  { name: "Insulation", inspectionType: "building", sortOrder: 8 },
  { name: "Fire Stop", inspectionType: "fire", sortOrder: 9 },
  { name: "Final Building", inspectionType: "building", sortOrder: 10 },
  { name: "Final Plumbing", inspectionType: "plumbing", sortOrder: 11 },
  { name: "Final Electrical", inspectionType: "electrical", sortOrder: 12 },
  { name: "Final Fire", inspectionType: "fire", sortOrder: 13 },
  { name: "Certificate of Occupancy", inspectionType: "final", sortOrder: 14 },
];

export const inspectionsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify user owns the project
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.dbUser.id)
        ),
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db
        .select()
        .from(inspections)
        .where(eq(inspections.projectId, input.projectId))
        .orderBy(asc(inspections.sortOrder));
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1),
        inspectionType: z.string().min(1),
        status: z.string().optional(),
        scheduledDate: z.string().optional(),
        completedDate: z.string().optional(),
        inspectorName: z.string().optional(),
        notes: z.string().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.dbUser.id)
        ),
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const [created] = await ctx.db
        .insert(inspections)
        .values({
          projectId: input.projectId,
          name: input.name,
          inspectionType: input.inspectionType,
          status: input.status ?? "scheduled",
          scheduledDate: input.scheduledDate ?? null,
          completedDate: input.completedDate ?? null,
          inspectorName: input.inspectorName ?? null,
          notes: input.notes ?? null,
          sortOrder: input.sortOrder ?? 99,
        })
        .returning();

      return created;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.string().optional(),
        scheduledDate: z.string().nullable().optional(),
        completedDate: z.string().nullable().optional(),
        inspectorName: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        failureReason: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.inspections.findFirst({
        where: eq(inspections.id, input.id),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      // Verify ownership via project
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, existing.projectId),
          eq(projects.userId, ctx.dbUser.id)
        ),
      });
      if (!project) throw new TRPCError({ code: "FORBIDDEN" });

      const updates: Partial<typeof inspections.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (input.status !== undefined) updates.status = input.status;
      if (input.scheduledDate !== undefined) updates.scheduledDate = input.scheduledDate;
      if (input.completedDate !== undefined) updates.completedDate = input.completedDate;
      if (input.inspectorName !== undefined) updates.inspectorName = input.inspectorName;
      if (input.notes !== undefined) updates.notes = input.notes;
      if (input.failureReason !== undefined) updates.failureReason = input.failureReason;

      const [updated] = await ctx.db
        .update(inspections)
        .set(updates)
        .where(eq(inspections.id, input.id))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.inspections.findFirst({
        where: eq(inspections.id, input.id),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, existing.projectId),
          eq(projects.userId, ctx.dbUser.id)
        ),
      });
      if (!project) throw new TRPCError({ code: "FORBIDDEN" });

      await ctx.db.delete(inspections).where(eq(inspections.id, input.id));
      return { success: true };
    }),

  seedBoston: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.dbUser.id)
        ),
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const existing = await ctx.db
        .select()
        .from(inspections)
        .where(eq(inspections.projectId, input.projectId));

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Inspections already exist for this project",
        });
      }

      const rows = BOSTON_SEQUENCE.map((item) => ({
        projectId: input.projectId,
        name: item.name,
        inspectionType: item.inspectionType,
        status: "scheduled",
        sortOrder: item.sortOrder,
      }));

      await ctx.db.insert(inspections).values(rows);
      return { seeded: rows.length };
    }),
});
