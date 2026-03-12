import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, projects, complianceItems, permitWorkflows } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  // Verify project ownership
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, user.id)),
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch compliance items
  const items = await db.query.complianceItems.findMany({
    where: eq(complianceItems.projectId, projectId),
    with: { document: { columns: { filename: true } } },
  });

  // Fetch permit workflows
  const permits = await db.query.permitWorkflows.findMany({
    where: eq(permitWorkflows.projectId, projectId),
  });

  // Build CSV rows
  const rows: string[] = [];

  // Header
  rows.push(csvRow(["Type", "Description", "Status", "Deadline", "Source", "Notes", "Source URL"]));

  // Compliance items
  for (const item of items) {
    rows.push(csvRow([
      item.requirementType.replace(/_/g, " "),
      item.description,
      item.status,
      item.deadline ? format(new Date(item.deadline), "yyyy-MM-dd") : "",
      item.source ?? "",
      item.notes ?? "",
      item.sourceUrl ?? "",
    ]));
  }

  // Permit workflows as a second section
  if (permits.length > 0) {
    rows.push(""); // blank separator
    rows.push(csvRow(["Permit Name", "Category", "Status", "Due Date", "Permit Number", "Estimated Fee", "Assigned To"]));
    for (const permit of permits) {
      rows.push(csvRow([
        permit.permitName,
        permit.permitCategory.replace(/_/g, " "),
        permit.status.replace(/_/g, " "),
        permit.dueDate ? format(new Date(permit.dueDate), "yyyy-MM-dd") : "",
        permit.permitNumber ?? "",
        permit.estimatedFee ? `$${permit.estimatedFee}` : "",
        permit.assignedTo ?? "",
      ]));
    }
  }

  const csv = rows.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="checklist-${projectId.slice(0, 8)}.csv"`,
    },
  });
}

function csvRow(fields: string[]): string {
  return fields
    .map((f) => {
      const str = String(f ?? "").replace(/"/g, '""');
      return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str;
    })
    .join(",");
}
