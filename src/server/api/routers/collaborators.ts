import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { projectMembers, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sendTeamInviteEmail } from "@/lib/email";
import { assertProjectAccess } from "../project-access";

export const collaboratorsRouter = createTRPCRouter({
  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const project = await assertProjectAccess(ctx.db, input.projectId, ctx.dbUser.id, ctx.userId);

      const members = await ctx.db.query.projectMembers.findMany({
        where: eq(projectMembers.projectId, input.projectId),
      });

      const isOwner = project.userId === ctx.dbUser.id;
      return { members, isOwner };
    }),

  invite: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        email: z.string().email(),
        role: z.enum(["editor", "viewer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: and(eq(projects.id, input.projectId), eq(projects.userId, ctx.dbUser.id)),
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const token = crypto.randomUUID();

      const [member] = await ctx.db
        .insert(projectMembers)
        .values({
          projectId: input.projectId,
          email: input.email,
          role: input.role,
          inviteToken: token,
          invitedBy: ctx.dbUser.clerkId,
        })
        .returning();

      // Send invite email
      const inviterName = ctx.dbUser.name || ctx.dbUser.email;
      await sendTeamInviteEmail({
        to: input.email,
        inviterName,
        projectName: project.name,
        role: input.role,
        token,
      });

      return member;
    }),

  updateRole: protectedProcedure
    .input(z.object({ memberId: z.string(), role: z.enum(["editor", "viewer"]) }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db.query.projectMembers.findFirst({
        where: eq(projectMembers.id, input.memberId),
      });

      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      }

      const project = await ctx.db.query.projects.findFirst({
        where: and(eq(projects.id, member.projectId), eq(projects.userId, ctx.dbUser.id)),
      });

      if (!project) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      const [updated] = await ctx.db
        .update(projectMembers)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(projectMembers.id, input.memberId))
        .returning();

      return updated;
    }),

  remove: protectedProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db.query.projectMembers.findFirst({
        where: eq(projectMembers.id, input.memberId),
      });

      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      }

      const project = await ctx.db.query.projects.findFirst({
        where: and(eq(projects.id, member.projectId), eq(projects.userId, ctx.dbUser.id)),
      });

      if (!project) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      await ctx.db.delete(projectMembers).where(eq(projectMembers.id, input.memberId));

      return { success: true };
    }),

  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.db.query.projectMembers.findFirst({
        where: eq(projectMembers.inviteToken, input.token),
      });

      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid invite token" });
      }

      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, member.projectId),
      });

      return {
        member,
        projectName: project?.name ?? "Unknown Project",
        projectId: project?.id ?? "",
      };
    }),

  acceptInvite: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db.query.projectMembers.findFirst({
        where: eq(projectMembers.inviteToken, input.token),
      });

      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid invite token" });
      }

      if (member.inviteStatus === "accepted") {
        return { member, projectId: member.projectId, alreadyAccepted: true, requiresAuth: false };
      }

      // Unauthenticated user — do not mark as accepted yet; tell frontend to auth first
      if (!ctx.userId) {
        return {
          member: null,
          projectId: member.projectId,
          alreadyAccepted: false,
          requiresAuth: true,
          token: input.token,
        };
      }

      const [updated] = await ctx.db
        .update(projectMembers)
        .set({
          inviteStatus: "accepted",
          acceptedAt: new Date(),
          userId: ctx.userId,
          updatedAt: new Date(),
        })
        .where(eq(projectMembers.id, member.id))
        .returning();

      return { member: updated, projectId: member.projectId, alreadyAccepted: false, requiresAuth: false };
    }),

  claimPendingInvite: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db.query.projectMembers.findFirst({
        where: eq(projectMembers.inviteToken, input.token),
      });

      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid invite token" });
      }

      if (member.inviteStatus === "accepted") {
        return { projectId: member.projectId, alreadyAccepted: true };
      }

      await ctx.db
        .update(projectMembers)
        .set({
          inviteStatus: "accepted",
          acceptedAt: new Date(),
          userId: ctx.userId,
          updatedAt: new Date(),
        })
        .where(eq(projectMembers.id, member.id));

      return { projectId: member.projectId, alreadyAccepted: false };
    }),
});
