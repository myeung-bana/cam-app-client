import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { executeGraphQL } from "@/lib/graphql/execute";
import { INSERT_MEDIA } from "@/lib/graphql/media/mutations";
import { INSERT_CHALLENGE_COMPLETION } from "@/lib/graphql/challenge-completions/mutations";
import {
  buildNhostFileUrl,
  isGuestStorageUploadConfigured,
  postMultipartToNhostStorage,
} from "@/lib/server/nhost-storage-server";
import {
  assertGuestSessionAccess,
  GuestAuthError,
} from "@/lib/server/verify-guest-upload";

function getBearerToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

export async function POST(req: NextRequest) {
  const accessToken = getBearerToken(req);
  if (!accessToken) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isGuestStorageUploadConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Server upload is not configured — set NHOST_ADMIN_SECRET, NHOST_SUBDOMAIN, and NHOST_REGION on the guest app (Vercel env).",
      },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const eventId = formData.get("eventId");
    const sessionId = formData.get("sessionId");
    const filterId = formData.get("filterId");
    const challengeId = formData.get("challengeId");
    const fileEntry = formData.get("file");

    if (typeof eventId !== "string" || !eventId) {
      return NextResponse.json({ ok: false, error: "eventId is required" }, { status: 400 });
    }
    if (typeof sessionId !== "string" || !sessionId) {
      return NextResponse.json({ ok: false, error: "sessionId is required" }, { status: 400 });
    }
    if (!(fileEntry instanceof Blob)) {
      return NextResponse.json({ ok: false, error: "file is required" }, { status: 400 });
    }

    await assertGuestSessionAccess(accessToken, eventId, sessionId);

    const fileName = `${randomUUID()}.jpg`;
    const bytes = Buffer.from(await fileEntry.arrayBuffer());

    const uploaded = await postMultipartToNhostStorage(
      fileName,
      bytes,
      fileEntry.type || "image/jpeg"
    );

    const fileUrl = buildNhostFileUrl(uploaded.id);
    const resolvedFilterId =
      typeof filterId === "string" && filterId !== "none" ? filterId : null;
    const resolvedChallengeId =
      typeof challengeId === "string" && challengeId.length > 0
        ? challengeId
        : null;

    const data = await executeGraphQL<{
      insert_media_one: { id: string; file_url: string };
    }>(
      INSERT_MEDIA,
      {
        object: {
          event_id: eventId,
          session_id: sessionId,
          file_url: fileUrl,
          storage_file_id: uploaded.id,
          file_type: "photo",
          filter_applied: resolvedFilterId,
          challenge_id: resolvedChallengeId,
          is_hidden: false,
          is_starred: false,
        },
      },
      accessToken
    );

    if (resolvedChallengeId) {
      try {
        await executeGraphQL(
          INSERT_CHALLENGE_COMPLETION,
          {
            object: {
              challenge_id: resolvedChallengeId,
              session_id: sessionId,
              media_id: data.insert_media_one.id,
            },
          },
          accessToken
        );
      } catch {
        // Non-fatal
      }
    }

    return NextResponse.json({
      ok: true,
      data: data.insert_media_one,
    });
  } catch (error) {
    if (error instanceof GuestAuthError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status }
      );
    }

    const message = error instanceof Error ? error.message : "Upload failed";
    const status = message.includes("Storage") ? 502 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
