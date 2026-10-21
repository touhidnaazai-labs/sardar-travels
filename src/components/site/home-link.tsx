"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Logo link: goes to the home page, and if you're already there it scrolls
 * smoothly back to the top (a plain link to the current page does nothing).
 */
export function HomeLink({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  return (
    <Link
      href="/"
      className={className}
      aria-label={label}
      onClick={(e) => {
        if (window.location.pathname === "/") {
          e.preventDefault();
          window.history.replaceState(null, "", "/");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
    >
      {children}
    </Link>
  );
}
