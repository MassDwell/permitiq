"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PhotoCaptureProps {
  projectId: string;
  complianceItemId: string;
  onPhotoUploaded?: (url: string, documentId: string) => void;
}

export function PhotoCapture({
  projectId,
  complianceItemId,
  onPhotoUploaded,
}: PhotoCaptureProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);
      formData.append("complianceItemId", complianceItemId);

      const response = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const { url, documentId } = await response.json();
      toast.success("Photo uploaded");
      onPhotoUploaded?.(url, documentId);
      setPreview(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      setPreview(null);
    } finally {
      setIsUploading(false);
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemovePreview = () => {
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="relative inline-flex">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        id={`photo-capture-${complianceItemId}`}
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-16 h-16 object-cover rounded-lg border border-slate-600"
          />
          {isUploading ? (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          ) : (
            <button
              onClick={handleRemovePreview}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-1.5"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Add Photo</span>
        </Button>
      )}
    </div>
  );
}
