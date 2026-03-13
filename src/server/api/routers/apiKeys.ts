import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { apiKeys } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createHash } from "crypto";

function generateApiKey(): { key: string; prefix: string; hash: string } {
  const random = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const key = `sk_live_${random.substring(0, 32)}`;
  const prefix = key.substring(0, 16);
  const hash = createHash("sha256").update(key).digest("hex");
  return { key, prefix, hash };
}

export const apiKeysRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const keys = await ctx.db.query.apiKeys.findMany({
      where: and(eq(apiKeys.userId, ctx.dbUser.id), eq(apiKeys.isActive, true)),
      columns: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
    return keys;
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.dbUser.plan !== "enterprise") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "API key access requires an Enterprise plan.",
        });
      }

      const { key, prefix, hash } = generateApiKey();

      const [newKey] = await ctx.db
        .insert(apiKeys)
        .values({
          userId: ctx.dbUser.id,
          name: input.name,
          keyPrefix: prefix,
          keyHash: hash,
          isActive: true,
        })
        .returning();

      return {
        id: newKey.id,
        name: newKey.name,
        keyPrefix: newKey.keyPrefix,
        createdAt: newKey.createdAt,
        // Return plaintext key ONCE — never stored
        plaintextKey: key,
      };
    }),

  revoke: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const key = await ctx.db.query.apiKeys.findFirst({
        where: and(eq(apiKeys.id, input.id), eq(apiKeys.userId, ctx.dbUser.id)),
      });

      if (!key) {
        throw new TRPCError({ code: "NOT_FOUND", message: "API key not found" });
      }

      await ctx.db
        .update(apiKeys)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(apiKeys.id, input.id));

      return { success: true };
    }),
});
