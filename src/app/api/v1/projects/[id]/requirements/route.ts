import { NextRequest } from "next/server";
import { db } from "@/db";
import { projects, complianceItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticateApiKey, apiResponse, apiError } from "@/lib/api-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiKey(req);
  if (!auth.success) {
    return auth.response;
  }

  const { id } = await params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return apiError("Invalid project ID format", "INVALID_ID", 400);
  }

  // Verify project ownership
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.userId, auth.user.id)),
  });

  if (!project) {
    return apiError("Project not found", "NOT_FOUND", 404);
  }

  // Fetch compliance items
  const items = await db.query.complianceItems.findMany({
    where: eq(complianceItems.projectId, id),
    orderBy: (ci, { desc }) => [ci.deadline, desc(ci.createdAt)],
  });

  return apiResponse(
    items.map((item) => ({
      id: item.id,
      requirementType: item.requirementType,
      description: item.description,
      status: item.status,
      deadline: item.deadline,
      jurisdiction: item.jurisdiction,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
  );
}
