"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCamera(initialFacing: "user" | "environment" = "environment") {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(initialFacing);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  const start = useCallback(async () => {
    stop();
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        setReady(true);
      }
    } catch {
      setError("Camera access is required to capture photos.");
      setReady(false);
    }
  }, [facingMode, stop]);

  useEffect(() => {
    void start();
    return () => stop();
  }, [start, stop]);

  const flip = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  return { videoRef, ready, error, flip, facingMode, restart: start };
}
