"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Images, Target } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { href: "camera", label: "Camera", icon: Camera },
  { href: "challenges", label: "Challenges", icon: Target },
  { href: "gallery", label: "My Uploads", icon: Images },
] as const;

export function GuestTabNav({ joinCode }: { joinCode: string }) {
  const pathname = usePathname();
  const base = `/j/${joinCode}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const path = `${base}/${href}`;
          const active = pathname.startsWith(path);
          return (
            <li key={href} className="flex-1">
              <Link
                href={path}
                className={cn(
                  "flex min-h-[60px] flex-col items-center justify-center gap-1 text-xs transition-colors",
                  active ? "text-white" : "text-white/50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
