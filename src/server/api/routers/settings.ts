import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { userSettings, users, projects, projectMembers } from "@/db/schema";
import { eq, count } from "drizzle-orm";

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

  // Update user profile (name)
  updateProfile: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(120) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ name: input.name, updatedAt: new Date() })
        .where(eq(users.id, ctx.dbUser.id));
      return { success: true };
    }),

  // Mark onboarding as complete
  completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(users)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(users.id, ctx.dbUser.id));

    return { success: true };
  }),

  // Check if current user is an account owner (owns projects) vs a collaborator-only user
  isOwnerStatus: protectedProcedure.query(async ({ ctx }) => {
    // Count projects owned by this user
    const [{ value: projectCount }] = await ctx.db
      .select({ value: count() })
      .from(projects)
      .where(eq(projects.userId, ctx.dbUser.id));

    if (projectCount > 0) {
      return { isOwner: true, ownerEmail: null };
    }

    // Check if they have any accepted project_member entries (collaborator-only user)
    const memberEntry = await ctx.db.query.projectMembers.findFirst({
      where: eq(projectMembers.userId, ctx.userId),
    });

    if (!memberEntry) {
      // No projects, no invites — new user, treat as owner
      return { isOwner: true, ownerEmail: null };
    }

    // Find the project owner's email to show in the restricted message
    const project = await ctx.db.query.projects.findFirst({
      where: eq(projects.id, memberEntry.projectId),
      with: { user: true },
    });

    return {
      isOwner: false,
      ownerEmail: project?.user?.email ?? null,
    };
  }),
});
