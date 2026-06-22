import { callFunction } from "./client";
import type { EnterJoinResult, ResolveJoinResult } from "@/lib/types";

export async function resolveJoin(
  joinCode: string,
  preview = false
): Promise<ResolveJoinResult> {
  return callFunction<ResolveJoinResult>("/guest/join/resolve", {
    query: {
      joinCode,
      ...(preview ? { preview: "true" } : {}),
    },
  });
}

export async function enterJoin(input: {
  joinCode: string;
  displayName?: string;
  preview?: boolean;
}): Promise<EnterJoinResult> {
  return callFunction<EnterJoinResult>("/guest/join/enter", {
    method: "POST",
    body: input,
  });
}

export async function sendHeartbeat(
  guestSessionId: string,
  accessToken: string
): Promise<{ guestSessionId: string; lastHeartbeatAt: string }> {
  return callFunction("/guest/session/heartbeat", {
    method: "POST",
    body: { guestSessionId },
    accessToken,
  });
}
