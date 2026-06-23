"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resolveJoin } from "@/lib/functions/join";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import { formatCountdown } from "@/lib/utils/cn";

export default function CountdownStateClient() {
  const searchParams = useSearchParams();
  const mounted = useClientMounted();
  const joinCode = searchParams.get("joinCode") ?? "";
  const [eventName, setEventName] = useState("");
  const [startTime, setStartTime] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!joinCode) return;
    void resolveJoin(joinCode, searchParams.get("preview") === "true").then((r) => {
      if (r.event) {
        setEventName(r.event.name);
        setStartTime(r.event.startTime);
      }
    });
  }, [joinCode, searchParams]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-white">{eventName || "Event"}</h1>
      <p className="mt-2 text-white/60">Hasn&apos;t started yet</p>
      {mounted && startTime && (
        <p className="mt-6 text-3xl font-semibold tabular-nums text-white">
          {formatCountdown(startTime)}
        </p>
      )}
      {joinCode && (
        <Link href={`/j/${joinCode}`} className="mt-8 text-sm text-white/60 underline">
          Refresh
        </Link>
      )}
    </div>
  );
}
