import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { TRPCError } from "@trpc/server";

const getStripe = () => new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim());

const PRICE_IDS = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
};

export const billingRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["starter", "professional", "enterprise"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const priceId = PRICE_IDS[input.plan];

      if (!priceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid plan selected",
        });
      }

      // Get or create Stripe customer
      let customerId = ctx.dbUser.stripeCustomerId;

      if (!customerId) {
        const customer = await getStripe().customers.create({
          email: ctx.dbUser.email,
          name: ctx.dbUser.name || undefined,
          metadata: {
            userId: ctx.dbUser.id,
            clerkId: ctx.dbUser.clerkId,
          },
        });
        customerId = customer.id;

        // Save customer ID
        await ctx.db
          .update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, ctx.dbUser.id));
      }

      // Create checkout session
      const session = await getStripe().checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
        metadata: {
          userId: ctx.dbUser.id,
          plan: input.plan,
        },
      });

      return { url: session.url };
    }),

  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    // Billing portal is only for paid plans
    if (ctx.dbUser.plan === "starter" && !ctx.dbUser.stripeCustomerId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Please upgrade to a paid plan to access the billing portal.",
      });
    }

    if (!ctx.dbUser.stripeCustomerId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No billing account found. Please subscribe to a plan first.",
      });
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: ctx.dbUser.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    });

    return { url: session.url };
  }),

  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.dbUser.stripeSubscriptionId) {
      return null;
    }

    try {
      const subscription = await getStripe().subscriptions.retrieve(
        ctx.dbUser.stripeSubscriptionId
      );

      const subData = subscription as Stripe.Subscription;

      return {
        id: subData.id,
        status: subData.status,
        currentPeriodEnd: new Date((subData as any).current_period_end * 1000),
        cancelAtPeriodEnd: (subData as any).cancel_at_period_end,
      };
    } catch {
      return null;
    }
  }),

  getPricingPlans: protectedProcedure.query(async () => {
    return [
      {
        id: "starter",
        name: "Starter",
        price: 999,
        description: "Perfect for small contractors",
        features: [
          "1 active project",
          "100 documents/month",
          "AI document processing",
          "Deadline alerts",
          "Email support",
        ],
        priceId: PRICE_IDS.starter,
      },
      {
        id: "professional",
        name: "Professional",
        price: 2499,
        description: "For growing construction firms",
        features: [
          "5 active projects",
          "Unlimited documents",
          "AI document processing",
          "Priority deadline alerts",
          "Compliance reports",
          "Priority support",
        ],
        popular: true,
        priceId: PRICE_IDS.professional,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: 4999,
        description: "For large-scale operations",
        features: [
          "Unlimited projects",
          "Unlimited documents",
          "Custom compliance rules",
          "API access",
          "Dedicated account manager",
          "Custom integrations",
          "SLA guarantee",
        ],
        priceId: PRICE_IDS.enterprise,
      },
    ];
  }),
});
