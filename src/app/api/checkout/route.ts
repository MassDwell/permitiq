import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const getStripe = () =>
  new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim(), {
    apiVersion: "2026-02-25.clover",
  });

type PlanName = "starter" | "professional" | "enterprise";

// Map Stripe price IDs to plan names
// Includes both founder (introductory) and regular price IDs
// These IDs are already public in the client-side pricing page
const HARDCODED_PRICES: Record<string, PlanName> = {
  // Solo / Starter — founder + regular
  "price_1TAKUV8WeSNkRrKoSn83vPyr": "starter",
  "price_1TAIiZ94ePmNThnD8A8bjdVn": "starter",
  // Developer / Professional — founder + regular
  "price_1TAKUW8WeSNkRrKo864hCugD": "professional",
  "price_1TAIia94ePmNThnD1mr2KDJT": "professional",
  // Portfolio / Enterprise — founder + regular
  "price_1TAKUX8WeSNkRrKoG6rVbNmn": "enterprise",
  "price_1TAIib94ePmNThnDBfqopr9e": "enterprise",
};

const ENV_PRICES: Record<string, PlanName> = {};
if (process.env.STRIPE_STARTER_PRICE_ID) ENV_PRICES[process.env.STRIPE_STARTER_PRICE_ID] = "starter";
if (process.env.STRIPE_PROFESSIONAL_PRICE_ID) ENV_PRICES[process.env.STRIPE_PROFESSIONAL_PRICE_ID] = "professional";
if (process.env.STRIPE_ENTERPRISE_PRICE_ID) ENV_PRICES[process.env.STRIPE_ENTERPRISE_PRICE_ID] = "enterprise";

const PRICE_TO_PLAN: Record<string, PlanName> = { ...HARDCODED_PRICES, ...ENV_PRICES };

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: "priceId is required" }, { status: 400 });
    }

    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's database ID
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Map price ID to plan name
    const plan = PRICE_TO_PLAN[priceId];
    if (!plan) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    // AUDIT-FIX: Use NEXT_PUBLIC_APP_URL env var instead of hardcoded domain — works correctly in staging/preview
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://meritlayer.ai").trim().replace(/\/$/, "");
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?welcome=true`,
      cancel_url: `${appUrl}/pricing`,
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const stripeErr = err as { type?: string; code?: string; statusCode?: number; message?: string };
    console.error("[checkout] Stripe error:", {
      type: stripeErr?.type,
      code: stripeErr?.code,
      statusCode: stripeErr?.statusCode,
      message: stripeErr?.message,
      keyMode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? "live" : "test",
    });
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
