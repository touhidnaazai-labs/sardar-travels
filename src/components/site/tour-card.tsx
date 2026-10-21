import Link from "next/link";
import { ArrowUpRight, Car, Clock, MapPin, Sunrise } from "lucide-react";
import type { MediaMap, TourCard as TourCardData } from "@/lib/data";
import { CATEGORY_LABELS, cn, durationText, formatPrice } from "@/lib/utils";
import { MediaImage } from "./media-image";

export function PriceTag({ tour, className }: { tour: Pick<TourCardData, "priceFrom" | "priceCurrency" | "priceBasis">; className?: string }) {
  return tour.priceFrom != null ? (
    <span className={className}>
      From <strong className="font-bold">{formatPrice(tour.priceFrom, tour.priceCurrency)}</strong>
      {tour.priceBasis && <span className="opacity-70"> {tour.priceBasis}</span>}
    </span>
  ) : (
    <span className={className}>Price on request</span>
  );
}

/** `card`: photo above details. `feature`: full-bleed photo with overlaid text (used for the lead tour). */
export function TourCard({
  tour,
  media,
  className,
  variant = "card",
  priority,
}: {
  tour: TourCardData;
  media: MediaMap;
  className?: string;
  variant?: "card" | "feature";
  priority?: boolean;
}) {
  const img = tour.heroImageId ? media[tour.heroImageId] : undefined;
  const meta = (
    <p className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
      {tour.destinations.length > 0 && (
        <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 opacity-70" aria-hidden /> {tour.destinations.map((d) => d.name).join(", ")}</span>
      )}
      {tour.departureTime && <span className="inline-flex items-center gap-1.5"><Sunrise className="size-4 opacity-70" aria-hidden /> {tour.departureTime}</span>}
      {tour.transport && <span className="inline-flex items-center gap-1.5"><Car className="size-4 opacity-70" aria-hidden /> {tour.transport}</span>}
    </p>
  );

  if (variant === "feature") {
    return (
      <Link href={`/tours/${tour.slug}`} className={cn("group relative isolate flex min-h-[28rem] flex-col justify-end overflow-hidden rounded-3xl bg-ink text-white", className)}>
        <MediaImage media={img} sizes="(min-width: 1024px) 55vw, 100vw" className="-z-10 transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" priority={priority} />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,17,38,.1)_25%,rgba(9,17,38,.9))]" />
        <span className="absolute top-5 left-5 rounded-full bg-accent px-3.5 py-1 text-xs font-bold text-ink">Most booked route</span>
        <span className="absolute top-5 right-5 grid size-11 place-items-center rounded-full bg-white text-ink transition-transform group-hover:rotate-45"><ArrowUpRight className="size-5" aria-hidden /></span>
        <div className="p-7 md:p-9">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur"><Clock className="size-3.5" aria-hidden /> {durationText(tour)}</p>
          <h3 className="max-w-md text-4xl leading-[1.05] font-semibold md:text-5xl">{tour.title}</h3>
          <p className="mt-3 max-w-md text-white/80">{tour.summary}</p>
          <div className="mt-5 text-white/80">{meta}</div>
          <PriceTag tour={tour} className="mt-4 block text-sm font-semibold text-white" />
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/tours/${tour.slug}`} className={cn("group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(15,28,58,.5)]", className)}>
      <div className="relative aspect-[16/11] overflow-hidden bg-sand">
        <MediaImage media={img} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" className="transition-transform duration-700 group-hover:scale-105" priority={priority} />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-ink">{CATEGORY_LABELS[tour.category]}</span>
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur"><Clock className="size-3.5" aria-hidden /> {durationText(tour)}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[1.35rem] leading-snug font-semibold">{tour.title}</h3>
        <div className="mt-2 text-muted">{meta}</div>
        {tour.highlights.length > 0 && (
          <p className="mt-4 text-sm leading-relaxed text-ink/80">
            {tour.highlights.slice(0, 3).join(" · ")}
            {tour.highlights.length > 3 && <span className="text-muted"> + more</span>}
          </p>
        )}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
          <PriceTag tour={tour} className="text-sm font-semibold" />
          <span className="inline-flex items-center gap-1 text-sm font-bold text-forest">
            Details <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
