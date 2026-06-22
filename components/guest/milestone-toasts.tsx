"use client";

import { useEffect, useRef } from "react";
import { useSubscription } from "@apollo/client/react";
import { toast } from "sonner";
import { SUBSCRIBE_EVENT_MEDIA_COUNT } from "@/lib/graphql/milestones/subscriptions";
import { useGuestSession } from "@/contexts/guest-session-context";

const MILESTONES = [10, 25, 50, 100];

export function MilestoneToasts() {
  const { session } = useGuestSession();
  const seenRef = useRef<Set<number>>(new Set());

  const { data } = useSubscription<{ media_aggregate: { aggregate: { count: number } } }>(
    SUBSCRIBE_EVENT_MEDIA_COUNT,
    {
      variables: { eventId: session?.eventId },
      skip: !session?.eventId,
    }
  );

  useEffect(() => {
    const count = data?.media_aggregate?.aggregate?.count;
    if (count === undefined) return;
    for (const threshold of MILESTONES) {
      if (count >= threshold && !seenRef.current.has(threshold)) {
        seenRef.current.add(threshold);
        toast.success(`${threshold} photos captured at this event!`);
      }
    }
  }, [data]);

  return null;
}
