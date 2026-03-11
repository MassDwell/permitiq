"use client";

import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Upload, FileText, Loader2, X } from "lucide-react";
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
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(
    new Map()
  );

  const utils = trpc.useUtils();

  const createDocument = trpc.documents.create.useMutation();
  const processDocument = trpc.documents.processDocument.useMutation();

  const uploadFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`${file.name}: Invalid file type. Allowed: PDF, JPEG, PNG, GIF, WebP`);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name}: File too large. Maximum size is 10MB`);
      return;
    }

    // Add to uploading files
    setUploadingFiles((prev) => {
      const next = new Map(prev);
      next.set(fileId, { file, progress: 0, status: "uploading" });
      return next;
    });

    try {
      // Upload to Vercel Blob
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || "Upload failed");
      }

      const { url, filename } = await uploadResponse.json();

      // Update progress
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
        filename,
        storageUrl: url,
      });

      // Auto-process the document
      await processDocument.mutateAsync({ documentId: doc.id });

      // Mark as complete
      setUploadingFiles((prev) => {
        const next = new Map(prev);
        const existing = next.get(fileId);
        if (existing) {
          next.set(fileId, { ...existing, progress: 100, status: "complete" });
        }
        return next;
      });

      // Refresh data
      utils.projects.get.invalidate({ id: projectId });

      toast.success(`${filename} uploaded and processed`);

      // Remove from list after a delay
      setTimeout(() => {
        setUploadingFiles((prev) => {
          const next = new Map(prev);
          next.delete(fileId);
          return next;
        });
      }, 2000);
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

      const files = Array.from(e.dataTransfer.files);
      files.forEach(uploadFile);
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
      const files = Array.from(e.target.files || []);
      files.forEach(uploadFile);
      e.target.value = "";
    },
    [projectId]
  );

  const removeUploadingFile = (fileId: string) => {
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
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
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

      {/* Uploading Files */}
      {uploadingFiles.size > 0 && (
        <div className="space-y-2">
          {Array.from(uploadingFiles.entries()).map(([fileId, item]) => (
            <div
              key={fileId}
              className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50"
            >
              <FileText className="h-6 w-6 text-blue-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.file.name}</p>
                {item.status === "uploading" && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Uploading...
                  </div>
                )}
                {item.status === "processing" && (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Processing with AI...
                  </div>
                )}
                {item.status === "complete" && (
                  <p className="text-xs text-green-600">Complete</p>
                )}
                {item.status === "error" && (
                  <p className="text-xs text-red-600">{item.error}</p>
                )}
              </div>
              {item.status !== "uploading" && item.status !== "processing" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeUploadingFile(fileId)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
