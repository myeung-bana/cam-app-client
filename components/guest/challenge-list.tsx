"use client";

import { useEffect, useState } from "react";
import { useGuestSession } from "@/contexts/guest-session-context";
import { executeGraphQL } from "@/lib/graphql/execute";
import { GET_EVENT_CHALLENGES } from "@/lib/graphql/challenges/queries";
import { GET_SESSION_COMPLETIONS } from "@/lib/graphql/challenge-completions/mutations";
import type { Challenge } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

export function ChallengeList() {
  const { session, accessToken, refreshToken, setActiveChallengeId, activeChallengeId } =
    useGuestSession();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session?.eventId) return;
    let cancelled = false;

    async function load() {
      if (!session) return;
      const token = (await refreshToken()) ?? accessToken;
      if (!token) return;
      const [challengeData, completionData] = await Promise.all([
        executeGraphQL<{ challenges: Challenge[] }>(
          GET_EVENT_CHALLENGES,
          { eventId: session.eventId },
          token
        ),
        executeGraphQL<{
          challenge_completions: Array<{ challenge_id: string }>;
        }>(GET_SESSION_COMPLETIONS, { sessionId: session.guestSessionId }, token),
      ]);
      if (cancelled) return;
      setChallenges(challengeData.challenges);
      setCompleted(
        new Set(completionData.challenge_completions.map((c) => c.challenge_id))
      );
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [session, accessToken, refreshToken]);

  return (
    <ul className="space-y-3 p-4 pb-28">
      {challenges.map((c) => {
        const done = completed.has(c.id);
        const active = activeChallengeId === c.id;
        return (
          <li
            key={c.id}
            className={cn(
              "rounded-2xl border border-white/10 bg-white/5 p-4",
              done && "opacity-60"
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{c.icon || "📸"}</span>
              <div className="flex-1">
                <p className="font-medium text-white">{c.title}</p>
                <p className="mt-1 text-sm text-white/60">{c.description}</p>
                {done ? (
                  <p className="mt-2 text-xs text-emerald-400">Completed</p>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveChallengeId(active ? null : c.id)
                    }
                    className={cn(
                      "mt-3 rounded-full px-4 py-2 text-sm font-medium",
                      active
                        ? "bg-white text-black"
                        : "bg-white/15 text-white"
                    )}
                  >
                    {active ? "Tagged for next shot" : "Tag next capture"}
                  </button>
                )}
              </div>
            </div>
          </li>
        );
      })}
      {challenges.length === 0 && (
        <p className="text-center text-white/60">No challenges for this event yet.</p>
      )}
    </ul>
  );
}
