"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { GuestSessionRecord, PublicEvent } from "@/lib/types";
import {
  clearGuestSession,
  getValidAccessToken,
  readGuestSession,
  writeGuestSession,
} from "@/lib/auth/guest-session";

interface GuestSessionContextValue {
  session: GuestSessionRecord | null;
  event: PublicEvent | null;
  accessToken: string | null;
  setSession: (session: GuestSessionRecord) => void;
  setEvent: (event: PublicEvent | null) => void;
  refreshToken: () => Promise<string | null>;
  signOut: () => void;
  activeChallengeId: string | null;
  setActiveChallengeId: (id: string | null) => void;
}

const GuestSessionContext = createContext<GuestSessionContextValue | null>(null);

export function GuestSessionProvider({
  children,
  initialEvent = null,
}: {
  children: React.ReactNode;
  initialEvent?: PublicEvent | null;
}) {
  const [session, setSessionState] = useState<GuestSessionRecord | null>(null);
  const [event, setEvent] = useState<PublicEvent | null>(initialEvent);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  useEffect(() => {
    const stored = readGuestSession();
    if (stored) setSessionState(stored);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getValidAccessToken().then((token) => {
      if (!cancelled) setAccessToken(token);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const setSession = useCallback((next: GuestSessionRecord) => {
    writeGuestSession(next);
    setSessionState(next);
    setAccessToken(next.accessToken);
  }, []);

  const refreshToken = useCallback(async () => {
    const token = await getValidAccessToken();
    setAccessToken(token);
    return token;
  }, []);

  const signOut = useCallback(() => {
    clearGuestSession();
    setSessionState(null);
    setAccessToken(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      event,
      accessToken,
      setSession,
      setEvent,
      refreshToken,
      signOut,
      activeChallengeId,
      setActiveChallengeId,
    }),
    [
      session,
      event,
      accessToken,
      setSession,
      refreshToken,
      signOut,
      activeChallengeId,
    ]
  );

  return (
    <GuestSessionContext.Provider value={value}>
      {children}
    </GuestSessionContext.Provider>
  );
}

export function useGuestSession() {
  const ctx = useContext(GuestSessionContext);
  if (!ctx) {
    throw new Error("useGuestSession must be used within GuestSessionProvider");
  }
  return ctx;
}
