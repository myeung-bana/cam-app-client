"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useGuestSession } from "@/contexts/guest-session-context";
import { listPendingUploads, removePendingUpload } from "@/lib/upload/offline-queue";
import { uploadPhoto } from "@/lib/upload/pipeline";

export function OfflineUploadReplay() {
  const { refreshToken } = useGuestSession();

  useEffect(() => {
    async function replay() {
      if (!navigator.onLine) return;
      const pending = await listPendingUploads();
      if (pending.length === 0) return;

      const token = await refreshToken();
      if (!token) return;

      let uploaded = 0;
      for (const item of pending) {
        try {
          if (item.blob.type.startsWith("image/")) {
            await uploadPhoto({
              blob: item.blob,
              accessToken: token,
              eventId: item.eventId,
              sessionId: item.sessionId,
              filterId: item.filterId,
              challengeId: item.challengeId,
            });
            await removePendingUpload(item.id);
            uploaded++;
          }
        } catch {
          break;
        }
      }

      if (uploaded > 0) {
        toast.success(`Uploaded ${uploaded} queued photo${uploaded > 1 ? "s" : ""}`);
      }
    }

    window.addEventListener("online", () => void replay());
    void replay();
  }, [refreshToken]);

  return null;
}
