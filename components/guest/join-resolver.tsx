"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveJoin } from "@/lib/functions/join";
import { entryStatePath } from "@/lib/auth/guest-session";
import { useGuestSession } from "@/contexts/guest-session-context";
import { sessionMatchesJoinCode, readGuestSession } from "@/lib/auth/guest-session";

export function JoinResolver({ joinCode }: { joinCode: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "true";
  const { setEvent } = useGuestSession();
  const [message, setMessage] = useState("Checking event…");

  useEffect(() => {
    const existing = readGuestSession();
    if (sessionMatchesJoinCode(existing, joinCode)) {
      router.replace(`/j/${joinCode}/camera`);
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        const result = await resolveJoin(joinCode, preview);
        if (cancelled) return;

        if (result.event) setEvent(result.event);

        if (result.entryState === "live" || (preview && result.entryState === "countdown")) {
          router.replace(entryStatePath(joinCode, result.entryState, preview));
          return;
        }

        router.replace(entryStatePath(joinCode, result.entryState, preview));
      } catch {
        if (!cancelled) {
          setMessage("Could not reach the event server.");
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [joinCode, preview, router, setEvent]);

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#0a0a0a] text-white/70">
      {message}
    </div>
  );
}
