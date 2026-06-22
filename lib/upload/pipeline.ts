import { executeGraphQL } from "@/lib/graphql/execute";
import { INSERT_MEDIA } from "@/lib/graphql/media/mutations";
import { INSERT_CHALLENGE_COMPLETION } from "@/lib/graphql/challenge-completions/mutations";
import { compressImageBlob, capturePhotoFromVideo } from "@/lib/camera/capture";
import { buildPublicFileUrl, uploadToNhostStorage } from "./storage";
import type { GuestMedia } from "@/lib/types";

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

  const uploaded = await uploadToNhostStorage(
    compressed,
    fileName,
    "image/jpeg",
    input.accessToken
  );

  const fileUrl = buildPublicFileUrl(uploaded.id);

  const data = await executeGraphQL<{
    insert_media_one: GuestMedia;
  }>(
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

  if (input.challengeId) {
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
  }

  return data.insert_media_one;
}

export { capturePhotoFromVideo };
