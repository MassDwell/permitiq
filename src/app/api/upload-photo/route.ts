import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { db } from "@/db";
import { documents, complianceItemDocuments, users, complianceItems, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get DB user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const complianceItemId = formData.get("complianceItemId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be less than 10MB" }, { status: 400 });
    }

    // Verify project access
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.userId, dbUser.id)
      ),
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Upload to Vercel Blob
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `Photo - ${timestamp} - ${file.name}`;
    
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    // Create document record
    const [doc] = await db
      .insert(documents)
      .values({
        projectId,
        userId: dbUser.id,
        filename,
        storageUrl: blob.url,
        docType: "other",
        processingStatus: "completed",
        processedAt: new Date(),
      })
      .returning();

    // If complianceItemId provided, create junction record
    if (complianceItemId) {
      // Verify compliance item exists and belongs to this project
      const item = await db.query.complianceItems.findFirst({
        where: and(
          eq(complianceItems.id, complianceItemId),
          eq(complianceItems.projectId, projectId)
        ),
      });

      if (item) {
        await db.insert(complianceItemDocuments).values({
          complianceItemId,
          documentId: doc.id,
        });
      }
    }

    return NextResponse.json({
      url: blob.url,
      documentId: doc.id,
    });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
