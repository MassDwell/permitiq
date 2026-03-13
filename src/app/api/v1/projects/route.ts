import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createHash } from "crypto";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
  }

  const token = authHeader.substring(7);

  // Hash the provided key and look it up
  const keyHash = createHash("sha256").update(token).digest("hex");

  const apiKey = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)),
  });

  if (!apiKey) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  // Update lastUsedAt
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date(), updatedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id));

  // Fetch user's projects
  const userProjects = await db.query.projects.findMany({
    where: eq(projects.userId, apiKey.userId),
    with: {
      complianceItems: {
        columns: { id: true, status: true, deadline: true, requirementType: true },
      },
      documents: {
        columns: { id: true, filename: true, processingStatus: true, createdAt: true },
      },
    },
    orderBy: (p, { desc }) => [desc(p.updatedAt)],
  });

  const data = userProjects.map((project) => {
    const totalItems = project.complianceItems.length;
    const metItems = project.complianceItems.filter((i) => i.status === "met").length;
    const healthScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 100;

    return {
      id: project.id,
      name: project.name,
      address: project.address,
      jurisdiction: project.jurisdiction,
      projectType: project.projectType,
      status: project.status,
      healthScore,
      complianceItemCount: totalItems,
      documentCount: project.documents.length,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  });

  return NextResponse.json({
    data,
    meta: {
      total: data.length,
    },
  });
}
