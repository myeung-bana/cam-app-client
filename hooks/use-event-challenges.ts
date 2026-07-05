"use client";

import { useCallback, useEffect, useState } from "react";
import { useGuestSession } from "@/contexts/guest-session-context";
import { executeGraphQL } from "@/lib/graphql/execute";
import { GET_EVENT_CHALLENGES } from "@/lib/graphql/challenges/queries";
import { GET_SESSION_COMPLETIONS } from "@/lib/graphql/challenge-completions/mutations";
import { mapChallenge, type ChallengeRow } from "@/lib/graphql/mappers";
import type { Challenge } from "@/lib/types";

export function useEventChallenges() {
  const { session, accessToken, refreshToken } = useGuestSession();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.eventId) return;
    setLoading(true);
    setError(null);
    try {
      const token = (await refreshToken()) ?? accessToken;
      if (!token) return;

      const [challengeData, completionData] = await Promise.all([
        executeGraphQL<{ challenges: ChallengeRow[] }>(
          GET_EVENT_CHALLENGES,
          { eventId: session.eventId },
          token
        ),
        executeGraphQL<{
          challenge_completions: Array<{ challenge_id: string }>;
        }>(GET_SESSION_COMPLETIONS, { sessionId: session.guestSessionId }, token),
      ]);

      setChallenges(challengeData.challenges.map(mapChallenge));
      setCompletedIds(
        new Set(completionData.challenge_completions.map((c) => c.challenge_id))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load challenges");
    } finally {
      setLoading(false);
    }
  }, [session, accessToken, refreshToken]);

  useEffect(() => {
    void load();
  }, [load]);

  return { challenges, completedIds, loading, error, refetch: load };
}
