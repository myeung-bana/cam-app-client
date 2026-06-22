"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useGuestSession } from "@/contexts/guest-session-context";
import { resolveJoin } from "@/lib/functions/join";
import { WelcomeForm } from "@/components/guest/welcome-form";
import type { PublicEvent } from "@/lib/types";

export default function WelcomePageClient() {
  const params = useParams<{ joinCode: string }>();
  const searchParams = useSearchParams();
  const joinCode = params.joinCode;
  const preview = searchParams.get("preview") === "true";
  const { event: ctxEvent, setEvent } = useGuestSession();
  const [event, setLocalEvent] = useState<PublicEvent | null>(ctxEvent);

  useEffect(() => {
    if (!joinCode || event) return;
    void resolveJoin(joinCode, preview).then((r) => {
      if (r.event) {
        setLocalEvent(r.event);
        setEvent(r.event);
      }
    });
  }, [joinCode, preview, event, setEvent]);

  if (!event) {
    return (
      <div className="flex min-h-svh items-center justify-center text-white/60">
        Loading event…
      </div>
    );
  }

  return <WelcomeForm joinCode={joinCode} event={event} preview={preview} />;
}
