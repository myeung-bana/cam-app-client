"use client";

import { useGuestSession } from "@/contexts/guest-session-context";
import { useEventChallenges } from "@/hooks/use-event-challenges";
import { cn } from "@/lib/utils/cn";

export function ChallengeList() {
  const { setActiveChallengeId, activeChallengeId } = useGuestSession();
  const { challenges, completedIds, loading, error } = useEventChallenges();

  if (loading) {
    return (
      <div className="space-y-3 p-4 pb-28" role="status" aria-live="polite">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="p-6 text-center text-red-400" role="alert">
        {error}
      </p>
    );
  }

  return (
    <ul className="space-y-3 p-4 pb-28">
      {challenges.map((c) => {
        const done = completedIds.has(c.id);
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
                    onClick={() => setActiveChallengeId(active ? null : c.id)}
                    className={cn(
                      "mt-3 rounded-full px-4 py-2 text-sm font-medium",
                      active ? "bg-white text-black" : "bg-white/15 text-white"
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
