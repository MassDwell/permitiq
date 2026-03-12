"use client";

import { useState, useCallback, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Upload, FileText, Loader2, X, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DocumentUploadZoneProps {
  projectId: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  error?: string;
  docId?: string;
  extractedCount?: number;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUploadZone({ projectId }: DocumentUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());
  const pollingIntervals = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const utils = trpc.useUtils();
  const createDocument = trpc.documents.create.useMutation();
  const processDocument = trpc.documents.processDocument.useMutation();

  const startPolling = (fileId: string, docId: string) => {
    // Clear existing interval for this file
    const existing = pollingIntervals.current.get(fileId);
    if (existing) clearInterval(existing);

    const interval = setInterval(async () => {
      try {
        const result = await utils.documents.getStatus.fetch({ id: docId });

        if (result.processingStatus === "completed") {
          clearInterval(interval);
          pollingIntervals.current.delete(fileId);

          const extractedCount =
            (result.extractedData?.deadlines?.length ?? 0) +
            (result.extractedData?.requiredInspections?.length ?? 0) +
            (result.extractedData?.complianceRequirements?.length ?? 0);

          setUploadingFiles((prev) => {
            const next = new Map(prev);
            const existing = next.get(fileId);
            if (existing) {
              next.set(fileId, { ...existing, status: "complete", extractedCount, progress: 100 });
            }
            return next;
          });

          utils.projects.get.invalidate({ id: projectId });
          toast.success(
            extractedCount > 0
              ? `Extracted ${extractedCount} compliance requirement${extractedCount === 1 ? "" : "s"}`
              : "Document processed successfully"
          );

          // Remove from list after 3s
          setTimeout(() => {
            setUploadingFiles((prev) => {
              const next = new Map(prev);
              next.delete(fileId);
              return next;
            });
          }, 3000);
        } else if (result.processingStatus === "failed") {
          clearInterval(interval);
          pollingIntervals.current.delete(fileId);

          setUploadingFiles((prev) => {
            const next = new Map(prev);
            const existing = next.get(fileId);
            if (existing) {
              next.set(fileId, {
                ...existing,
                status: "error",
                error: result.processingError ?? "Processing failed",
                docId,
              });
            }
            return next;
          });

          toast.error("Document processing failed", {
            action: {
              label: "Retry",
              onClick: () => retryProcessing(fileId, docId),
            },
          });
        }
      } catch {
        clearInterval(interval);
        pollingIntervals.current.delete(fileId);
      }
    }, 3000);

    pollingIntervals.current.set(fileId, interval);
  };

  const retryProcessing = async (fileId: string, docId: string) => {
    setUploadingFiles((prev) => {
      const next = new Map(prev);
      const existing = next.get(fileId);
      if (existing) {
        next.set(fileId, { ...existing, status: "processing", error: undefined });
      }
      return next;
    });

    try {
      await processDocument.mutateAsync({ documentId: docId });
      startPolling(fileId, docId);
    } catch {
      setUploadingFiles((prev) => {
        const next = new Map(prev);
        const existing = next.get(fileId);
        if (existing) {
          next.set(fileId, { ...existing, status: "error", error: "Retry failed" });
        }
        return next;
      });
    }
  };

  const uploadFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`${file.name}: Invalid file type. Allowed: PDF, JPEG, PNG, GIF, WebP`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name}: File too large. Maximum size is 10MB`);
      return;
    }

    setUploadingFiles((prev) => {
      const next = new Map(prev);
      next.set(fileId, { file, progress: 0, status: "uploading" });
      return next;
    });

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const pathname = `documents/${projectId}/${Date.now()}-${sanitizedName}`;

      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      setUploadingFiles((prev) => {
        const next = new Map(prev);
        const existing = next.get(fileId);
        if (existing) {
          next.set(fileId, { ...existing, progress: 50, status: "processing" });
        }
        return next;
      });

      // Create document record
      const doc = await createDocument.mutateAsync({
        projectId,
        filename: file.name,
        storageUrl: blob.url,
      });

      // Update with docId
      setUploadingFiles((prev) => {
        const next = new Map(prev);
        const existing = next.get(fileId);
        if (existing) {
          next.set(fileId, { ...existing, docId: doc.id });
        }
        return next;
      });

      // Fire document processing (don't await — poller tracks completion)
      processDocument.mutateAsync({ documentId: doc.id }).catch(() => {
        // Error state will be caught by poller detecting "failed" status
      });

      // Start polling for this document
      startPolling(fileId, doc.id);
    } catch (error) {
      setUploadingFiles((prev) => {
        const next = new Map(prev);
        const existing = next.get(fileId);
        if (existing) {
          next.set(fileId, {
            ...existing,
            status: "error",
            error: error instanceof Error ? error.message : "Upload failed",
          });
        }
        return next;
      });
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      Array.from(e.dataTransfer.files).forEach(uploadFile);
    },
    [projectId]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      Array.from(e.target.files || []).forEach(uploadFile);
      e.target.value = "";
    },
    [projectId]
  );

  const removeUploadingFile = (fileId: string) => {
    const interval = pollingIntervals.current.get(fileId);
    if (interval) {
      clearInterval(interval);
      pollingIntervals.current.delete(fileId);
    }
    setUploadingFiles((prev) => {
      const next = new Map(prev);
      next.delete(fileId);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        )}
      >
        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-1">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-gray-500 mb-4">
          PDF, JPEG, PNG, GIF, or WebP up to 10MB
        </p>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
          multiple
          onChange={handleFileSelect}
        />
        <label htmlFor="file-upload">
          <Button asChild>
            <span>Select Files</span>
          </Button>
        </label>
      </div>

      {uploadingFiles.size > 0 && (
        <div className="space-y-2">
          {Array.from(uploadingFiles.entries()).map(([fileId, item]) => (
            <div
              key={fileId}
              className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50"
            >
              <FileText className="h-6 w-6 text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.file.name}</p>
                {item.status === "uploading" && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Uploading...
                  </div>
                )}
                {item.status === "processing" && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 mt-0.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Analyzing document with AI...
                  </div>
                )}
                {item.status === "complete" && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 mt-0.5">
                    <CheckCircle className="h-3 w-3" />
                    {item.extractedCount && item.extractedCount > 0
                      ? `Extracted ${item.extractedCount} compliance requirement${item.extractedCount === 1 ? "" : "s"}`
                      : "Complete"}
                  </div>
                )}
                {item.status === "error" && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 mt-0.5">
                    <AlertCircle className="h-3 w-3" />
                    {item.error}
                  </div>
                )}
                {(item.status === "uploading" || item.status === "processing") && (
                  <Progress
                    value={item.status === "uploading" ? item.progress : 75}
                    className="h-1 mt-1.5"
                  />
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {item.status === "error" && item.docId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => retryProcessing(fileId, item.docId!)}
                    className="text-xs gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Retry
                  </Button>
                )}
                {item.status !== "uploading" && item.status !== "processing" && (
                  <Button size="sm" variant="ghost" onClick={() => removeUploadingFile(fileId)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
