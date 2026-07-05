"use client";

import Link from "next/link";

export default function EventError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-[#0a0a0a] p-6 text-center text-white">
      <h1 className="text-xl font-semibold">Could not load this event</h1>
      <p className="max-w-sm text-sm text-white/60">
        {error.message || "Please scan the QR code again or try later."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
        >
          Try again
        </button>
        <Link
          href="/join"
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white"
        >
          Enter join code
        </Link>
      </div>
    </div>
  );
}
