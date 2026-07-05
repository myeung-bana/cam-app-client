"use client";

import { useEffect, useRef } from "react";
import { useGuestSession } from "@/contexts/guest-session-context";
import { sendHeartbeat } from "@/lib/functions/join";

const HEARTBEAT_MS = 20_000;

export function useHeartbeat() {
  const { session, accessToken, refreshToken } = useGuestSession();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!session?.guestSessionId || !accessToken) return;

    const tick = async () => {
      const token = (await refreshToken()) ?? accessToken;
      if (!token) return;
      void sendHeartbeat(session.guestSessionId, token).catch(() => {
        /* ignore transient network errors */
      });
    };

    void tick();
    timerRef.current = setInterval(() => void tick(), HEARTBEAT_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.guestSessionId, accessToken, refreshToken]);
}
