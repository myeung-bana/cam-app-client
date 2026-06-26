import { getNhostBrowserClient } from "@/lib/nhost-client";
import { getStorageBucket, getStorageUrl } from "@/lib/config/nhost";

export function buildPublicFileUrl(fileId: string): string {
  return `${getStorageUrl()}/files/${fileId}`;
}

export class StorageUploadError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "StorageUploadError";
  }
}

export async function uploadToNhostStorage(
  file: Blob,
  fileName: string,
  mimeType: string,
  accessToken: string
): Promise<{ id: string }> {
  const bucket = getStorageBucket();
  const flatFileName = fileName.replace(/[/\\]/g, "_");
  const uploadFile = new File([file], flatFileName, { type: mimeType });

  try {
    const nhost = getNhostBrowserClient();
    const response = await nhost.storage.uploadFiles(
      {
        "bucket-id": bucket,
        "file[]": [uploadFile],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const id = response.body.processedFiles?.[0]?.id;
    if (!id) {
      throw new StorageUploadError("Storage upload returned no file id");
    }

    return { id };
  } catch (error) {
    if (error instanceof StorageUploadError) throw error;

    const status =
      error && typeof error === "object" && "status" in error
        ? Number((error as { status: number }).status)
        : undefined;
    const message =
      error instanceof Error
        ? error.message
        : "Storage upload failed — check bucket rules for the guest role";

    throw new StorageUploadError(
      status ? `Storage upload failed (${status}): ${message}` : message,
      status
    );
  }
}
