/** Cover-crop rect matching CSS object-cover for a video element. */
export function getCoverCropRect(video: HTMLVideoElement): {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
} {
  const videoW = video.videoWidth;
  const videoH = video.videoHeight;
  const displayW = video.clientWidth || videoW;
  const displayH = video.clientHeight || videoH;

  if (!videoW || !videoH || !displayW || !displayH) {
    return { sx: 0, sy: 0, sw: videoW, sh: videoH };
  }

  const videoAspect = videoW / videoH;
  const displayAspect = displayW / displayH;

  if (videoAspect > displayAspect) {
    // Video is wider than display — crop left/right
    const sw = videoH * displayAspect;
    return {
      sx: (videoW - sw) / 2,
      sy: 0,
      sw,
      sh: videoH,
    };
  }

  // Video is taller than display — crop top/bottom
  const sh = videoW / displayAspect;
  return {
    sx: 0,
    sy: (videoH - sh) / 2,
    sw: videoW,
    sh,
  };
}

/**
 * Capture a frame from the video using the same cover crop as the live viewfinder.
 * filterCss is optional — pass "" for a raw capture (filters applied later on review).
 */
export async function capturePhotoFromVideo(
  video: HTMLVideoElement,
  filterCss = ""
): Promise<Blob> {
  const { sx, sy, sw, sh } = getCoverCropRect(video);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw);
  canvas.height = Math.round(sh);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  if (filterCss) ctx.filter = filterCss;
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Capture failed"))),
      "image/jpeg",
      0.85
    );
  });
}

/** Bake a CSS filter into an image blob (used on upload after review-time filter pick). */
export async function applyFilterToImageBlob(
  blob: Blob,
  filterCss: string
): Promise<Blob> {
  if (!filterCss) return blob;

  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return blob;
  }

  ctx.filter = filterCss;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (out) => (out ? resolve(out) : reject(new Error("Filter bake failed"))),
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
