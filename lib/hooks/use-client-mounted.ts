"use client";

import { useEffect, useState } from "react";

/** True after the first client paint — use before rendering browser-only or storage-backed UI. */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
