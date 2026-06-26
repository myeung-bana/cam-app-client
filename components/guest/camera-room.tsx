"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { FlipHorizontal, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { useGuestSession } from "@/contexts/guest-session-context";
import { useCamera } from "@/hooks/use-camera";
import { CAPTURE_FILTERS, capturePhotoFromVideo } from "@/lib/camera/capture";
import { uploadPhotoWithFallback } from "@/lib/upload/upload-client";
import { enqueueUpload } from "@/lib/upload/offline-queue";
import { GuestHeader } from "./guest-header";
import { cn } from "@/lib/utils/cn";

const MAX_VIDEO_SECONDS = 15;

export function CameraRoom({ joinCode }: { joinCode: string }) {
  const { session, event, accessToken, activeChallengeId, refreshToken, hydrated } =
    useGuestSession();
  const { videoRef, ready, error, flip } = useCamera();
  const [filterId, setFilterId] = useState("none");
  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const filterCss = useMemo(
    () => CAPTURE_FILTERS.find((f) => f.id === filterId)?.css ?? "",
    [filterId]
  );

  const activeChallenge = event
    ? activeChallengeId
    : null;

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !ready) return;
    try {
      if (navigator.vibrate) navigator.vibrate(50);
      const blob = await capturePhotoFromVideo(video, filterCss);
      setPreviewBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      toast.error("Could not capture photo");
    }
  }, [videoRef, ready, filterCss]);

  const startVideo = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (!stream) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/mp4")
      ? "video/mp4"
      : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setPreviewBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setRecording(false);
    };
    recorder.start();
    setRecording(true);
    setTimeout(() => recorder.state === "recording" && recorder.stop(), MAX_VIDEO_SECONDS * 1000);
  }, [videoRef]);

  const handleCapture = () => {
    if (mode === "photo") void capturePhoto();
    else if (!recording) startVideo();
    else recorderRef.current?.stop();
  };

  const handleUpload = async () => {
    if (!previewBlob || !session || !accessToken) return;
    setUploading(true);
    try {
      const token = (await refreshToken()) ?? accessToken;
      if (!navigator.onLine) {
        await enqueueUpload({
          blob: previewBlob,
          eventId: session.eventId,
          sessionId: session.guestSessionId,
          filterId,
          challengeId: activeChallengeId,
        });
        toast.info("Saved offline — will upload when you're back online");
      } else if (previewBlob.type.startsWith("image/")) {
        await uploadPhotoWithFallback({
          blob: previewBlob,
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
      setPreviewUrl(null);
      setPreviewBlob(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#0a0a0a] text-white/60">
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
      <div className="relative min-h-svh bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="Preview" className="h-svh w-full object-contain" />
        <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-4 px-6">
          <button
            type="button"
            onClick={() => {
              setPreviewUrl(null);
              setPreviewBlob(null);
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white"
          >
            <RotateCcw className="h-6 w-6" />
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => void handleUpload()}
            className="flex h-14 flex-1 max-w-xs items-center justify-center gap-2 rounded-full bg-white text-black font-semibold"
          >
            <Upload className="h-5 w-5" />
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
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
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-svh w-full object-cover"
        style={{ filter: filterCss || undefined }}
      />
      {error && (
        <p className="absolute inset-x-0 top-1/2 text-center text-white/80">{error}</p>
      )}
      <div className="absolute bottom-28 left-0 right-0 z-20">
        <div className="mb-4 flex gap-2 overflow-x-auto px-4 pb-2">
          {CAPTURE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterId(f.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm",
                filterId === f.id ? "bg-white text-black" : "bg-white/15 text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-8">
          <button
            type="button"
            onClick={flip}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white"
          >
            <FlipHorizontal className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={handleCapture}
            className={cn(
              "h-20 w-20 rounded-full border-4 border-white bg-white/20",
              recording && "animate-pulse bg-red-500/40"
            )}
            aria-label="Capture"
          />
          <button
            type="button"
            onClick={() => setMode(mode === "photo" ? "video" : "photo")}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white"
          >
            {mode === "photo" ? "VID" : "PIC"}
          </button>
        </div>
      </div>
    </div>
  );
}
