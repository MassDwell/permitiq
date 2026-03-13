import { NextRequest } from "next/server";
import { db } from "@/db";
import { apiWebhooks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticateApiKey, apiResponse, apiError } from "@/lib/api-auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth.success) {
    return auth.response;
  }

  let body: { webhookId?: string };
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body", "INVALID_BODY", 400);
  }

  if (!body.webhookId) {
    return apiError("webhookId is required", "MISSING_WEBHOOK_ID", 400);
  }

  const webhook = await db.query.apiWebhooks.findFirst({
    where: and(
      eq(apiWebhooks.id, body.webhookId),
      eq(apiWebhooks.userId, auth.user.id)
    ),
  });

  if (!webhook) {
    return apiError("Webhook not found", "NOT_FOUND", 404);
  }

  const payload = {
    event: "webhook.test",
    data: {
      message: "This is a test webhook from MeritLayer",
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  const bodyStr = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", webhook.secret)
    .update(bodyStr)
    .digest("hex");

  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MeritLayer-Signature": signature,
        "X-MeritLayer-Event": "webhook.test",
      },
      body: bodyStr,
      signal: AbortSignal.timeout(10000),
    });

    await db
      .update(apiWebhooks)
      .set({ lastTriggeredAt: new Date(), updatedAt: new Date() })
      .where(eq(apiWebhooks.id, webhook.id));

    return apiResponse({
      success: response.ok,
      statusCode: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    return apiResponse({
      success: false,
      statusCode: 0,
      statusText: error instanceof Error ? error.message : "Connection failed",
    });
  }
}
