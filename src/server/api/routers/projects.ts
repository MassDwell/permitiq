import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { projects, documents, complianceItems, complianceSnapshots } from "@/db/schema";
import { eq, and, desc, count, sql, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userProjects = await ctx.db.query.projects.findMany({
      where: eq(projects.userId, ctx.dbUser.id),
      orderBy: [desc(projects.updatedAt)],
      with: {
        complianceItems: true,
        documents: true,
      },
    });

    // Calculate health scores
    return userProjects.map((project) => {
      const totalItems = project.complianceItems.length;
      const metItems = project.complianceItems.filter((i) => i.status === "met").length;
      const overdueItems = project.complianceItems.filter((i) => i.status === "overdue").length;
      const healthScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 100;

      let healthStatus: "green" | "yellow" | "red" = "green";
      if (overdueItems > 0) {
        healthStatus = "red";
      } else if (healthScore < 80) {
        healthStatus = "yellow";
      }

      return {
        ...project,
        healthScore,
        healthStatus,
        totalItems,
        metItems,
        overdueItems,
        documentCount: project.documents.length,
      };
    });
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.id),
          eq(projects.userId, ctx.dbUser.id)
        ),
        with: {
          complianceItems: {
            with: {
              document: true,
            },
            orderBy: [desc(complianceItems.deadline)],
          },
          documents: {
            orderBy: [desc(documents.createdAt)],
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Calculate health metrics
      const totalItems = project.complianceItems.length;
      const metItems = project.complianceItems.filter((i) => i.status === "met").length;
      const overdueItems = project.complianceItems.filter((i) => i.status === "overdue").length;
      const pendingItems = project.complianceItems.filter((i) => i.status === "pending").length;
      const healthScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 100;

      let healthStatus: "green" | "yellow" | "red" = "green";
      if (overdueItems > 0) {
        healthStatus = "red";
      } else if (healthScore < 80) {
        healthStatus = "yellow";
      }

      return {
        ...project,
        healthScore,
        healthStatus,
        totalItems,
        metItems,
        overdueItems,
        pendingItems,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        jurisdiction: z.string().optional(),
        projectType: z.enum(["residential", "commercial", "adu", "mixed_use", "renovation"]),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check plan limits
      const projectCount = await ctx.db
        .select({ count: count() })
        .from(projects)
        .where(
          and(
            eq(projects.userId, ctx.dbUser.id),
            eq(projects.status, "active")
          )
        );

      const maxProjects = ctx.dbUser.plan === "starter" ? 1 : ctx.dbUser.plan === "professional" ? 5 : Infinity;

      if (projectCount[0].count >= maxProjects) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Your ${ctx.dbUser.plan} plan allows a maximum of ${maxProjects} active project(s). Please upgrade to add more.`,
        });
      }

      const [newProject] = await ctx.db
        .insert(projects)
        .values({
          userId: ctx.dbUser.id,
          name: input.name,
          address: input.address,
          jurisdiction: input.jurisdiction,
          projectType: input.projectType,
          description: input.description,
        })
        .returning();

      return newProject;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        jurisdiction: z.string().optional(),
        projectType: z.enum(["residential", "commercial", "adu", "mixed_use", "renovation"]).optional(),
        status: z.enum(["active", "completed", "on_hold", "archived"]).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const [updated] = await ctx.db
        .update(projects)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(projects.id, id), eq(projects.userId, ctx.dbUser.id)))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(projects)
        .where(and(eq(projects.id, input.id), eq(projects.userId, ctx.dbUser.id)))
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return { success: true };
    }),

  takeSnapshot: protectedProcedure.mutation(async ({ ctx }) => {
    const userProjects = await ctx.db.query.projects.findMany({
      where: eq(projects.userId, ctx.dbUser.id),
      with: { complianceItems: true },
    });

    const snapshots = [];
    for (const project of userProjects) {
      const totalItems = project.complianceItems.length;
      const metItems = project.complianceItems.filter((i) => i.status === "met").length;
      const healthScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 100;

      const [snapshot] = await ctx.db
        .insert(complianceSnapshots)
        .values({
          projectId: project.id,
          userId: ctx.dbUser.id,
          healthScore,
          totalItems,
          metItems,
        })
        .returning();
      snapshots.push(snapshot);
    }

    return snapshots;
  }),

  getComplianceVelocity: protectedProcedure.query(async ({ ctx }) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28); // last 4 weeks

    const snapshots = await ctx.db.query.complianceSnapshots.findMany({
      where: and(
        eq(complianceSnapshots.userId, ctx.dbUser.id),
        gte(complianceSnapshots.snapshotDate, startDate)
      ),
      orderBy: [complianceSnapshots.snapshotDate],
    });

    // Bucket into 4 weekly buckets
    const now = new Date();
    const weeks: { label: string; scores: number[] }[] = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(now.getTime() - (3 - i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - (3 - i) * 7 * 24 * 60 * 60 * 1000);
      const label = i === 3 ? "This week" : `${3 - i}w ago`;
      const scores = snapshots
        .filter((s) => s.snapshotDate >= weekStart && s.snapshotDate < weekEnd)
        .map((s) => s.healthScore);
      return { label, scores };
    });

    return weeks.map((w) => ({
      label: w.label,
      avgScore: w.scores.length > 0 ? Math.round(w.scores.reduce((a, b) => a + b, 0) / w.scores.length) : null,
      snapshotCount: w.scores.length,
    }));
  }),

  getUpcomingDeadlines: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + input.days);

      const items = await ctx.db.query.complianceItems.findMany({
        where: and(
          sql`${complianceItems.deadline} >= ${now}`,
          sql`${complianceItems.deadline} <= ${futureDate}`,
          eq(complianceItems.status, "pending")
        ),
        with: {
          project: {
            columns: {
              id: true,
              name: true,
              userId: true,
            },
          },
        },
        orderBy: [complianceItems.deadline],
      });

      // Filter to only user's projects
      return items.filter((item) => item.project.userId === ctx.dbUser.id);
    }),

  getPortfolioStats: protectedProcedure.query(async ({ ctx }) => {
    const userProjects = await ctx.db.query.projects.findMany({
      where: eq(projects.userId, ctx.dbUser.id),
      orderBy: [desc(projects.updatedAt)],
      with: {
        complianceItems: true,
      },
    });

    const now = new Date();
    const future60 = new Date();
    future60.setDate(future60.getDate() + 60);

    const projectStats = userProjects.map((project) => {
      const totalItems = project.complianceItems.length;
      const metItems = project.complianceItems.filter((i) => i.status === "met").length;
      const openItems = project.complianceItems.filter(
        (i) => i.status === "pending" || i.status === "overdue"
      ).length;
      const complianceScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 0;

      const pendingWithDeadline = project.complianceItems
        .filter((i) => (i.status === "pending" || i.status === "overdue") && i.deadline)
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

      const nextDeadline = pendingWithDeadline[0]?.deadline ?? null;
      const daysToDeadline = nextDeadline
        ? Math.ceil((new Date(nextDeadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      let status: "critical" | "attention" | "on-track" = "on-track";
      if (complianceScore < 30 || (daysToDeadline !== null && daysToDeadline < 7)) {
        status = "critical";
      } else if (complianceScore < 60 || (daysToDeadline !== null && daysToDeadline < 30)) {
        status = "attention";
      }

      return {
        id: project.id,
        name: project.name,
        address: project.address ?? null,
        complianceScore,
        nextDeadline: nextDeadline ? new Date(nextDeadline).toISOString() : null,
        daysToDeadline,
        openItems,
        status,
      };
    });

    const deadlineItems = await ctx.db.query.complianceItems.findMany({
      where: and(
        sql`${complianceItems.deadline} >= ${now}`,
        sql`${complianceItems.deadline} <= ${future60}`,
        eq(complianceItems.status, "pending")
      ),
      with: {
        project: {
          columns: { id: true, name: true, userId: true },
        },
      },
      orderBy: [complianceItems.deadline],
    });

    const upcomingDeadlines = deadlineItems
      .filter((item) => item.project.userId === ctx.dbUser.id)
      .map((item) => ({
        projectId: item.project.id,
        projectName: item.project.name,
        requirement: item.description,
        dueDate: item.deadline ? new Date(item.deadline).toISOString() : null,
        daysRemaining: item.deadline
          ? Math.ceil((new Date(item.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
      }));

    const totalProjects = projectStats.length;
    const avgComplianceScore =
      totalProjects > 0
        ? Math.round(projectStats.reduce((acc, p) => acc + p.complianceScore, 0) / totalProjects)
        : 0;
    const deadlinesNext30Days = upcomingDeadlines.filter(
      (d) => d.daysRemaining !== null && d.daysRemaining <= 30
    ).length;
    const projectsNeedingAttention = projectStats.filter((p) => p.complianceScore < 50).length;

    return {
      totalProjects,
      avgComplianceScore,
      deadlinesNext30Days,
      projectsNeedingAttention,
      projects: projectStats,
      upcomingDeadlines,
    };
  }),
});
