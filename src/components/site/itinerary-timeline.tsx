"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BedDouble, Clock } from "lucide-react";
import type { ItineraryDay } from "@/db/schema";
import { cn } from "@/lib/utils";

/** Day-by-day itinerary: day selector + animated vertical timeline of stops. */
export function ItineraryTimeline({ itinerary }: { itinerary: ItineraryDay[] }) {
  const days = useMemo(() => {
    const map = new Map<number, ItineraryDay[]>();
    for (const seg of itinerary) map.set(seg.day, [...(map.get(seg.day) ?? []), seg]);
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [itinerary]);
  const [active, setActive] = useState(days[0]?.[0] ?? 1);
  const segments = days.find(([d]) => d === active)?.[1] ?? [];
  const multiDay = days.length > 1;

  if (!days.length) return <p className="text-muted">The detailed itinerary is shared with your quote.</p>;

  return (
    <div className={cn("grid gap-8", multiDay && "md:grid-cols-[11rem_1fr]")}>
      {multiDay && (
        <div role="tablist" aria-label="Itinerary days" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:sticky md:top-28 md:flex-col md:self-start md:overflow-visible">
          {days.map(([d, segs]) => (
            <button
              key={d}
              role="tab"
              type="button"
              aria-selected={d === active}
              aria-controls="itinerary-panel"
              onClick={() => setActive(d)}
              className={cn(
                "group shrink-0 rounded-2xl border px-4 py-3 text-left transition-all duration-300",
                d === active ? "border-ink bg-ink text-ivory" : "border-line hover:border-ink/40",
              )}
            >
              <span className={cn("block text-[0.68rem] font-bold tracking-[0.2em] uppercase", d === active ? "text-accent" : "text-muted")}>Day {d}</span>
              <span className="mt-0.5 block max-w-[12rem] truncate text-sm font-medium">{segs[0].title}</span>
            </button>
          ))}
        </div>
      )}

      <div id="itinerary-panel" role={multiDay ? "tabpanel" : undefined} aria-live="polite" className="min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            {segments.map((seg, si) => (
              <div key={si}>
                <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="text-2xl font-medium md:text-3xl">{seg.title}</h3>
                  {seg.overnight && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
                      <BedDouble className="size-3.5" aria-hidden /> Overnight: {seg.overnight}
                    </span>
                  )}
                </div>
                {seg.summary && <p className="mb-5 max-w-2xl rounded-xl bg-ivory px-4 py-3 text-sm leading-relaxed text-muted">{seg.summary}</p>}
                <ol className="relative ml-2 border-l border-line">
                  {seg.stops.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i + 0.1, duration: 0.4 }}
                      className="relative pb-5 pl-7 last:pb-0"
                    >
                      <span aria-hidden className={cn("absolute top-1.5 -left-[5px] size-[9px] rounded-full ring-4 ring-paper", s.time ? "bg-accent" : "bg-ink")} />
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        {s.time && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold tracking-wide text-accent-strong">
                            <Clock className="size-3" aria-hidden /> {s.time}
                          </span>
                        )}
                        <span className="text-[1.02rem] font-medium">{s.name}</span>
                      </div>
                      {s.note && <p className="mt-1 text-sm text-muted">{s.note}</p>}
                    </motion.li>
                  ))}
                </ol>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
