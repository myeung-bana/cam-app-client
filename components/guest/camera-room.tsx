"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useGuestSession } from "@/contexts/guest-session-context";
import { useCamera } from "@/hooks/use-camera";
import { getFilterPreset } from "@/lib/camera/filter-presets";
import { applyFilterToImageBlob } from "@/lib/camera/capture";
import { uploadPhotoWithFallback } from "@/lib/upload/upload-client";
import { enqueueUpload } from "@/lib/upload/offline-queue";
import { GuestHeader } from "./guest-header";
import { CameraViewfinder } from "./camera/camera-viewfinder";
import { CameraControls } from "./camera/camera-controls";
import { CapturePreview } from "./camera/capture-preview";
import { useCapture } from "./camera/use-capture";

export function CameraRoom({ joinCode }: { joinCode: string }) {
  const { session, event, accessToken, activeChallengeId, refreshToken, hydrated } =
    useGuestSession();
  const { videoRef, ready, error, flip } = useCamera();
  const [filterId, setFilterId] = useState("none");
  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [uploading, setUploading] = useState(false);

  const {
    previewUrl,
    previewBlob,
    recording,
    capturePhoto,
    startVideo,
    stopVideo,
    clearPreview,
  } = useCapture(videoRef, ready);

  const activeChallenge = event ? activeChallengeId : null;

  const handleCapture = () => {
    if (mode === "photo") void capturePhoto("");
    else if (!recording) startVideo();
    else stopVideo();
  };

  const handleRetake = () => {
    setFilterId("none");
    clearPreview();
  };

  const handleUpload = async () => {
    if (!previewBlob || !session || !accessToken) return;
    setUploading(true);
    try {
      const token = (await refreshToken()) ?? accessToken;
      const filterCss = getFilterPreset(filterId).css;
      const uploadBlob = await applyFilterToImageBlob(previewBlob, filterCss);

      if (!navigator.onLine) {
        await enqueueUpload({
          blob: uploadBlob,
          eventId: session.eventId,
          sessionId: session.guestSessionId,
          filterId,
          challengeId: activeChallengeId,
        });
        toast.info("Saved offline — will upload when you're back online");
      } else if (uploadBlob.type.startsWith("image/")) {
        await uploadPhotoWithFallback({
          blob: uploadBlob,
          accessToken: token,
          eventId: session.eventId,
          sessionId: session.guestSessionId,
          filterId,
          challengeId: activeChallengeId,
        });
        toast.success("Uploaded!");
      } else {
        toast.info("Video upload coming soon — photo uploads are live");
      }
      setFilterId("none");
      clearPreview();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!hydrated) {
    return (
      <div
        className="flex min-h-svh items-center justify-center bg-[#0a0a0a] text-white/60"
        role="status"
      >
        Loading camera…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#0a0a0a] text-white">
        Session expired — scan the QR code again.
      </div>
    );
  }

  if (previewUrl && previewBlob) {
    return (
      <CapturePreview
        previewUrl={previewUrl}
        filterId={filterId}
        onFilterChange={setFilterId}
        uploading={uploading}
        onRetake={handleRetake}
        onUpload={() => void handleUpload()}
      />
    );
  }

  return (
    <div className="relative min-h-svh bg-black">
      <GuestHeader joinCode={joinCode} />
      {activeChallenge && (
        <div className="absolute left-4 right-4 top-24 z-20 rounded-2xl bg-black/60 px-4 py-3 text-center text-sm text-white backdrop-blur">
          Challenge active — your next capture will be tagged
        </div>
      )}
      <CameraViewfinder videoRef={videoRef} error={error} />
      <div className="absolute bottom-28 left-0 right-0 z-20">
        <CameraControls
          mode={mode}
          recording={recording}
          onFlip={flip}
          onCapture={handleCapture}
          onToggleMode={() => setMode(mode === "photo" ? "video" : "photo")}
        />
      </div>
    </div>
  );
}
