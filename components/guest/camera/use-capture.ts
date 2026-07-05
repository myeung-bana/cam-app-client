"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { capturePhotoFromVideo } from "@/lib/camera/capture";

const MAX_VIDEO_SECONDS = 15;

export function useCapture(videoRef: React.RefObject<HTMLVideoElement | null>, ready: boolean) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const previewUrlRef = useRef<string | null>(null);

  const revokePreviewUrl = useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  }, []);

  const clearPreview = useCallback(() => {
    revokePreviewUrl(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setPreviewBlob(null);
  }, [revokePreviewUrl]);

  const setPreviewFromBlob = useCallback(
    (blob: Blob) => {
      revokePreviewUrl(previewUrlRef.current);
      const url = URL.createObjectURL(blob);
      previewUrlRef.current = url;
      setPreviewBlob(blob);
      setPreviewUrl(url);
    },
    [revokePreviewUrl]
  );

  useEffect(() => {
    return () => {
      revokePreviewUrl(previewUrlRef.current);
    };
  }, [revokePreviewUrl]);

  const capturePhoto = useCallback(
    async (filterCss: string) => {
      const video = videoRef.current;
      if (!video || !ready) return;
      try {
        if (navigator.vibrate) navigator.vibrate(50);
        const blob = await capturePhotoFromVideo(video, filterCss);
        setPreviewFromBlob(blob);
      } catch {
        toast.error("Could not capture photo");
      }
    },
    [videoRef, ready, setPreviewFromBlob]
  );

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
      setPreviewFromBlob(blob);
      setRecording(false);
    };
    recorder.start();
    setRecording(true);
    setTimeout(
      () => recorder.state === "recording" && recorder.stop(),
      MAX_VIDEO_SECONDS * 1000
    );
  }, [videoRef, setPreviewFromBlob]);

  const stopVideo = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  return {
    previewUrl,
    previewBlob,
    recording,
    capturePhoto,
    startVideo,
    stopVideo,
    clearPreview,
  };
}
