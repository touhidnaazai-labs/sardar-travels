"use client";

import { useEffect } from "react";

/** A reload (or fresh visit) always starts at the top, instead of where the browser last left off. */
export function ScrollTopOnLoad() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    // Keep deep links like /tours/x#enquire working.
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);
  return null;
}
