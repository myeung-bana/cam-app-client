import { Suspense } from "react";
import { GuestSessionProvider } from "@/contexts/guest-session-context";
import { JoinResolver } from "@/components/guest/join-resolver";

export default async function JoinCodePage({
  params,
}: {
  params: Promise<{ joinCode: string }>;
}) {
  const { joinCode } = await params;

  return (
    <GuestSessionProvider>
      <Suspense fallback={<div className="flex min-h-svh items-center justify-center text-white/60">Loading…</div>}>
        <JoinResolver joinCode={joinCode} />
      </Suspense>
    </GuestSessionProvider>
  );
}
