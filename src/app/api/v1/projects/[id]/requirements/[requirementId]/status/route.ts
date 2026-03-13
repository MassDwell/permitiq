import { NextRequest } from "next/server";
import { db } from "@/db";
import { projects, complianceItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticateApiKey, apiResponse, apiError } from "@/lib/api-auth";
import { dispatchWebhook, createRequirementStatusPayload } from "@/lib/webhooks";

const VALID_STATUSES = ["pending", "in_progress", "met", "overdue", "not_applicable"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; requirementId: string }> }
) {
  const auth = await authenticateApiKey(req);
  if (!auth.success) {
    return auth.response;
  }

  const { id, requirementId } = await params;

  // Validate UUID formats
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return apiError("Invalid project ID format", "INVALID_PROJECT_ID", 400);
  }
  if (!uuidRegex.test(requirementId)) {
    return apiError("Invalid requirement ID format", "INVALID_REQUIREMENT_ID", 400);
  }

  // Parse request body
  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body", "INVALID_BODY", 400);
  }

  if (!body.status || !VALID_STATUSES.includes(body.status as ValidStatus)) {
    return apiError(
      `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      "INVALID_STATUS",
      400
    );
  }

  const newStatus = body.status as ValidStatus;

  // Verify project ownership
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.userId, auth.user.id)),
  });

  if (!project) {
    return apiError("Project not found", "NOT_FOUND", 404);
  }

  // Fetch the compliance item
  const item = await db.query.complianceItems.findFirst({
    where: and(
      eq(complianceItems.id, requirementId),
      eq(complianceItems.projectId, id)
    ),
  });

  if (!item) {
    return apiError("Requirement not found", "NOT_FOUND", 404);
  }

  const oldStatus = item.status;

  // Update the status
  const [updated] = await db
    .update(complianceItems)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(complianceItems.id, requirementId))
    .returning();

  // Dispatch webhook if status changed
  if (newStatus !== oldStatus) {
    dispatchWebhook(
      auth.user.id,
      "requirement.status_changed",
      createRequirementStatusPayload({
        projectId: project.id,
        projectName: project.name,
        requirementId: item.id,
        requirementType: item.requirementType,
        description: item.description,
        oldStatus,
        newStatus,
      })
    );
  }

  return apiResponse({
    id: updated.id,
    requirementType: updated.requirementType,
    description: updated.description,
    status: updated.status,
    deadline: updated.deadline,
    updatedAt: updated.updatedAt,
  });
}
