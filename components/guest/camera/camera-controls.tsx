"use client";

import { FlipHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CameraControlsProps {
  mode: "photo" | "video";
  recording: boolean;
  onFlip: () => void;
  onCapture: () => void;
  onToggleMode: () => void;
}

export function CameraControls({
  mode,
  recording,
  onFlip,
  onCapture,
  onToggleMode,
}: CameraControlsProps) {
  return (
    <div className="flex items-center justify-center gap-8">
      <button
        type="button"
        onClick={onFlip}
        aria-label="Flip camera"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white"
      >
        <FlipHorizontal className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={onCapture}
        className={cn(
          "h-20 w-20 rounded-full border-4 border-white bg-white/20",
          recording && "animate-pulse bg-red-500/40"
        )}
        aria-label={mode === "photo" ? "Take photo" : recording ? "Stop recording" : "Start recording"}
      />
      <button
        type="button"
        onClick={onToggleMode}
        aria-label={mode === "photo" ? "Switch to video mode" : "Switch to photo mode"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white"
      >
        {mode === "photo" ? "VID" : "PIC"}
      </button>
    </div>
  );
}
