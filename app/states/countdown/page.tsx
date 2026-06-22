import { Suspense } from "react";
import CountdownStateClient from "./countdown-client";

export default function CountdownStatePage() {
  return (
    <Suspense fallback={<div className="flex min-h-svh items-center justify-center text-white/60">Loading…</div>}>
      <CountdownStateClient />
    </Suspense>
  );
}
