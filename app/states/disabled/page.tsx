import Link from "next/link";

export default function DisabledStatePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-white">Entry paused</h1>
      <p className="mt-3 max-w-sm text-white/60">
        QR access for this event is temporarily disabled. Ask the organiser for help.
      </p>
      <Link href="/join" className="mt-8 text-sm text-white/70 underline">
        Try another code
      </Link>
    </div>
  );
}
