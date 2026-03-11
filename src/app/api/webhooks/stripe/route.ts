import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();
  const signature = headerPayload.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Webhook Error", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as "starter" | "professional" | "enterprise";

        if (userId && plan) {
          await db
            .update(users)
            .set({
              plan,
              stripeSubscriptionId: session.subscription as string,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          console.log(`Updated user ${userId} to plan ${plan}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripe customer ID
        const user = await db.query.users.findFirst({
          where: eq(users.stripeCustomerId, customerId),
        });

        if (user) {
          // Map price ID to plan
          const priceId = subscription.items.data[0]?.price.id;
          let plan: "starter" | "professional" | "enterprise" = "starter";

          if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
            plan = "professional";
          } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
            plan = "enterprise";
          }

          await db
            .update(users)
            .set({
              plan,
              stripeSubscriptionId: subscription.id,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

          console.log(`Subscription updated for user ${user.id}: ${plan}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user and downgrade to starter
        const user = await db.query.users.findFirst({
          where: eq(users.stripeCustomerId, customerId),
        });

        if (user) {
          await db
            .update(users)
            .set({
              plan: "starter",
              stripeSubscriptionId: null,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

          console.log(`Subscription cancelled for user ${user.id}, downgraded to starter`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const user = await db.query.users.findFirst({
          where: eq(users.stripeCustomerId, customerId),
        });

        if (user) {
          console.log(`Payment failed for user ${user.id}`);
          // Could add notification or status update here
        }
        break;
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response("Webhook handler error", { status: 500 });
  }
}
