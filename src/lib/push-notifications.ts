import webpush from "web-push";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

// Configure web-push with VAPID keys
// Generate keys with: npx web-push generate-vapid-keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:alerts@meritlayer.ai",
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("VAPID keys not configured, skipping push notification");
    return { sent: 0, failed: 0 };
  }

  // Get all subscriptions for user
  const subscriptions = await db.query.pushSubscriptions.findMany({
    where: eq(pushSubscriptions.userId, userId),
  });

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url || "/dashboard",
            icon: payload.icon || "/icon-192.svg",
            badge: payload.badge || "/icon-192.svg",
            tag: payload.tag,
          })
        );
        return true;
      } catch (error) {
        // If subscription is invalid (410 Gone), remove it
        if (
          error instanceof webpush.WebPushError &&
          (error.statusCode === 410 || error.statusCode === 404)
        ) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id));
        }
        throw error;
      }
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return { sent, failed };
}

export async function sendDeadlineAlert(
  userId: string,
  projectName: string,
  itemDescription: string,
  daysUntilDue: number,
  projectId: string
): Promise<void> {
  const urgency =
    daysUntilDue <= 1 ? "urgent" : daysUntilDue <= 3 ? "soon" : "upcoming";

  const title =
    urgency === "urgent"
      ? `Deadline Tomorrow: ${projectName}`
      : `Deadline in ${daysUntilDue} days`;

  const body = itemDescription.slice(0, 100);

  await sendPushNotification(userId, {
    title,
    body,
    url: `/projects/${projectId}`,
    tag: `deadline-${projectId}`,
  });
}
