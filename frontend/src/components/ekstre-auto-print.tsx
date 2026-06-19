"use client";

import { useEffect } from "react";

/** Yazdırma sayfasında otomatik print diyaloğu açar. */
export function EkstreAutoPrint() {
  useEffect(() => {
    const t = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
