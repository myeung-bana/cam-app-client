import "server-only";
import { randomUUID } from "crypto";

export function getNhostAdminSecret(): string {
  const secret = process.env.NHOST_ADMIN_SECRET;
  if (!secret || secret === "your-hasura-admin-secret") {
    throw new Error("NHOST_ADMIN_SECRET is not configured on the guest app server");
  }
  return secret;
}

export function getServerStorageBucket(): string {
  return (
    process.env.NHOST_STORAGE_BUCKET ??
    process.env.NEXT_PUBLIC_STORAGE_BUCKET ??
    "cam-bucket"
  );
}

export function getNhostStorageBaseUrl(): string {
  const subdomain =
    process.env.NHOST_SUBDOMAIN ?? process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
  const region = process.env.NHOST_REGION ?? process.env.NEXT_PUBLIC_NHOST_REGION;
  if (!subdomain || !region) {
    throw new Error("NHOST_SUBDOMAIN and NHOST_REGION are required");
  }
  return `https://${subdomain}.storage.${region}.nhost.run/v1`;
}

export function buildNhostFileUrl(fileId: string): string {
  return `${getNhostStorageBaseUrl()}/files/${fileId}`;
}

export function isGuestStorageUploadConfigured(): boolean {
  return Boolean(
    (process.env.NHOST_SUBDOMAIN ?? process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN) &&
      (process.env.NHOST_REGION ?? process.env.NEXT_PUBLIC_NHOST_REGION) &&
      process.env.NHOST_ADMIN_SECRET &&
      process.env.NHOST_ADMIN_SECRET !== "your-hasura-admin-secret"
  );
}

interface UploadResponse {
  processedFiles?: Array<{ id: string; name: string }>;
  error?: { message?: string };
}

/** Flat filename only — avoid slashes in multipart `filename=` (hasura-storage). */
export async function postMultipartToNhostStorage(
  fileName: string,
  fileBytes: Buffer,
  mimeType: string
): Promise<{ id: string; name: string }> {
  const boundary = `----MemoFormBoundary${randomUUID().replace(/-/g, "")}`;
  const bucket = getServerStorageBucket();
  const adminSecret = getNhostAdminSecret();
  const storageUrl = `${getNhostStorageBaseUrl()}/files`;

  const safeName = fileName.replace(/[/\\]/g, "_");

  const preamble = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="bucket-id"\r\n\r\n` +
      `${bucket}\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file[]"; filename="${safeName}"\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`
  );
  const epilogue = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([preamble, fileBytes, epilogue]);

  const response = await fetch(storageUrl, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": String(body.length),
      "x-hasura-admin-secret": adminSecret,
    },
    body,
  });

  const text = await response.text();
  let json: UploadResponse = {};
  try {
    json = JSON.parse(text) as UploadResponse;
  } catch {
    // non-JSON body
  }

  if (!response.ok) {
    const detail = json.error?.message ?? text;
    throw new Error(`Storage upload failed (${response.status}): ${detail}`);
  }

  const uploaded = json.processedFiles?.[0];
  if (!uploaded?.id) {
    const detail = json.error?.message ?? "no file id in response";
    throw new Error(`Storage upload failed: ${detail}`);
  }

  return uploaded;
}
