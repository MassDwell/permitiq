import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const referralsRouter = createTRPCRouter({
  getMyCode: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.dbUser;

    // Generate a referral code if none exists
    if (!user.referralCode) {
      const newCode =
        Math.random().toString(36).substring(2, 6).toUpperCase() +
        Math.random().toString(36).substring(2, 6).toUpperCase();

      const [updated] = await ctx.db
        .update(users)
        .set({ referralCode: newCode, updatedAt: new Date() })
        .where(eq(users.id, user.id))
        .returning();

      const referralCount = await ctx.db.query.users.findMany({
        where: eq(users.referredBy, user.id),
      });

      return {
        referralCode: updated.referralCode!,
        referralLink: `https://meritlayer.ai/invite?ref=${updated.referralCode}`,
        referralCount: referralCount.length,
      };
    }

    const referralCount = await ctx.db.query.users.findMany({
      where: eq(users.referredBy, user.id),
    });

    return {
      referralCode: user.referralCode,
      referralLink: `https://meritlayer.ai/invite?ref=${user.referralCode}`,
      referralCount: referralCount.length,
    };
  }),
});
