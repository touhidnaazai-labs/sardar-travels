import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { TourCard } from "@/components/site/tour-card";
import { TourFilters, type FilterOption } from "@/components/site/tour-filters";
import { getHomeSettings, getMediaMap, getPublishedDestinations, getPublishedTours, type TourCard as TourData } from "@/lib/data";
import { CATEGORY_LABELS, STYLE_LABELS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tour packages",
  description:
    "Browse Sardar Travels tours: Mysuru and Ooty sightseeing, Nilgiris and Kodaikanal holidays, Coorg, Hoysala heritage temples and pilgrimage circuits. Request a quote online.",
  alternates: { canonical: "/tours" },
};

const DURATIONS: (FilterOption & { test: (d: number) => boolean })[] = [
  { value: "1", label: "Day trips", test: (d) => d === 1 },
  { value: "2-3", label: "2–3 days", test: (d) => d >= 2 && d <= 3 },
  { value: "4+", label: "4 days or more", test: (d) => d >= 4 },
];

const BUDGETS: (FilterOption & { test: (p: number) => boolean })[] = [
  { value: "u5", label: "Under ₹5,000", test: (p) => p < 5000 },
  { value: "5-15", label: "₹5,000 – ₹15,000", test: (p) => p >= 5000 && p <= 15000 },
  { value: "15+", label: "Above ₹15,000", test: (p) => p > 15000 },
];

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

function applyFilters(tours: TourData[], sp: Search) {
  const q = one(sp.q).toLowerCase().trim();
  const dest = one(sp.destination);
  const cat = one(sp.category);
  const dur = DURATIONS.find((d) => d.value === one(sp.duration));
  const bud = BUDGETS.find((b) => b.value === one(sp.budget));
  const style = one(sp.style);
  const date = one(sp.date);
  return tours.filter((t) => {
    if (q && ![t.title, t.subtitle, t.summary, ...t.highlights, ...t.destinations.map((d) => d.name)].join(" ").toLowerCase().includes(q)) return false;
    if (dest && !t.destinations.some((d) => d.slug === dest)) return false;
    if (cat && t.category !== cat) return false;
    if (dur && !dur.test(t.durationDays)) return false;
    if (bud && (t.priceFrom == null || !bud.test(t.priceFrom))) return false;
    if (style && t.tourStyle !== style && t.tourStyle !== "private-or-group") return false;
    if (date && t.availabilityMode === "scheduled" && !t.availableDates.includes(date)) return false;
    return true;
  });
}

async function Results({ searchParams }: { searchParams: Promise<Search> }) {
  const [sp, tours, media] = await Promise.all([searchParams, getPublishedTours(), getMediaMap()]);
  const results = applyFilters(tours, sp);
  const date = one(sp.date);
  if (!results.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-line p-12 text-center">
        <p className="font-display text-3xl font-medium">No tours match those filters.</p>
        <p className="mt-3 text-muted">Try removing a filter — or tell us what you have in mind and we’ll plan it for you.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/tours" className="btn btn-ghost">Show all tours</Link>
          <Link href="/plan" className="btn btn-primary">Plan a custom trip</Link>
        </div>
      </div>
    );
  }
  return (
    <>
      <p className="mb-6 text-sm text-muted" aria-live="polite">
        {results.length} {results.length === 1 ? "tour" : "tours"}
        {date && " — availability for tours marked “on request” is confirmed in your quote"}
      </p>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((t, i) => (
          <li key={t.id}>
            <Reveal delay={(i % 3) * 0.06}>
              <TourCard tour={t} media={media} priority={i < 3} />
            </Reveal>
          </li>
        ))}
      </ul>
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading tours">
      {Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton min-h-[26rem] rounded-[1.5rem]" />)}
    </div>
  );
}

export default async function ToursPage(props: PageProps<"/tours">) {
  const [tours, destinations, media, home] = await Promise.all([getPublishedTours(), getPublishedDestinations(), getMediaMap(), getHomeSettings()]);
  const used = <T,>(arr: T[]) => [...new Set(arr)];
  const heroId = home.hero.imageIds[1] ?? home.hero.imageIds[0];
  const styles = used(tours.map((t) => t.tourStyle)).filter((s) => s === "private" || s === "group");
  return (
    <>
      <PageHero
        size="md"
        eyebrow={`${tours.length} journeys`}
        title="Tour packages"
        intro="Day trips from Mysuru, hill-station holidays and heritage circuits. Every itinerary can be adjusted — prices are confirmed in your personal quote."
        media={heroId ? media[heroId] : undefined}
        crumbs={[{ href: "/tours", label: "Tours" }]}
      />
      <div className="container-x relative z-10 -mt-10 pb-24">
        <Suspense fallback={<div className="skeleton h-32 rounded-[1.5rem]" />}>
          <TourFilters
            destinations={destinations.filter((d) => d.tourCount > 0).map((d) => ({ value: d.slug, label: d.name }))}
            categories={used(tours.map((t) => t.category)).map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
            durations={DURATIONS.filter((d) => tours.some((t) => d.test(t.durationDays))).map(({ value, label }) => ({ value, label }))}
            budgets={tours.some((t) => t.priceFrom != null) ? BUDGETS.map(({ value, label }) => ({ value, label })) : []}
            styles={styles.length ? [...styles, "private-or-group"].filter((v, i, a) => a.indexOf(v) === i && v !== "private-or-group").map((s) => ({ value: s, label: STYLE_LABELS[s] })) : []}
            showDate={tours.some((t) => t.availabilityMode !== "on-request")}
          />
        </Suspense>
        <div className="mt-12">
          <Suspense fallback={<ResultsSkeleton />}>
            <Results searchParams={props.searchParams} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
