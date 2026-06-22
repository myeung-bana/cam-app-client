import type { EntryState } from "@/lib/types";
import type { GuestSessionRecord } from "@/lib/types";
import { getAuthUrl } from "@/lib/config/nhost";

const STORAGE_KEY = "memo_guest_session";

export function readGuestSession(): GuestSessionRecord | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GuestSessionRecord;
  } catch {
    return null;
  }
}

export function writeGuestSession(session: GuestSessionRecord): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearGuestSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function sessionMatchesJoinCode(
  session: GuestSessionRecord | null,
  joinCode: string
): boolean {
  return Boolean(session && session.joinCode === joinCode);
}

export async function refreshGuestAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; accessTokenExpiresIn: number; refreshToken: string }> {
  const response = await fetch(`${getAuthUrl()}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Session refresh failed");
  }

  const body = (await response.json()) as {
    session?: {
      accessToken: string;
      accessTokenExpiresIn: number;
      refreshToken: string;
    };
  };

  if (!body.session?.accessToken) {
    throw new Error("Session refresh failed");
  }

  return {
    accessToken: body.session.accessToken,
    accessTokenExpiresIn: body.session.accessTokenExpiresIn,
    refreshToken: body.session.refreshToken,
  };
}

export async function getValidAccessToken(): Promise<string | null> {
  const session = readGuestSession();
  if (!session) return null;

  const bufferMs = 60_000;
  if (Date.now() < session.expiresAt - bufferMs) {
    return session.accessToken;
  }

  try {
    const refreshed = await refreshGuestAccessToken(session.refreshToken);
    const updated: GuestSessionRecord = {
      ...session,
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresAt: Date.now() + refreshed.accessTokenExpiresIn * 1000,
    };
    writeGuestSession(updated);
    return updated.accessToken;
  } catch {
    clearGuestSession();
    return null;
  }
}

export function buildSessionFromEnter(
  joinCode: string,
  enter: {
    guestSessionId: string;
    user: { id: string; displayName?: string };
    accessToken: string;
    accessTokenExpiresIn: number;
    refreshToken: string;
  },
  eventId: string
): GuestSessionRecord {
  return {
    accessToken: enter.accessToken,
    refreshToken: enter.refreshToken,
    guestSessionId: enter.guestSessionId,
    eventId,
    joinCode,
    userId: enter.user.id,
    displayName: enter.user.displayName,
    expiresAt: Date.now() + enter.accessTokenExpiresIn * 1000,
  };
}

export function entryStatePath(
  joinCode: string,
  state: EntryState,
  preview?: boolean
): string {
  const previewQuery = preview ? "?preview=true" : "";
  switch (state) {
    case "live":
      return `/j/${joinCode}/welcome${previewQuery}`;
    case "countdown":
      return `/states/countdown?joinCode=${joinCode}${preview ? "&preview=true" : ""}`;
    case "ended":
      return `/states/ended?joinCode=${joinCode}`;
    case "disabled":
      return `/states/disabled?joinCode=${joinCode}`;
    case "cap_full":
      return `/states/cap-full?joinCode=${joinCode}`;
    default:
      return `/states/not-found`;
  }
}
