import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import {
  projectShares,
  projects,
  complianceItems,
  documents,
  permitWorkflows,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const sharesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        label: z.string().optional(),
        expiresInDays: z.number().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.dbUser.id)
        ),
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const expiresAt = input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 86400000)
        : null;

      const [share] = await ctx.db
        .insert(projectShares)
        .values({
          projectId: input.projectId,
          createdBy: ctx.dbUser.clerkId,
          label: input.label ?? null,
          expiresAt: expiresAt,
        })
        .returning();

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://meritlayer.ai";
      return {
        share,
        url: `${baseUrl}/share/${share.shareToken}`,
      };
    }),

  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.dbUser.id)
        ),
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      return ctx.db.query.projectShares.findMany({
        where: eq(projectShares.projectId, input.projectId),
        orderBy: (s, { desc }) => [desc(s.createdAt)],
      });
    }),

  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const share = await ctx.db.query.projectShares.findFirst({
        where: eq(projectShares.shareToken, input.token),
      });

      if (!share) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Share not found" });
      }

      if (share.expiresAt && share.expiresAt < new Date()) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This link has expired" });
      }

      // Increment view count
      await ctx.db
        .update(projectShares)
        .set({ viewCount: sql`${projectShares.viewCount} + 1` })
        .where(eq(projectShares.id, share.id));

      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, share.projectId),
        with: {
          complianceItems: {
            orderBy: (ci, { asc }) => [asc(ci.deadline)],
          },
          documents: {
            orderBy: (d, { desc }) => [desc(d.createdAt)],
          },
          permitWorkflows: {
            orderBy: (pw, { desc }) => [desc(pw.createdAt)],
          },
        },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const totalItems = project.complianceItems.length;
      const metItems = project.complianceItems.filter((i) => i.status === "met").length;
      const overdueItems = project.complianceItems.filter((i) => i.status === "overdue").length;
      const healthScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 100;

      const now = new Date();
      const in60Days = new Date(now.getTime() + 60 * 86400000);
      const upcomingDeadlines = project.complianceItems
        .filter((i) => i.deadline && i.deadline > now && i.deadline <= in60Days && i.status !== "met")
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
        .slice(0, 3);

      return {
        share,
        project: {
          ...project,
          healthScore,
          totalItems,
          metItems,
          overdueItems,
          upcomingDeadlines,
        },
        generatedAt: new Date(),
      };
    }),

  revoke: protectedProcedure
    .input(z.object({ shareId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const share = await ctx.db.query.projectShares.findFirst({
        where: eq(projectShares.id, input.shareId),
      });

      if (!share) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Share not found" });
      }

      // Verify ownership through project
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, share.projectId),
          eq(projects.userId, ctx.dbUser.id)
        ),
      });

      if (!project) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      await ctx.db.delete(projectShares).where(eq(projectShares.id, input.shareId));
      return { success: true };
    }),
});
