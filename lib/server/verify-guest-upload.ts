import "server-only";
import { jwtDecode } from "jwt-decode";
import { gql } from "graphql-tag";
import { executeGraphQL } from "@/lib/graphql/execute";

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
    // Hook not yet live — allow anonymous only if event claim is present
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

/** Confirms the guest JWT is accepted by Hasura and owns the session row. */
export async function assertGuestSessionAccess(
  accessToken: string,
  eventId: string,
  sessionId: string
): Promise<void> {
  const { userId } = assertGuestTokenForEvent(accessToken, eventId);

  let data: {
    guest_sessions_by_pk: {
      id: string;
      event_id: string;
      nhost_user_id: string | null;
    } | null;
  };

  try {
    data = await executeGraphQL(VERIFY_GUEST_SESSION, { sessionId }, accessToken);
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

  const session = data.guest_sessions_by_pk;
  if (!session || session.event_id !== eventId) {
    throw new GuestAuthError("Guest session not found for this event", 403);
  }

  if (session.nhost_user_id && session.nhost_user_id !== userId) {
    throw new GuestAuthError("Guest session does not belong to this user", 403);
  }
}
