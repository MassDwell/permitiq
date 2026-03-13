import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { alerts, alertTypeEnum } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const alertsRouter = createTRPCRouter({
  // Create a custom alert — professional+ only
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid().optional(),
        complianceItemId: z.string().uuid().optional(),
        alertType: z.enum(["deadline_7_days", "deadline_3_days", "deadline_1_day", "overdue", "document_processed", "compliance_update"]),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.dbUser.plan === "starter") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Creating custom alerts requires a Professional or higher plan.",
        });
      }

      const [alert] = await ctx.db
        .insert(alerts)
        .values({
          userId: ctx.dbUser.id,
          projectId: input.projectId,
          complianceItemId: input.complianceItemId,
          alertType: input.alertType,
          message: input.message,
        })
        .returning();

      return alert;
    }),

  list: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.db.query.alerts.findMany({
        where: input.unreadOnly
          ? and(eq(alerts.userId, ctx.dbUser.id), eq(alerts.isRead, false))
          : eq(alerts.userId, ctx.dbUser.id),
        orderBy: [desc(alerts.createdAt)],
        limit: input.limit,
        with: {
          project: {
            columns: {
              id: true,
              name: true,
            },
          },
          complianceItem: {
            columns: {
              id: true,
              description: true,
              deadline: true,
            },
          },
        },
      });

      return query;
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ count: count() })
      .from(alerts)
      .where(and(eq(alerts.userId, ctx.dbUser.id), eq(alerts.isRead, false)));

    return result[0].count;
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(alerts)
        .set({ isRead: true })
        .where(and(eq(alerts.id, input.id), eq(alerts.userId, ctx.dbUser.id)))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Alert not found",
        });
      }

      return updated;
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(alerts)
      .set({ isRead: true })
      .where(and(eq(alerts.userId, ctx.dbUser.id), eq(alerts.isRead, false)));

    return { success: true };
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(alerts)
        .where(and(eq(alerts.id, input.id), eq(alerts.userId, ctx.dbUser.id)))
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Alert not found",
        });
      }

      return { success: true };
    }),

  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.delete(alerts).where(eq(alerts.userId, ctx.dbUser.id));
    return { success: true };
  }),
});
