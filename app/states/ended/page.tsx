import Link from "next/link";

export default function EndedStatePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-white">Event wrapped up</h1>
      <p className="mt-3 max-w-sm text-white/60">
        Thanks for capturing the moment. Your uploads are saved.
      </p>
      <Link href="/join" className="mt-8 text-sm text-white/70 underline">
        Join another event
      </Link>
    </div>
  );
}
