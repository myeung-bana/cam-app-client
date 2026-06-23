"use client";

import { ClientToaster } from "@/components/providers/client-toaster";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ClientToaster />
    </>
  );
}
