"use client";

import { useEffect, useState } from "react";

/** Returns true after the component has mounted on the client. */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
