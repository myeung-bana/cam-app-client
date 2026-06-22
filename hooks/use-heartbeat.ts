"use client";

import { useEffect, useRef } from "react";
import { useGuestSession } from "@/contexts/guest-session-context";
import { sendHeartbeat } from "@/lib/functions/join";

const HEARTBEAT_MS = 20_000;

export function useHeartbeat() {
  const { session, accessToken } = useGuestSession();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!session?.guestSessionId || !accessToken) return;

    const tick = () => {
      void sendHeartbeat(session.guestSessionId, accessToken).catch(() => {
        /* ignore transient network errors */
      });
    };

    tick();
    timerRef.current = setInterval(tick, HEARTBEAT_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.guestSessionId, accessToken]);
}
