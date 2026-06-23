"use client";

import { Suspense } from "react";
import { GuestSessionProvider } from "@/contexts/guest-session-context";
import { GuestApolloProvider } from "@/components/providers/guest-apollo-provider";
import { usePathname } from "next/navigation";
import { GuestTabNav } from "@/components/guest/guest-tab-nav";
import { useHeartbeat } from "@/hooks/use-heartbeat";
import { MilestoneToasts } from "@/components/guest/milestone-toasts";
import { OfflineUploadReplay } from "@/components/guest/offline-upload-replay";
import { InstallHint } from "@/components/guest/install-hint";

function EventShellInner({
  joinCode,
  children,
}: {
  joinCode: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showTabNav =
    pathname.includes("/camera") ||
    pathname.includes("/gallery") ||
    pathname.includes("/challenges");

  useHeartbeat();
  return (
    <>
      <MilestoneToasts />
      <OfflineUploadReplay />
      <InstallHint />
      {children}
      {showTabNav && <GuestTabNav joinCode={joinCode} />}
    </>
  );
}

export function EventShell({
  joinCode,
  children,
}: {
  joinCode: string;
  children: React.ReactNode;
}) {
  return (
    <GuestSessionProvider>
      <GuestApolloProvider>
        <Suspense fallback={null}>
          <EventShellInner joinCode={joinCode}>{children}</EventShellInner>
        </Suspense>
      </GuestApolloProvider>
    </GuestSessionProvider>
  );
}
