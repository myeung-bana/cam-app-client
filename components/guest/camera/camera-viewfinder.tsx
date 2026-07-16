"use client";

interface CameraViewfinderProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  error: string | null;
}

export function CameraViewfinder({ videoRef, error }: CameraViewfinderProps) {
  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-svh w-full object-cover"
      />
      {error && (
        <p className="absolute inset-x-0 top-1/2 text-center text-white/80">{error}</p>
      )}
    </>
  );
}
