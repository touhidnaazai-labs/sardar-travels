"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { MediaMap, TourCard } from "@/lib/data";
import { CATEGORY_LABELS, durationText } from "@/lib/utils";

/** An editorial "table of contents" of tours with a floating image preview on hover (desktop). */
export function TourIndex({ tours, media }: { tours: TourCard[]; media: MediaMap }) {
  const [hover, setHover] = useState<string | null>(null);
  const active = tours.find((t) => t.id === hover);
  const img = active?.heroImageId ? media[active.heroImageId] : undefined;

  return (
    <div className="relative grid gap-10 lg:grid-cols-12">
      <ol className="lg:col-span-8" onMouseLeave={() => setHover(null)}>
        {tours.map((t, i) => (
          <li key={t.id} className="border-t border-line last:border-b">
            <Link
              href={`/tours/${t.slug}`}
              onMouseEnter={() => setHover(t.id)}
              onFocus={() => setHover(t.id)}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-6 md:grid-cols-[3.5rem_1fr_10rem_auto] md:py-7"
            >
              <span className="font-display text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="block font-display text-2xl leading-tight font-medium transition-colors group-hover:text-accent-strong md:text-[2rem]">
                  {t.title}
                </span>
                <span className="mt-2 block text-sm text-muted">
                  {t.highlights.slice(0, 4).join(" · ")}
                </span>
              </span>
              <span className="hidden text-sm text-muted md:block">
                <span className="block font-semibold text-ink">{durationText(t)}</span>
                {CATEGORY_LABELS[t.category]}
              </span>
              <ArrowRight className="size-5 -translate-x-2 text-accent opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
            </Link>
          </li>
        ))}
      </ol>
      <div className="relative hidden lg:col-span-4 lg:block">
        <div className="sticky top-28 aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-sand">
          <AnimatePresence mode="popLayout">
            {img ? (
              <motion.div
                key={img.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image src={img.src} alt={img.alt} fill sizes="30vw" className="object-cover" />
              </motion.div>
            ) : (
              <motion.div key="empty" className="absolute inset-0 grid place-items-center p-10 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-display text-2xl leading-snug font-medium text-ink/60 italic">Hover a journey to preview it.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
