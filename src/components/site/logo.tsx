import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Sardar Travels logo (owner-supplied artwork, processed into web versions in
 * public/brand/). `tone="light"` uses the white version for dark backgrounds.
 */
export function Logo({ tone = "dark", className, priority }: { tone?: "dark" | "light"; className?: string; priority?: boolean }) {
  return (
    <Image
      src={tone === "light" ? "/brand/logo-horizontal-light.png" : "/brand/logo-horizontal.png"}
      alt="Sardar Travels"
      width={824}
      height={220}
      priority={priority}
      className={cn("h-11 w-auto", className)}
    />
  );
}
