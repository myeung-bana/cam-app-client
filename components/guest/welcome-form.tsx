"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGuestSession } from "@/contexts/guest-session-context";
import { enterJoin, resolveJoin } from "@/lib/functions/join";
import {
  buildSessionFromEnter,
  entryStatePath,
} from "@/lib/auth/guest-session";
import type { PublicEvent } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

export function WelcomeForm({
  joinCode,
  event,
  preview,
}: {
  joinCode: string;
  event: PublicEvent;
  preview?: boolean;
}) {
  const router = useRouter();
  const { setSession, setEvent } = useGuestSession();
  const [displayName, setDisplayName] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEnter() {
    if (!consent) {
      toast.error("Please accept the privacy notice to continue.");
      return;
    }

    setLoading(true);
    try {
      const resolved = await resolveJoin(joinCode, preview);
      if (resolved.entryState === "countdown" && !preview) {
        toast.error("This event hasn't started yet — check back at the start time.");
        router.replace(entryStatePath(joinCode, "countdown"));
        return;
      }

      const result = await enterJoin({
        joinCode,
        displayName: displayName.trim() || undefined,
        preview,
      });

      if (result.entryState !== "live" && !(preview && result.entryState === "countdown")) {
        router.replace(entryStatePath(joinCode, result.entryState, preview));
        return;
      }

      const session = buildSessionFromEnter(joinCode, result, event.id);
      setEvent(event);
      setSession(session);
      router.replace(`/j/${joinCode}/camera`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join event");
    } finally {
      setLoading(false);
    }
  }

  const accent = event.accentColor ?? "#6366f1";

  return (
    <div className="flex min-h-svh flex-col justify-end bg-[#0a0a0a] p-6 pb-12">
      {event.coverImageUrl && (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${event.coverImageUrl})` }}
        />
      )}
      <div className="relative z-10 mx-auto w-full max-w-md space-y-6">
        <div>
          <p className="text-sm uppercase tracking-widest text-white/60">You&apos;re invited to</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{event.name}</h1>
          {event.venueName && (
            <p className="mt-2 text-white/70">{event.venueName}</p>
          )}
        </div>

        <label className="block space-y-2">
          <span className="text-sm text-white/70">Display name (optional)</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={100}
            placeholder="Your name"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/40"
          />
        </label>

        <label className="flex items-start gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1"
          />
          <span>
            I agree that photos I capture may be stored for this event and used in
            the event gallery per the organiser&apos;s privacy policy.
          </span>
        </label>

        <button
          type="button"
          disabled={loading}
          onClick={() => void handleEnter()}
          className={cn(
            "w-full rounded-2xl py-4 text-base font-semibold text-white transition active:scale-[0.98]",
            loading && "opacity-60"
          )}
          style={{ backgroundColor: accent }}
        >
          {loading ? "Joining…" : "Enter camera"}
        </button>
      </div>
    </div>
  );
}
