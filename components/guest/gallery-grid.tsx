"use client";

import { useEffect, useState } from "react";
import { useGuestSession } from "@/contexts/guest-session-context";
import { executeGraphQL } from "@/lib/graphql/execute";
import { GET_SESSION_MEDIA } from "@/lib/graphql/media/queries";
import type { GuestMedia } from "@/lib/types";

export function GalleryGrid() {
  const { session, accessToken, refreshToken } = useGuestSession();
  const [items, setItems] = useState<GuestMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.guestSessionId) return;
    let cancelled = false;

    async function load() {
      if (!session?.guestSessionId) return;
      try {
        const token = (await refreshToken()) ?? accessToken;
        if (!token) return;
        const data = await executeGraphQL<{ media: GuestMedia[] }>(
          GET_SESSION_MEDIA,
          { sessionId: session.guestSessionId },
          token
        );
        if (!cancelled) setItems(data.media);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [session?.guestSessionId, accessToken, refreshToken]);

  if (loading) {
    return <p className="p-6 text-white/60">Loading your uploads…</p>;
  }

  if (items.length === 0) {
    return (
      <p className="p-6 text-center text-white/60">
        No uploads yet — capture your first moment on the Camera tab.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 p-2">
      {items.map((item) => (
        <div key={item.id} className="relative aspect-square bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.file_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
