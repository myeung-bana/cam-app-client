"use client";

import { useEffect, useRef } from "react";
import { FILTER_PRESETS } from "@/lib/camera/filter-presets";
import { cn } from "@/lib/utils/cn";

interface FilterStripProps {
  /** Blob URL or data URL of the captured frame (review screen). */
  imageUrl: string;
  filterId: string;
  onSelect: (id: string) => void;
}

export function FilterStrip({ imageUrl, filterId, onSelect }: FilterStripProps) {
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const drawnForUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!imageUrl || drawnForUrlRef.current === imageUrl) return;

    const img = new Image();
    img.onload = () => {
      const thumbSize = 48;
      for (const preset of FILTER_PRESETS) {
        const canvas = canvasRefs.current.get(preset.id);
        if (!canvas) continue;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = thumbSize;
        canvas.height = thumbSize;
        ctx.filter = preset.css || "none";
        ctx.drawImage(img, 0, 0, thumbSize, thumbSize);
      }
      drawnForUrlRef.current = imageUrl;
    };
    img.src = imageUrl;
  }, [imageUrl]);

  return (
    <div className="mb-4 flex gap-2 overflow-x-auto px-4 pb-2">
      {FILTER_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onSelect(preset.id)}
          aria-label={`${preset.label} filter`}
          aria-pressed={filterId === preset.id}
          className={cn(
            "flex shrink-0 flex-col items-center gap-1 rounded-xl p-1",
            filterId === preset.id ? "bg-white" : "bg-white/15"
          )}
        >
          <canvas
            ref={(node) => {
              if (node) canvasRefs.current.set(preset.id, node);
            }}
            className="h-12 w-12 rounded-lg object-cover"
            aria-hidden
          />
          <span
            className={cn(
              "px-2 pb-1 text-xs",
              filterId === preset.id ? "text-black" : "text-white"
            )}
          >
            {preset.label}
          </span>
        </button>
      ))}
    </div>
  );
}
