import { executeGraphQL } from "@/lib/graphql/execute";
import { INSERT_MEDIA } from "@/lib/graphql/media/mutations";
import { INSERT_CHALLENGE_COMPLETION } from "@/lib/graphql/challenge-completions/mutations";
import { compressImageBlob } from "@/lib/camera/capture";
import {
  buildPublicFileUrl,
  StorageUploadError,
  uploadToNhostStorage,
} from "@/lib/upload/storage";
import type { GuestMedia } from "@/lib/types";

export class GraphQLUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GraphQLUploadError";
  }
}

export interface UploadPhotoInput {
  blob: Blob;
  accessToken: string;
  eventId: string;
  sessionId: string;
  filterId: string;
  challengeId?: string | null;
  fileName?: string;
}

export async function uploadPhoto(input: UploadPhotoInput): Promise<GuestMedia> {
  const compressed = await compressImageBlob(input.blob);
  const fileName = input.fileName ?? `${crypto.randomUUID()}.jpg`;

  let uploaded: { id: string };
  try {
    uploaded = await uploadToNhostStorage(
      compressed,
      fileName,
      "image/jpeg",
      input.accessToken
    );
  } catch (error) {
    if (error instanceof StorageUploadError) {
      throw error;
    }
    throw new StorageUploadError(
      error instanceof Error ? error.message : "Storage upload failed"
    );
  }

  const fileUrl = buildPublicFileUrl(uploaded.id);

  let data: { insert_media_one: GuestMedia };
  try {
    data = await executeGraphQL<{ insert_media_one: GuestMedia }>(
      INSERT_MEDIA,
      {
        object: {
          event_id: input.eventId,
          session_id: input.sessionId,
          file_url: fileUrl,
          storage_file_id: uploaded.id,
          file_type: "photo",
          filter_applied: input.filterId === "none" ? null : input.filterId,
          challenge_id: input.challengeId ?? null,
          is_hidden: false,
          is_starred: false,
        },
      },
      input.accessToken
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save photo record";
    if (
      message.includes("permission") ||
      message.includes("insert_media_one") ||
      message.includes("not found")
    ) {
      throw new GraphQLUploadError(
        "Upload blocked — re-join the event so your session has guest permissions, or ask the organiser to deploy guest Hasura permissions."
      );
    }
    throw new GraphQLUploadError(message);
  }

  if (input.challengeId) {
    try {
      await executeGraphQL(
        INSERT_CHALLENGE_COMPLETION,
        {
          object: {
            challenge_id: input.challengeId,
            session_id: input.sessionId,
            media_id: data.insert_media_one.id,
          },
        },
        input.accessToken
      );
    } catch {
      // Media saved; challenge tag is best-effort.
    }
  }

  return data.insert_media_one;
}

export { capturePhotoFromVideo } from "@/lib/camera/capture";
