"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Every page opens at the top: on first load/reload, and whenever you move to
 * another page. `behavior: "instant"` overrides the site's smooth scrolling so
 * you never watch the old scroll position animate away.
 *
 * Section links (/page#section) jump to the section instead. Because parts of
 * a page stream in after the first paint, the target may not exist yet, so we
 * keep looking for it briefly. Filter changes (same path) are left alone.
 */
export function ScrollTopOnLoad() {
  const pathname = usePathname();
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }
    let tries = 0;
    const timer = window.setInterval(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "instant", block: "start" });
        window.clearInterval(timer);
      } else if (++tries > 40) {
        window.clearInterval(timer);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [pathname]);
  return null;
}
