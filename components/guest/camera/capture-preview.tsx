"use client";

import { RotateCcw, Upload } from "lucide-react";

interface CapturePreviewProps {
  previewUrl: string;
  uploading: boolean;
  onRetake: () => void;
  onUpload: () => void;
}

export function CapturePreview({
  previewUrl,
  uploading,
  onRetake,
  onUpload,
}: CapturePreviewProps) {
  return (
    <div className="relative min-h-svh bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={previewUrl} alt="Captured photo preview" className="h-svh w-full object-contain" />
      <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-4 px-6">
        <button
          type="button"
          onClick={onRetake}
          aria-label="Retake photo"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white"
        >
          <RotateCcw className="h-6 w-6" />
        </button>
        <button
          type="button"
          disabled={uploading}
          onClick={onUpload}
          aria-label={uploading ? "Uploading photo" : "Upload photo"}
          className="flex h-14 flex-1 max-w-xs items-center justify-center gap-2 rounded-full bg-white text-black font-semibold"
        >
          <Upload className="h-5 w-5" />
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>
    </div>
  );
}
