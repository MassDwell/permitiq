import { NextRequest } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
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

  // Fetch project with compliance items
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.userId, auth.user.id)),
    with: {
      complianceItems: {
        columns: {
          id: true,
          requirementType: true,
          description: true,
          status: true,
          deadline: true,
          jurisdiction: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!project) {
    return apiError("Project not found", "NOT_FOUND", 404);
  }

  const totalItems = project.complianceItems.length;
  const metItems = project.complianceItems.filter((i) => i.status === "met").length;
  const healthScore = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 100;

  return apiResponse({
    id: project.id,
    name: project.name,
    address: project.address,
    jurisdiction: project.jurisdiction,
    projectType: project.projectType,
    status: project.status,
    description: project.description,
    healthScore,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    complianceItems: project.complianceItems.map((item) => ({
      id: item.id,
      requirementType: item.requirementType,
      description: item.description,
      status: item.status,
      deadline: item.deadline,
      jurisdiction: item.jurisdiction,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
  });
}
