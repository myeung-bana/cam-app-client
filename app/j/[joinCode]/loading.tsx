export default function EventLoading() {
  return (
    <div
      className="flex min-h-svh items-center justify-center bg-[#0a0a0a] text-white/60"
      role="status"
      aria-live="polite"
    >
      Loading event…
    </div>
  );
}
