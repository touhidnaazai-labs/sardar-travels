import Link from "next/link";
import type { ReactNode } from "react";
import type { MediaMeta } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MediaImage } from "./media-image";

export function PageHero({
  eyebrow,
  title,
  intro,
  media,
  crumbs,
  children,
  size = "md",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  media?: MediaMeta | null;
  crumbs?: { href: string; label: string }[];
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <section
      className={cn(
        "grain relative isolate flex flex-col justify-end overflow-hidden bg-ink text-white",
        size === "lg" ? "min-h-[64svh]" : size === "md" ? "min-h-[46svh]" : "min-h-[16rem]",
      )}
    >
      {media && <MediaImage media={media} sizes="100vw" priority className="-z-10 animate-kenburns" />}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,17,38,.45),rgba(9,17,38,.35)_40%,rgba(9,17,38,.92))]" />
      <div className="container-x pt-16 pb-10 md:pb-14">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6 animate-fade-up text-xs text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              {crumbs.map((c) => (
                <li key={c.href} className="flex items-center gap-2">
                  <span aria-hidden>/</span>
                  <Link href={c.href} className="hover:text-white">{c.label}</Link>
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow eyebrow-light mb-5 animate-fade-up">{eyebrow}</p>}
        <h1 className="max-w-4xl animate-fade-up text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] font-medium [animation-delay:.1s]">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-white/80 [animation-delay:.2s]">{intro}</p>}
        {children && <div className="mt-8 animate-fade-up [animation-delay:.3s]">{children}</div>}
      </div>
    </section>
  );
}
