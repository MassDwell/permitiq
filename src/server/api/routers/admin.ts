import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { users, projects, documents, complianceItems, jurisdictionRequests } from "@/db/schema";
import { count, eq, gte, sql, desc, ne } from "drizzle-orm";
import Stripe from "stripe";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.dbUser.clerkId !== process.env.ADMIN_CLERK_ID) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const adminRouter = createTRPCRouter({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [[{ totalUsers }], [{ newThisWeek }], [{ activeProjects }], [{ completedDocs }], [{ failedDocs }], [{ foundingMembers }]] =
      await Promise.all([
        ctx.db.select({ totalUsers: count() }).from(users),
        ctx.db.select({ newThisWeek: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo)),
        ctx.db.select({ activeProjects: count() }).from(projects).where(eq(projects.status, "active")),
        ctx.db.select({ completedDocs: count() }).from(documents).where(eq(documents.processingStatus, "completed")),
        ctx.db.select({ failedDocs: count() }).from(documents).where(eq(documents.processingStatus, "failed")),
        ctx.db.select({ foundingMembers: count() }).from(users).where(ne(users.plan, "starter")),
      ]);

    return { totalUsers, newThisWeek, activeProjects, completedDocs, failedDocs, foundingMembers };
  }),

  getRecentSignups: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({ id: users.id, name: users.name, email: users.email, plan: users.plan, createdAt: users.createdAt })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);
  }),

  getRecentDocuments: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: documents.id,
        filename: documents.filename,
        processingStatus: documents.processingStatus,
        createdAt: documents.createdAt,
        projectName: projects.name,
      })
      .from(documents)
      .leftJoin(projects, eq(documents.projectId, projects.id))
      .orderBy(desc(documents.createdAt))
      .limit(10);
  }),

  getUsers: adminProcedure.query(async ({ ctx }) => {
    const allUsers = await ctx.db
      .select({ id: users.id, name: users.name, email: users.email, plan: users.plan, createdAt: users.createdAt })
      .from(users)
      .orderBy(desc(users.createdAt));

    const [projectCounts, docCounts, lastDocActivity, lastProjectActivity] = await Promise.all([
      ctx.db.select({ userId: projects.userId, count: count() }).from(projects).groupBy(projects.userId),
      ctx.db.select({ userId: documents.userId, count: count() }).from(documents).groupBy(documents.userId),
      ctx.db
        .select({ userId: documents.userId, lastAt: sql<string>`max(${documents.createdAt})` })
        .from(documents)
        .groupBy(documents.userId),
      ctx.db
        .select({ userId: projects.userId, lastAt: sql<string>`max(${projects.createdAt})` })
        .from(projects)
        .groupBy(projects.userId),
    ]);

    const projectCountMap = new Map(projectCounts.map((r) => [r.userId, r.count]));
    const docCountMap = new Map(docCounts.map((r) => [r.userId, r.count]));
    const lastDocMap = new Map(lastDocActivity.map((r) => [r.userId, r.lastAt]));
    const lastProjectMap = new Map(lastProjectActivity.map((r) => [r.userId, r.lastAt]));

    return allUsers.map((u) => {
      const lastDoc = lastDocMap.get(u.id);
      const lastProject = lastProjectMap.get(u.id);
      let lastActive: string | null = null;
      if (lastDoc && lastProject) {
        lastActive = lastDoc > lastProject ? lastDoc : lastProject;
      } else {
        lastActive = lastDoc ?? lastProject ?? null;
      }
      return {
        ...u,
        projectCount: projectCountMap.get(u.id) ?? 0,
        docCount: docCountMap.get(u.id) ?? 0,
        lastActive,
      };
    });
  }),

  getProjects: adminProcedure.query(async ({ ctx }) => {
    const allProjects = await ctx.db
      .select({
        id: projects.id,
        name: projects.name,
        jurisdiction: projects.jurisdiction,
        status: projects.status,
        projectType: projects.projectType,
        createdAt: projects.createdAt,
        ownerEmail: users.email,
      })
      .from(projects)
      .leftJoin(users, eq(projects.userId, users.id))
      .orderBy(desc(projects.createdAt));

    const [docCounts, complianceCounts] = await Promise.all([
      ctx.db.select({ projectId: documents.projectId, count: count() }).from(documents).groupBy(documents.projectId),
      ctx.db
        .select({
          projectId: complianceItems.projectId,
          total: count(),
          pending: sql<number>`count(*) filter (where ${complianceItems.status} = 'pending')`,
        })
        .from(complianceItems)
        .groupBy(complianceItems.projectId),
    ]);

    const docCountMap = new Map(docCounts.map((r) => [r.projectId, r.count]));
    const complianceMap = new Map(
      complianceCounts.map((r) => [r.projectId, { total: r.total, pending: Number(r.pending) }])
    );

    return allProjects.map((p) => ({
      ...p,
      docCount: docCountMap.get(p.id) ?? 0,
      complianceTotal: complianceMap.get(p.id)?.total ?? 0,
      compliancePending: complianceMap.get(p.id)?.pending ?? 0,
    }));
  }),

  getDocuments: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: documents.id,
        filename: documents.filename,
        processingStatus: documents.processingStatus,
        processingError: documents.processingError,
        createdAt: documents.createdAt,
        processedAt: documents.processedAt,
        projectName: projects.name,
        ownerEmail: users.email,
      })
      .from(documents)
      .leftJoin(projects, eq(documents.projectId, projects.id))
      .leftJoin(users, eq(documents.userId, users.id))
      .orderBy(
        sql`case when ${documents.processingStatus} = 'failed' then 0 else 1 end`,
        desc(documents.createdAt)
      );
  }),

  getActivity: adminProcedure.query(async ({ ctx }) => {
    const [userSignups, docUploads, projectCreations, planUpgrades] = await Promise.all([
      ctx.db
        .select({ id: users.id, email: users.email, name: users.name, createdAt: users.createdAt })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(50),
      ctx.db
        .select({
          id: documents.id,
          filename: documents.filename,
          createdAt: documents.createdAt,
          projectName: projects.name,
          ownerEmail: users.email,
        })
        .from(documents)
        .leftJoin(projects, eq(documents.projectId, projects.id))
        .leftJoin(users, eq(documents.userId, users.id))
        .orderBy(desc(documents.createdAt))
        .limit(50),
      ctx.db
        .select({ id: projects.id, name: projects.name, createdAt: projects.createdAt, ownerEmail: users.email })
        .from(projects)
        .leftJoin(users, eq(projects.userId, users.id))
        .orderBy(desc(projects.createdAt))
        .limit(50),
      ctx.db
        .select({ id: users.id, email: users.email, name: users.name, plan: users.plan, updatedAt: users.updatedAt })
        .from(users)
        .where(ne(users.plan, "starter"))
        .orderBy(desc(users.updatedAt))
        .limit(50),
    ]);

    const events = [
      ...userSignups.map((u) => ({
        type: "signup" as const,
        description: `${u.name ?? u.email} signed up`,
        timestamp: u.createdAt,
        id: `signup-${u.id}`,
      })),
      ...docUploads.map((d) => ({
        type: "document" as const,
        description: `${d.filename} uploaded${d.projectName ? ` to "${d.projectName}"` : ""}${d.ownerEmail ? ` by ${d.ownerEmail}` : ""}`,
        timestamp: d.createdAt,
        id: `doc-${d.id}`,
      })),
      ...projectCreations.map((p) => ({
        type: "project" as const,
        description: `Project "${p.name}" created${p.ownerEmail ? ` by ${p.ownerEmail}` : ""}`,
        timestamp: p.createdAt,
        id: `project-${p.id}`,
      })),
      ...planUpgrades.map((u) => ({
        type: "upgrade" as const,
        description: `${u.name ?? u.email} upgraded to ${u.plan}`,
        timestamp: u.updatedAt,
        id: `upgrade-${u.id}`,
      })),
    ];

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 100);
  }),

  getPlanDistribution: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.select({ plan: users.plan, count: count() }).from(users).groupBy(users.plan);
  }),

  getJurisdictionRequests: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(jurisdictionRequests)
      .orderBy(desc(jurisdictionRequests.requestCount));
  }),

  markJurisdictionCurated: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(jurisdictionRequests)
        .set({ status: "completed" })
        .where(eq(jurisdictionRequests.id, input.id))
        .returning();
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return updated;
    }),

  getStripeMetrics: adminProcedure.query(async () => {
    const zero = { mrr: 0, arr: 0, activeSubscribers: 0, newMrrThisMonth: 0, churnRate: 0, totalCollectedYTD: 0 };
    try {
      const stripe = new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim());

      const now = new Date();
      const startOfMonth = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
      const startOfYear = Math.floor(new Date(now.getFullYear(), 0, 1).getTime() / 1000);

      // Fetch active subscriptions (up to 100)
      const activeSubs = await stripe.subscriptions.list({ status: "active", limit: 100 });

      let mrr = 0;
      let newMrrThisMonth = 0;
      for (const sub of activeSubs.data) {
        let subMrr = 0;
        for (const item of sub.items.data) {
          const price = item.price;
          const amount = (price.unit_amount ?? 0) * (item.quantity ?? 1) / 100;
          subMrr += price.recurring?.interval === "year" ? amount / 12 : amount;
        }
        mrr += subMrr;
        if (sub.created >= startOfMonth) {
          newMrrThisMonth += subMrr;
        }
      }

      const arr = mrr * 12;
      const activeSubscribers = activeSubs.data.length;

      // Canceled this month
      const canceledSubs = await stripe.subscriptions.list({
        status: "canceled",
        created: { gte: startOfMonth },
        limit: 100,
      });
      const canceledThisMonth = canceledSubs.data.length;

      // Churn: canceled / (active + canceled) * 100
      const activeLastMonth = activeSubscribers + canceledThisMonth;
      const churnRate = activeLastMonth > 0 ? (canceledThisMonth / activeLastMonth) * 100 : 0;

      // Total collected YTD via balance transactions
      let totalCollectedYTD = 0;
      let hasMore = true;
      let startingAfter: string | undefined = undefined;
      while (hasMore) {
        const txns: Awaited<ReturnType<typeof stripe.balanceTransactions.list>> = await stripe.balanceTransactions.list({
          type: "charge",
          created: { gte: startOfYear },
          limit: 100,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        });
        for (const txn of txns.data) {
          totalCollectedYTD += txn.net / 100;
        }
        hasMore = txns.has_more;
        if (hasMore && txns.data.length > 0) {
          startingAfter = txns.data[txns.data.length - 1]!.id;
        }
      }

      return { mrr, arr, activeSubscribers, newMrrThisMonth, churnRate, totalCollectedYTD };
    } catch {
      return zero;
    }
  }),
});
