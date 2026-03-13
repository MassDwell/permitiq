/**
 * Webhook Dispatch Utility
 * CLA-112: Fire-and-forget webhook delivery to user-registered endpoints
 */

import { db } from "@/db";
import { apiWebhooks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export type WebhookEvent =
  | "requirement.status_changed"
  | "project.created"
  | "requirement.overdue";

export interface WebhookPayload {
  event: WebhookEvent;
  data: Record<string, unknown>;
  timestamp: string;
}

/**
 * Dispatch a webhook event to all matching active webhooks for a user.
 * Fire-and-forget: does not await delivery, logs errors only.
 */
export function dispatchWebhook(
  userId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>
): void {
  // Fire-and-forget: run async without awaiting
  void dispatchWebhookAsync(userId, event, payload);
}

async function dispatchWebhookAsync(
  userId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    // Find active webhooks for this user that subscribe to this event
    const webhooks = await db.query.apiWebhooks.findMany({
      where: and(
        eq(apiWebhooks.userId, userId),
        eq(apiWebhooks.isActive, true)
      ),
    });

    // Filter to webhooks subscribed to this event
    const matchingWebhooks = webhooks.filter(
      (w) => w.events && w.events.includes(event)
    );

    if (matchingWebhooks.length === 0) {
      return;
    }

    const webhookPayload: WebhookPayload = {
      event,
      data: payload,
      timestamp: new Date().toISOString(),
    };

    const body = JSON.stringify(webhookPayload);

    // Fire all webhooks in parallel (fire-and-forget each)
    const deliveryPromises = matchingWebhooks.map(async (webhook) => {
      try {
        const signature = crypto
          .createHmac("sha256", webhook.secret)
          .update(body)
          .digest("hex");

        const response = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-MeritLayer-Signature": signature,
            "X-MeritLayer-Event": event,
          },
          body,
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        // Update last triggered timestamp on success
        if (response.ok) {
          await db
            .update(apiWebhooks)
            .set({ lastTriggeredAt: new Date(), updatedAt: new Date() })
            .where(eq(apiWebhooks.id, webhook.id));
        } else {
          console.error(
            `[webhook] Delivery failed to ${webhook.url}: ${response.status} ${response.statusText}`
          );
        }
      } catch (error) {
        console.error(
          `[webhook] Delivery error to ${webhook.url}:`,
          error instanceof Error ? error.message : error
        );
      }
    });

    // Wait for all deliveries to complete (but don't block the caller)
    await Promise.allSettled(deliveryPromises);
  } catch (error) {
    console.error("[webhook] Dispatch error:", error);
  }
}

/**
 * Helper to create a requirement status changed payload
 */
export function createRequirementStatusPayload(data: {
  projectId: string;
  projectName: string;
  requirementId: string;
  requirementType: string;
  description: string;
  oldStatus: string;
  newStatus: string;
}): Record<string, unknown> {
  return {
    projectId: data.projectId,
    projectName: data.projectName,
    requirement: {
      id: data.requirementId,
      type: data.requirementType,
      description: data.description,
    },
    statusChange: {
      from: data.oldStatus,
      to: data.newStatus,
    },
  };
}

/**
 * Helper to create a project created payload
 */
export function createProjectCreatedPayload(data: {
  projectId: string;
  projectName: string;
  address?: string | null;
  jurisdiction?: string | null;
  projectType: string;
}): Record<string, unknown> {
  return {
    projectId: data.projectId,
    projectName: data.projectName,
    address: data.address,
    jurisdiction: data.jurisdiction,
    projectType: data.projectType,
  };
}
