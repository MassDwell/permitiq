import { NextRequest } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authenticateApiKey, apiResponse, apiError } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth.success) {
    return auth.response;
  }

  // Fetch user's projects
  const userProjects = await db.query.projects.findMany({
    where: eq(projects.userId, auth.user.id),
    with: {
      complianceItems: {
        columns: { id: true, status: true, deadline: true, requirementType: true },
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
      status: project.status,
      healthScore,
      createdAt: project.createdAt,
    };
  });

  return apiResponse(data);
}
