import { initTRPC, TRPCError } from "@trpc/server";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@/db";
import { users, userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const { userId } = await auth();

  return {
    db,
    userId,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

// Middleware to check if user is authenticated
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Get or auto-create the database user (handles webhook delivery failures)
  let dbUser = await ctx.db.query.users.findFirst({
    where: eq(users.clerkId, ctx.userId),
  });

  if (!dbUser) {
    // Webhook may have failed — fetch from Clerk and create user record now
    try {
      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const clerkUser = await clerk.users.getUser(ctx.userId);
      const primaryEmail = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

      if (!primaryEmail) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "No email found for user." });
      }

      const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

      const [newUser] = await ctx.db
        .insert(users)
        .values({
          clerkId: ctx.userId,
          email: primaryEmail,
          name: fullName,
          plan: "starter",
        })
        .returning();

      // Create default settings
      await ctx.db.insert(userSettings).values({
        userId: newUser.id,
        emailAlerts: true,
        alertLeadDays: 7,
        dailyDigest: false,
      });

      dbUser = newUser;
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to initialize user account. Please try again.",
      });
    }
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      dbUser,
    },
  });
});

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
