import Link from "next/link";

export default function CapFullStatePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-white">Event is full</h1>
      <p className="mt-3 max-w-sm text-white/60">
        This event has reached its guest capacity. Please check with the organiser.
      </p>
      <Link href="/join" className="mt-8 text-sm text-white/70 underline">
        Try another code
      </Link>
    </div>
  );
}
