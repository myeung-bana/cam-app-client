import { getStorageBucket, getStorageUrl } from "@/lib/config/nhost";

export function buildStoragePath(
  eventId: string,
  sessionId: string,
  fileName: string
): string {
  return `events/${eventId}/sessions/${sessionId}/${fileName}`;
}

export function buildPublicFileUrl(fileId: string): string {
  return `${getStorageUrl()}/files/${fileId}`;
}

export async function uploadToNhostStorage(
  file: Blob,
  fileName: string,
  mimeType: string,
  accessToken: string
): Promise<{ id: string }> {
  const boundary = `----MemoBoundary${crypto.randomUUID().replace(/-/g, "")}`;
  const bucket = getStorageBucket();
  const fileBytes = new Uint8Array(await file.arrayBuffer());

  const preamble = new TextEncoder().encode(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="bucket-id"\r\n\r\n` +
      `${bucket}\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file[]"; filename="${fileName}"\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`
  );
  const epilogue = new TextEncoder().encode(`\r\n--${boundary}--\r\n`);
  const body = new Blob([preamble, fileBytes, epilogue]);

  const response = await fetch(`${getStorageUrl()}/files`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Storage upload failed");
  }

  const json = (await response.json()) as {
    processedFiles?: Array<{ id: string }>;
  };
  const id = json.processedFiles?.[0]?.id;
  if (!id) throw new Error("Storage upload returned no file id");
  return { id };
}
