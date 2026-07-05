export default function CameraLoading() {
  return (
    <div
      className="flex min-h-svh items-center justify-center bg-black text-white/60"
      role="status"
      aria-live="polite"
    >
      Opening camera…
    </div>
  );
}
