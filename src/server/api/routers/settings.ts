import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    let settings = await ctx.db.query.userSettings.findFirst({
      where: eq(userSettings.userId, ctx.dbUser.id),
    });

    // Create default settings if none exist
    if (!settings) {
      const [newSettings] = await ctx.db
        .insert(userSettings)
        .values({
          userId: ctx.dbUser.id,
          emailAlerts: true,
          alertLeadDays: 7,
          dailyDigest: false,
        })
        .returning();
      settings = newSettings;
    }

    return settings;
  }),

  update: protectedProcedure
    .input(
      z.object({
        emailAlerts: z.boolean().optional(),
        alertLeadDays: z.number().min(1).max(30).optional(),
        dailyDigest: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let settings = await ctx.db.query.userSettings.findFirst({
        where: eq(userSettings.userId, ctx.dbUser.id),
      });

      if (!settings) {
        // Create with provided values
        const [newSettings] = await ctx.db
          .insert(userSettings)
          .values({
            userId: ctx.dbUser.id,
            emailAlerts: input.emailAlerts ?? true,
            alertLeadDays: input.alertLeadDays ?? 7,
            dailyDigest: input.dailyDigest ?? false,
          })
          .returning();
        return newSettings;
      }

      // Update existing
      const [updated] = await ctx.db
        .update(userSettings)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, ctx.dbUser.id))
        .returning();

      return updated;
    }),

  // Get user profile info
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.dbUser.id,
      email: ctx.dbUser.email,
      name: ctx.dbUser.name,
      plan: ctx.dbUser.plan,
      createdAt: ctx.dbUser.createdAt,
    };
  }),
});
