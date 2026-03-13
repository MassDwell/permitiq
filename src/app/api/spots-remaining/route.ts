// AUDIT-FIX: Dynamic founding spots count based on actual paid user count
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ne } from "drizzle-orm";

const SPOTS_TOTAL = 50;

export const revalidate = 60; // cache for 1 minute

export async function GET() {
  try {
    const paidUsers = await db
      .select()
      .from(users)
      .where(ne(users.plan, "starter"));
    const used = paidUsers.length;
    const remaining = Math.max(0, SPOTS_TOTAL - used);
    return NextResponse.json({ remaining, total: SPOTS_TOTAL, used });
  } catch {
    // Fallback to static value if DB unavailable
    return NextResponse.json({ remaining: 47, total: SPOTS_TOTAL, used: 3 });
  }
}
