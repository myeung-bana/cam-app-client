"use client";

import { useCallback, useEffect, useState } from "react";
import { useGuestSession } from "@/contexts/guest-session-context";
import { executeGraphQL } from "@/lib/graphql/execute";
import { GET_SESSION_MEDIA } from "@/lib/graphql/media/queries";
import { mapGuestMedia, type GuestMediaRow } from "@/lib/graphql/mappers";
import type { GuestMedia } from "@/lib/types";

export function useSessionMedia() {
  const { session, accessToken, refreshToken } = useGuestSession();
  const [items, setItems] = useState<GuestMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!session?.guestSessionId) return;
    setLoading(true);
    setError(null);
    try {
      const token = (await refreshToken()) ?? accessToken;
      if (!token) return;

      const data = await executeGraphQL<{ media: GuestMediaRow[] }>(
        GET_SESSION_MEDIA,
        { sessionId: session.guestSessionId },
        token
      );
      setItems(data.media.map(mapGuestMedia));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load uploads");
    } finally {
      setLoading(false);
    }
  }, [session?.guestSessionId, accessToken, refreshToken]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { items, loading, error, refetch };
}
