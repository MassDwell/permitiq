import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { userSettings, users } from "@/db/schema";
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
      onboardingCompleted: ctx.dbUser.onboardingCompleted,
      subscriptionStatus: ctx.dbUser.subscriptionStatus,
      subscriptionPeriodEnd: ctx.dbUser.subscriptionPeriodEnd,
      createdAt: ctx.dbUser.createdAt,
    };
  }),

  // Mark onboarding as complete
  completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(users)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(users.id, ctx.dbUser.id));

    return { success: true };
  }),
});
