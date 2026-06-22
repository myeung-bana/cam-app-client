import { Suspense } from "react";
import WelcomePageClient from "./welcome-client";

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center text-white/60">
          Loading event…
        </div>
      }
    >
      <WelcomePageClient />
    </Suspense>
  );
}
