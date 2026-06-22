"use client";

import Link from "next/link";
import { useGuestSession } from "@/contexts/guest-session-context";

export function GuestHeader({
  joinCode,
  rightSlot,
}: {
  joinCode: string;
  rightSlot?: React.ReactNode;
}) {
  const { event } = useGuestSession();

  return (
    <header className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">
          {event?.name ?? "Memo Event"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {rightSlot}
        <Link
          href={`/j/${joinCode}/gallery`}
          className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur"
        >
          Gallery
        </Link>
      </div>
    </header>
  );
}
