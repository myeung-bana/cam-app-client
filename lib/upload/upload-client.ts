import {
  GraphQLUploadError,
  uploadPhoto,
  type UploadPhotoInput,
} from "@/lib/upload/pipeline";
import { StorageUploadError } from "@/lib/upload/storage";

interface UploadEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** Same-origin upload proxy — avoids browser CORS to Nhost Storage/Hasura. */
export async function uploadPhotoViaProxy(
  input: UploadPhotoInput
): Promise<Awaited<ReturnType<typeof uploadPhoto>>> {
  const formData = new FormData();
  formData.append("file", input.blob, "capture.jpg");
  formData.append("eventId", input.eventId);
  formData.append("sessionId", input.sessionId);
  formData.append("filterId", input.filterId);
  if (input.challengeId) {
    formData.append("challengeId", input.challengeId);
  }

  const response = await fetch("/api/guest/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
    },
    body: formData,
  });

  const envelope = (await response.json().catch(() => ({}))) as UploadEnvelope<
    Awaited<ReturnType<typeof uploadPhoto>>
  >;

  if (!response.ok || !envelope.ok || !envelope.data) {
    const message = envelope.error ?? "Upload failed";
    if (message.includes("Storage")) {
      throw new StorageUploadError(message, response.status);
    }
    if (
      message.includes("permission") ||
      message.includes("insert_media") ||
      message.includes("guest")
    ) {
      throw new GraphQLUploadError(message);
    }
    throw new Error(message);
  }

  return envelope.data;
}

export async function uploadPhotoWithFallback(
  input: UploadPhotoInput
): Promise<Awaited<ReturnType<typeof uploadPhoto>>> {
  if (typeof window !== "undefined") {
    return uploadPhotoViaProxy(input);
  }
  return uploadPhoto(input);
}
