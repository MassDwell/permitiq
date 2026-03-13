/**
 * API Authentication Utility
 * CLA-112: X-API-Key authentication for public REST API
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createHash } from "crypto";
import { checkRateLimit } from "./rate-limit";

export interface ApiUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  plan: "starter" | "professional" | "enterprise";
}

export interface AuthResult {
  success: true;
  user: ApiUser;
  apiKeyId: string;
}

export interface AuthError {
  success: false;
  response: NextResponse;
}

/**
 * Authenticate an API request using X-API-Key header.
 * Also supports Bearer token for backwards compatibility.
 * Returns user info on success or error response on failure.
 */
export async function authenticateApiKey(
  req: NextRequest
): Promise<AuthResult | AuthError> {
  // Try X-API-Key header first, then fall back to Bearer token
  let token = req.headers.get("x-api-key");

  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Missing API key",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      ),
    };
  }

  // Hash the provided key and look it up
  const keyHash = createHash("sha256").update(token).digest("hex");

  const apiKey = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)),
    with: {
      user: true,
    },
  });

  if (!apiKey || !apiKey.user) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Invalid API key",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      ),
    };
  }

  // Check rate limit: 100 requests per hour per API key
  const rateLimitKey = `api:${apiKey.id}`;
  const rateLimit = checkRateLimit(rateLimitKey, 100, 60 * 60 * 1000); // 100 req/hour

  if (!rateLimit.allowed) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Rate limit exceeded",
          code: "RATE_LIMITED",
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(Math.floor(rateLimit.resetAt / 1000)),
          },
        }
      ),
    };
  }

  // Update last used timestamp (fire-and-forget)
  void db
    .update(apiKeys)
    .set({ lastUsedAt: new Date(), updatedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id))
    .catch((err) => console.error("[api-auth] Failed to update lastUsedAt:", err));

  return {
    success: true,
    user: {
      id: apiKey.user.id,
      clerkId: apiKey.user.clerkId,
      email: apiKey.user.email,
      name: apiKey.user.name,
      plan: apiKey.user.plan,
    },
    apiKeyId: apiKey.id,
  };
}

/**
 * Helper to create API response with standard meta
 */
export function apiResponse<T>(data: T, statusCode = 200): NextResponse {
  return NextResponse.json(
    {
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: "v1",
      },
    },
    { status: statusCode }
  );
}

/**
 * Helper to create API error response
 */
export function apiError(error: string, code: string, statusCode = 400): NextResponse {
  return NextResponse.json(
    {
      error,
      code,
    },
    { status: statusCode }
  );
}
