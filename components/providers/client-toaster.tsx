"use client";

import { Toaster } from "sonner";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";

export function ClientToaster() {
  const mounted = useClientMounted();
  if (!mounted) return null;
  return <Toaster richColors position="top-center" />;
}
