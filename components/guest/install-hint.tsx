"use client";

import { useEffect, useState } from "react";

export function InstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const dismissed = sessionStorage.getItem("memo_install_hint_dismissed");
    if (isIos && !standalone && !dismissed) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 rounded-2xl border border-white/10 bg-zinc-900/95 p-4 text-sm text-white shadow-lg backdrop-blur">
      <p className="font-medium">Add Memo to your home screen</p>
      <p className="mt-1 text-white/60">
        Tap Share, then &quot;Add to Home Screen&quot; for the best camera experience.
      </p>
      <button
        type="button"
        className="mt-3 text-xs text-white/50 underline"
        onClick={() => {
          sessionStorage.setItem("memo_install_hint_dismissed", "1");
          setVisible(false);
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
