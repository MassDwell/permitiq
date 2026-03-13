import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { users, projects, complianceItems, documents, permitWorkflows } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  // AUDIT-FIX: Added authentication — endpoint was previously unauthenticated, exposing any project's data and burning API credits
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Rate limit: 20 requests per user per hour
  const rl = checkRateLimit(`document-chat:${clerkUserId}`, 20, 60 * 60 * 1000);
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
      status: 429,
      headers: { "Content-Type": "application/json", "X-RateLimit-Reset": String(rl.resetAt) },
    });
  }

  try {
    const body = (await req.json()) as {
      projectId: string;
      message: string;
      history: HistoryMessage[];
    };

    const { projectId, message, history = [] } = body;

    if (!projectId || !message?.trim()) {
      return new Response(JSON.stringify({ error: "projectId and message are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // AUDIT-FIX: Verify ownership — look up DB user and scope project query to their ID
    let dbUser;
    try {
      dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkUserId),
      });
    } catch (dbErr) {
      console.error("[document-chat] user lookup failed:", dbErr);
      return new Response(
        JSON.stringify({ error: `DB user lookup: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!dbUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Load project data scoped to the authenticated user
    let project;
    try {
      project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, dbUser.id)),
        with: {
          complianceItems: {
            orderBy: (ci, { asc }) => [asc(ci.deadline)],
          },
          documents: {
            orderBy: (d, { desc }) => [desc(d.createdAt)],
          },
          permitWorkflows: {
            orderBy: (pw, { asc }) => [asc(pw.createdAt)],
          },
        },
      });
    } catch (dbErr) {
      console.error("[document-chat] project query failed:", dbErr);
      return new Response(
        JSON.stringify({ error: `DB project query: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build context string from all project data
    const now = new Date();
    const lines: string[] = [
      `PROJECT: ${project.name}`,
      `ADDRESS: ${project.address ?? "N/A"}`,
      `JURISDICTION: ${project.jurisdiction ?? "N/A"}`,
      `TYPE: ${project.projectType}`,
      `STATUS: ${project.status}`,
      `CREATED: ${format(project.createdAt, "MMMM d, yyyy")}`,
      "",
    ];

    // Compliance items
    lines.push(`COMPLIANCE ITEMS (${project.complianceItems.length} total):`);
    const metCount = project.complianceItems.filter((i) => i.status === "met").length;
    const overdueCount = project.complianceItems.filter((i) => i.status === "overdue").length;
    const pendingCount = project.complianceItems.filter((i) => i.status === "pending").length;
    lines.push(`  Met: ${metCount}, Pending: ${pendingCount}, Overdue: ${overdueCount}`);
    lines.push("");

    for (const item of project.complianceItems) {
      const deadlineStr = item.deadline
        ? `deadline: ${format(new Date(item.deadline), "MMM d, yyyy")} (${Math.ceil((new Date(item.deadline).getTime() - now.getTime()) / 86400000)} days)`
        : "no deadline";
      lines.push(`  - [${item.status.toUpperCase()}] ${item.description} | type: ${item.requirementType} | ${deadlineStr}`);
      if (item.notes) lines.push(`    notes: ${item.notes}`);
    }

    lines.push("");
    lines.push(`PERMIT WORKFLOWS (${project.permitWorkflows.length} total):`);
    for (const pw of project.permitWorkflows) {
      const dueDateStr = pw.dueDate ? ` | due: ${format(new Date(pw.dueDate), "MMM d, yyyy")}` : "";
      lines.push(`  - [${pw.status.toUpperCase()}] ${pw.permitName} (${pw.permitCategory})${dueDateStr}`);
      if (pw.permitNumber) lines.push(`    permit #: ${pw.permitNumber}`);
      if (pw.assignedTo) lines.push(`    assigned to: ${pw.assignedTo}`);
      if (pw.notes) lines.push(`    notes: ${pw.notes}`);
    }

    lines.push("");
    lines.push(`DOCUMENTS (${project.documents.length} uploaded):`);
    for (const doc of project.documents) {
      lines.push(`  - ${doc.filename} | type: ${doc.docType ?? "unknown"} | status: ${doc.processingStatus} | uploaded: ${format(new Date(doc.createdAt), "MMM d, yyyy")}`);
    }

    const contextString = lines.join("\n");

    // Build message history for Claude
    const anthropicMessages: Array<{ role: "user" | "assistant"; content: string }> = [
      {
        role: "user",
        content: `Here is the current project data:\n\n<project_data>\n${contextString}\n</project_data>\n\nPlease keep this context in mind for our conversation.`,
      },
      {
        role: "assistant",
        content: "I have reviewed the project data. I'm ready to answer questions about this construction project's compliance items, permit workflows, documents, and deadlines.",
      },
      ...history.filter((m) => m.content?.trim()),
      { role: "user", content: message },
    ];

    // Buffer the full response instead of streaming — more reliable on Vercel serverless
    const aiResponse = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system:
        "You are a permit compliance assistant for MeritLayer. Answer questions about this construction project based on the provided project data. Be specific, cite deadlines and requirements. Format your responses clearly using plain text (no markdown headers, but you can use bullet points). If you don't know something from the data, say so. Keep answers concise and actionable.",
      messages: anthropicMessages,
    });

    const text = aiResponse.content[0]?.type === "text" ? aiResponse.content[0].text : "";

    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[document-chat]", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Failed to process request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
