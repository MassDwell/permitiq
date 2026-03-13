import { projects, projectMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";

/**
 * Asserts the current user (owner or accepted collaborator) has access to a project.
 * Throws NOT_FOUND if the project doesn't exist or the user has no access.
 * Returns the project on success.
 *
 * @param dbInstance  - Drizzle DB instance (ctx.db)
 * @param projectId   - The project UUID to check
 * @param dbUserId    - UUID from the users table (ctx.dbUser.id) — used for owner check
 * @param clerkUserId - Clerk user ID (ctx.userId) — used for collaborator check
 */
export async function assertProjectAccess(
  dbInstance: typeof db,
  projectId: string,
  dbUserId: string,
  clerkUserId: string,
) {
  const project = await dbInstance.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
  }

  if (project.userId !== dbUserId) {
    const membership = await dbInstance.query.projectMembers.findFirst({
      where: and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, clerkUserId),
        eq(projectMembers.inviteStatus, "accepted"),
      ),
    });
    if (!membership) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
    }
  }

  return project;
}
