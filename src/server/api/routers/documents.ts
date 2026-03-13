import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { documents, projects, complianceItems } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { processDocumentWithAI } from "@/lib/ai/document-processor";
import { sendDocumentProcessedEmail } from "@/lib/email";
import { assertProjectAccess } from "../project-access";

export const documentsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ projectId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.projectId) {
        // Verify owner or accepted collaborator
        await assertProjectAccess(ctx.db, input.projectId, ctx.dbUser.id, ctx.userId);

        return ctx.db.query.documents.findMany({
          where: eq(documents.projectId, input.projectId),
          orderBy: [desc(documents.createdAt)],
        });
      }

      // Get all documents for user
      return ctx.db.query.documents.findMany({
        where: eq(documents.userId, ctx.dbUser.id),
        orderBy: [desc(documents.createdAt)],
        with: {
          project: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const doc = await ctx.db.query.documents.findFirst({
        where: eq(documents.id, input.id),
        with: {
          project: true,
          complianceItems: true,
        },
      });

      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      await assertProjectAccess(ctx.db, doc.projectId, ctx.dbUser.id, ctx.userId);

      return doc;
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        filename: z.string(),
        storageUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.dbUser.id)
        ),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Check document limits for starter plan
      if (ctx.dbUser.plan === "starter") {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const monthlyDocs = await ctx.db
          .select({ count: count() })
          .from(documents)
          .where(
            and(
              eq(documents.userId, ctx.dbUser.id),
              // Simple approach: count all docs created this month
            )
          );

        if (monthlyDocs[0].count >= 100) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You've reached your monthly document limit (100). Please upgrade to upload more.",
          });
        }
      }

      const [newDoc] = await ctx.db
        .insert(documents)
        .values({
          projectId: input.projectId,
          userId: ctx.dbUser.id,
          filename: input.filename,
          storageUrl: input.storageUrl,
          processingStatus: "pending",
        })
        .returning();

      return newDoc;
    }),

  processDocument: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.db.query.documents.findFirst({
        where: and(
          eq(documents.id, input.documentId),
          eq(documents.userId, ctx.dbUser.id)
        ),
        with: {
          project: true,
        },
      });

      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      // Update status to processing
      await ctx.db
        .update(documents)
        .set({ processingStatus: "processing" })
        .where(eq(documents.id, input.documentId));

      try {
        // Process with AI
        const extractedData = await processDocumentWithAI(doc.storageUrl, doc.filename);

        // Update document with extracted data
        await ctx.db
          .update(documents)
          .set({
            extractedData,
            docType: extractedData.documentType as any,
            processingStatus: "completed",
            processedAt: new Date(),
          })
          .where(eq(documents.id, input.documentId));

        // Create compliance items from extracted data
        if (extractedData.deadlines?.length) {
          for (const deadline of extractedData.deadlines) {
            await ctx.db.insert(complianceItems).values({
              projectId: doc.projectId,
              documentId: input.documentId,
              requirementType: deadline.type || "deadline",
              description: deadline.description,
              deadline: new Date(deadline.date),
              jurisdiction: extractedData.issuingJurisdiction || doc.project.jurisdiction,
              source: "extracted",
              status: "pending",
            });
          }
        }

        if (extractedData.requiredInspections?.length) {
          for (const inspection of extractedData.requiredInspections) {
            await ctx.db.insert(complianceItems).values({
              projectId: doc.projectId,
              documentId: input.documentId,
              requirementType: "inspection",
              description: inspection.name,
              deadline: inspection.scheduledDate ? new Date(inspection.scheduledDate) : undefined,
              jurisdiction: extractedData.issuingJurisdiction || doc.project.jurisdiction,
              source: "extracted",
              status: inspection.status === "passed" ? "met" : "pending",
            });
          }
        }

        if (extractedData.complianceRequirements?.length) {
          for (const req of extractedData.complianceRequirements) {
            await ctx.db.insert(complianceItems).values({
              projectId: doc.projectId,
              documentId: input.documentId,
              requirementType: "requirement",
              description: req.requirement,
              notes: req.notes,
              jurisdiction: extractedData.issuingJurisdiction || doc.project.jurisdiction,
              source: "extracted",
              status: req.status === "met" ? "met" : "pending",
            });
          }
        }

        // Calculate how many items were extracted
        const extractedCount =
          (extractedData.deadlines?.length ?? 0) +
          (extractedData.requiredInspections?.length ?? 0) +
          (extractedData.complianceRequirements?.length ?? 0);

        // Send "document is ready" email (fire-and-forget)
        sendDocumentProcessedEmail({
          to: ctx.dbUser.email,
          userName: ctx.dbUser.name,
          projectName: doc.project.name,
          projectId: doc.projectId,
          documentName: doc.filename,
          extractedCount,
        }).catch((err) => console.error("[email] document processed email failed:", err));

        return { success: true, extractedData };
      } catch (error) {
        // Update with error
        await ctx.db
          .update(documents)
          .set({
            processingStatus: "failed",
            processingError: error instanceof Error ? error.message : "Unknown error",
          })
          .where(eq(documents.id, input.documentId));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process document",
          cause: error,
        });
      }
    }),

  getStatus: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const doc = await ctx.db.query.documents.findFirst({
        where: eq(documents.id, input.id),
        columns: {
          id: true,
          projectId: true,
          processingStatus: true,
          processingError: true,
          extractedData: true,
        },
      });

      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      await assertProjectAccess(ctx.db, doc.projectId, ctx.dbUser.id, ctx.userId);

      return doc;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(documents)
        .where(
          and(eq(documents.id, input.id), eq(documents.userId, ctx.dbUser.id))
        )
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      return { success: true };
    }),
});
