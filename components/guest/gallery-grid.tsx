"use client";

import { useGuestSession } from "@/contexts/guest-session-context";
import { useSessionMedia } from "@/hooks/use-session-media";

export function GalleryGrid() {
  const { event } = useGuestSession();
  const { items, loading, error } = useSessionMedia();
  const eventName = event?.name ?? "event";

  if (loading) {
    return (
      <p className="p-6 text-white/60" role="status" aria-live="polite">
        Loading your uploads…
      </p>
    );
  }

  if (error) {
    return (
      <p className="p-6 text-center text-red-400" role="alert">
        {error}
      </p>
    );
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
      {items.map((item, index) => (
        <div key={item.id} className="relative aspect-square bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.fileUrl}
            alt={`Photo ${index + 1} from ${eventName}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
