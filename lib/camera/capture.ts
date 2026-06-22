import type { CaptureFilter } from "@/lib/types";

export const CAPTURE_FILTERS: CaptureFilter[] = [
  { id: "none", label: "Original", css: "" },
  { id: "warm", label: "Warm", css: "sepia(0.3) saturate(1.4)" },
  { id: "mono", label: "Mono", css: "grayscale(1) contrast(1.1)" },
  { id: "fade", label: "Fade", css: "opacity(0.85) brightness(1.1) saturate(0.8)" },
  { id: "vivid", label: "Vivid", css: "saturate(1.8) contrast(1.1)" },
];

export function applyFilterToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filterCss: string
) {
  if (!filterCss) return;
  const imageData = ctx.getImageData(0, 0, width, height);
  const temp = document.createElement("canvas");
  temp.width = width;
  temp.height = height;
  const tempCtx = temp.getContext("2d");
  if (!tempCtx) return;
  tempCtx.filter = filterCss;
  tempCtx.putImageData(imageData, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(temp, 0, 0);
}

export async function capturePhotoFromVideo(
  video: HTMLVideoElement,
  filterCss: string
): Promise<Blob> {
  const width = video.videoWidth;
  const height = video.videoHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(video, 0, 0, width, height);
  if (filterCss) {
    applyFilterToCanvas(ctx, width, height, filterCss);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Capture failed"))),
      "image/jpeg",
      0.85
    );
  });
}

export async function compressImageBlob(blob: Blob, maxEdge = 2048): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return blob;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (out) => (out ? resolve(out) : reject(new Error("Compression failed"))),
      "image/jpeg",
      0.85
    );
  });
}
