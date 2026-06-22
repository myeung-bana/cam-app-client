"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resolveJoin } from "@/lib/functions/join";
import { entryStatePath } from "@/lib/auth/guest-session";
import { isValidJoinCode } from "@/lib/utils/join-code";

export function ManualJoinForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [failures, setFailures] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!isValidJoinCode(trimmed)) {
      toast.error("Enter the full 8–12 character code exactly as shown");
      return;
    }

    setLoading(true);
    try {
      const result = await resolveJoin(trimmed);
      if (result.entryState === "not_found") {
        setFailures((n) => n + 1);
        toast.error("Event code not found");
        return;
      }
      router.push(entryStatePath(trimmed, result.entryState));
    } catch (err) {
      setFailures((n) => n + 1);
      toast.error(err instanceof Error ? err.message : "Could not verify code");
    } finally {
      setLoading(false);
    }
  }

  const locked = failures >= 5;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold text-white">Enter event code</h1>
      <p className="mt-2 text-sm text-white/60">
        Type the code from your invitation or table card. Codes are case-sensitive.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={locked || loading}
          placeholder="Join code"
          className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-center font-mono text-lg tracking-wide text-white outline-none focus:border-white/40"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
        />
        {locked ? (
          <p className="text-center text-sm text-amber-400">
            Too many attempts — wait a moment and try again.
          </p>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-white py-4 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Checking…" : "Continue"}
          </button>
        )}
      </form>
    </div>
  );
}
