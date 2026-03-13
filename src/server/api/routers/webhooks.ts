import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { apiWebhooks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

const SUPPORTED_EVENTS = [
  "requirement.status_changed",
  "project.created",
  "requirement.overdue",
] as const;

export const webhooksRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const webhooks = await ctx.db.query.apiWebhooks.findMany({
      where: eq(apiWebhooks.userId, ctx.dbUser.id),
      columns: {
        id: true,
        url: true,
        events: true,
        isActive: true,
        lastTriggeredAt: true,
        createdAt: true,
      },
    });
    return webhooks;
  }),

  create: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        events: z.array(z.enum(SUPPORTED_EVENTS)).min(1),
        secret: z.string().min(16).max(128).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate secret if not provided
      const secret = input.secret ?? crypto.randomBytes(32).toString("hex");

      const [webhook] = await ctx.db
        .insert(apiWebhooks)
        .values({
          userId: ctx.dbUser.id,
          url: input.url,
          events: input.events,
          secret,
          isActive: true,
        })
        .returning();

      return {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
        // Return secret ONCE so user can save it
        secret,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const webhook = await ctx.db.query.apiWebhooks.findFirst({
        where: and(
          eq(apiWebhooks.id, input.id),
          eq(apiWebhooks.userId, ctx.dbUser.id)
        ),
      });

      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      await ctx.db.delete(apiWebhooks).where(eq(apiWebhooks.id, input.id));

      return { success: true };
    }),

  toggle: protectedProcedure
    .input(z.object({ id: z.string(), active: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const webhook = await ctx.db.query.apiWebhooks.findFirst({
        where: and(
          eq(apiWebhooks.id, input.id),
          eq(apiWebhooks.userId, ctx.dbUser.id)
        ),
      });

      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      const [updated] = await ctx.db
        .update(apiWebhooks)
        .set({ isActive: input.active, updatedAt: new Date() })
        .where(eq(apiWebhooks.id, input.id))
        .returning();

      return updated;
    }),

  test: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const webhook = await ctx.db.query.apiWebhooks.findFirst({
        where: and(
          eq(apiWebhooks.id, input.id),
          eq(apiWebhooks.userId, ctx.dbUser.id)
        ),
      });

      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      const payload = {
        event: "webhook.test",
        data: {
          message: "This is a test webhook from MeritLayer",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };

      const body = JSON.stringify(payload);
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(body)
        .digest("hex");

      try {
        const response = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-MeritLayer-Signature": signature,
            "X-MeritLayer-Event": "webhook.test",
          },
          body,
        });

        // Update last triggered timestamp
        await ctx.db
          .update(apiWebhooks)
          .set({ lastTriggeredAt: new Date(), updatedAt: new Date() })
          .where(eq(apiWebhooks.id, input.id));

        return {
          success: response.ok,
          statusCode: response.status,
          statusText: response.statusText,
        };
      } catch (error) {
        return {
          success: false,
          statusCode: 0,
          statusText: error instanceof Error ? error.message : "Connection failed",
        };
      }
    }),

  getSupportedEvents: protectedProcedure.query(() => {
    return SUPPORTED_EVENTS;
  }),
});
