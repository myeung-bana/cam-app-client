import "server-only";
import { jwtDecode } from "jwt-decode";
import { gql } from "graphql-tag";
import { executeGraphQL } from "@/lib/graphql/execute";
import { executeHasuraAdmin } from "@/lib/server/hasura-admin";

const HASURA_CLAIMS = "https://hasura.io/jwt/claims";

interface HasuraJwtClaims {
  exp?: number;
  sub?: string;
  [HASURA_CLAIMS]?: {
    "x-hasura-default-role"?: string;
    "x-hasura-allowed-roles"?: string[] | string;
    "x-hasura-user-id"?: string;
    "x-hasura-event-id"?: string;
  };
}

export class GuestAuthError extends Error {
  constructor(
    message: string,
    readonly status = 403
  ) {
    super(message);
    this.name = "GuestAuthError";
  }
}

function normalizeRoles(allowed: string[] | string | undefined): string[] {
  if (!allowed) return [];
  if (Array.isArray(allowed)) return allowed;
  if (allowed.startsWith("{") && allowed.endsWith("}")) {
    return allowed
      .slice(1, -1)
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
  }
  return [allowed];
}

function decodeGuestClaims(accessToken: string): HasuraJwtClaims {
  try {
    return jwtDecode<HasuraJwtClaims>(accessToken);
  } catch {
    throw new GuestAuthError("Invalid session token", 401);
  }
}

function getTokenUserId(accessToken: string): string {
  const payload = decodeGuestClaims(accessToken);
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new GuestAuthError("Session expired — scan the QR code again", 401);
  }
  const claims = payload[HASURA_CLAIMS];
  return claims?.["x-hasura-user-id"] ?? payload.sub ?? "";
}

export function assertGuestTokenForEvent(
  accessToken: string,
  eventId: string
): { userId: string; eventId: string } {
  const payload = decodeGuestClaims(accessToken);

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new GuestAuthError("Session expired — scan the QR code again", 401);
  }

  const claims = payload[HASURA_CLAIMS];
  const defaultRole = claims?.["x-hasura-default-role"];
  const allowed = normalizeRoles(claims?.["x-hasura-allowed-roles"]);
  const tokenEventId = claims?.["x-hasura-event-id"];
  const userId = claims?.["x-hasura-user-id"] ?? payload.sub;

  const isGuest =
    defaultRole === "guest" ||
    allowed.includes("guest") ||
    (defaultRole === "anonymous" && Boolean(tokenEventId));

  if (!isGuest) {
    throw new GuestAuthError(
      "Guest access required — re-join the event to refresh your session",
      403
    );
  }

  if (!tokenEventId || tokenEventId !== eventId) {
    throw new GuestAuthError("This session is not valid for this event", 403);
  }

  if (!userId) {
    throw new GuestAuthError("Invalid session token", 401);
  }

  return { userId, eventId: tokenEventId };
}

const VERIFY_GUEST_SESSION = gql`
  query VerifyGuestSession($sessionId: uuid!) {
    guest_sessions_by_pk(id: $sessionId) {
      id
      event_id
      nhost_user_id
    }
  }
`;

const VERIFY_GUEST_SESSION_ADMIN = gql`
  query VerifyGuestSessionAdmin($sessionId: uuid!) {
    guest_sessions_by_pk(id: $sessionId) {
      id
      event_id
      nhost_user_id
    }
  }
`;

async function assertGuestSessionRow(
  sessionId: string,
  eventId: string,
  userId: string,
  viaAdmin: boolean,
  accessToken?: string
): Promise<void> {
  let session: {
    id: string;
    event_id: string;
    nhost_user_id: string | null;
  } | null;

  if (viaAdmin) {
    const data = await executeHasuraAdmin<{
      guest_sessions_by_pk: typeof session;
    }>(VERIFY_GUEST_SESSION_ADMIN, { sessionId });
    session = data.guest_sessions_by_pk;
  } else {
    if (!accessToken) {
      throw new GuestAuthError("Invalid session token", 401);
    }
    try {
      const data = await executeGraphQL<{
        guest_sessions_by_pk: typeof session;
      }>(VERIFY_GUEST_SESSION, { sessionId }, accessToken);
      session = data.guest_sessions_by_pk;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Session verification failed";
      if (message.includes("permission") || message.includes("not found")) {
        throw new GuestAuthError(
          "Could not verify guest session — re-join the event",
          403
        );
      }
      throw error;
    }
  }

  if (!session || session.event_id !== eventId) {
    throw new GuestAuthError("Guest session not found for this event", 403);
  }

  if (session.nhost_user_id && session.nhost_user_id !== userId) {
    throw new GuestAuthError("Guest session does not belong to this user", 403);
  }
}

/** Confirms the guest JWT is accepted by Hasura and owns the session row. */
export async function assertGuestSessionAccess(
  accessToken: string,
  eventId: string,
  sessionId: string
): Promise<void> {
  const { userId } = assertGuestTokenForEvent(accessToken, eventId);
  await assertGuestSessionRow(sessionId, eventId, userId, false, accessToken);
}

/**
 * Upload gate: prefer guest JWT + Hasura user query; fall back to admin session
 * lookup when the access-token hook has not yet minted guest claims.
 */
export async function assertGuestSessionForUpload(
  accessToken: string,
  eventId: string,
  sessionId: string
): Promise<void> {
  const userId = getTokenUserId(accessToken);
  if (!userId) {
    throw new GuestAuthError("Invalid session token", 401);
  }

  try {
    await assertGuestSessionAccess(accessToken, eventId, sessionId);
    return;
  } catch (error) {
    const canFallbackToAdmin =
      error instanceof GuestAuthError &&
      (error.message.includes("Guest access required") ||
        error.message.includes("Could not verify guest session"));

    if (!canFallbackToAdmin) {
      throw error;
    }
  }

  await assertGuestSessionRow(sessionId, eventId, userId, true);
}
