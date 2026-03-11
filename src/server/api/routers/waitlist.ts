import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { waitlist } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const waitlistRouter = createTRPCRouter({
  join: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        company: z.string().optional(),
        projectType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if email already exists
      const existing = await ctx.db.query.waitlist.findFirst({
        where: eq(waitlist.email, input.email.toLowerCase()),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This email is already on the waitlist!",
        });
      }

      const [entry] = await ctx.db
        .insert(waitlist)
        .values({
          email: input.email.toLowerCase(),
          name: input.name,
          company: input.company,
          projectType: input.projectType,
        })
        .returning();

      return { success: true, id: entry.id };
    }),
});
