import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { TourCategory } from "@/db/schema";
import {
  defaultHome,
  defaultServices,
  defaultSite,
  mergeDefaults,
  normaliseSections,
  type HomeSettings,
  type ServicesSettings,
  type SiteSettings,
} from "@/lib/settings";

/**
 * Public, cached reads. Every admin mutation calls `updateTag(CONTENT_TAG)`
 * so edits appear immediately on the public site.
 */
export const CONTENT_TAG = "content";

function tagContent() {
  cacheTag(CONTENT_TAG);
  cacheLife("days");
}

export type MediaMeta = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  blurDataUrl: string | null;
  credit: string | null;
  creditUrl: string | null;
  license: string | null;
};

export type MediaMap = Record<string, MediaMeta>;

export async function getMediaMap(): Promise<MediaMap> {
  "use cache";
  tagContent();
  const rows = await db
    .select({
      id: schema.media.id,
      width: schema.media.width,
      height: schema.media.height,
      alt: schema.media.alt,
      blurDataUrl: schema.media.blurDataUrl,
      credit: schema.media.credit,
      creditUrl: schema.media.creditUrl,
      license: schema.media.license,
      updatedAt: schema.media.updatedAt,
    })
    .from(schema.media);
  const map: MediaMap = {};
  for (const r of rows) {
    map[r.id] = {
      id: r.id,
      src: `/media/${r.id}?v=${r.updatedAt.getTime()}`,
      width: r.width,
      height: r.height,
      alt: r.alt,
      blurDataUrl: r.blurDataUrl,
      credit: r.credit,
      creditUrl: r.creditUrl,
      license: r.license,
    };
  }
  return map;
}

async function getSetting<T>(key: string, defaults: T): Promise<T> {
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, key));
  return mergeDefaults(defaults, row?.value);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  tagContent();
  return getSetting("site", defaultSite);
}

export async function getHomeSettings(): Promise<HomeSettings> {
  "use cache";
  tagContent();
  const home = await getSetting("home", defaultHome);
  return { ...home, sections: normaliseSections(home.sections) };
}

export async function getServicesSettings(): Promise<ServicesSettings> {
  "use cache";
  tagContent();
  return getSetting("services", defaultServices);
}

export type TourCard = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  category: TourCategory;
  durationDays: number;
  durationNights: number;
  durationLabel: string;
  priceFrom: number | null;
  priceCurrency: string;
  priceBasis: string;
  tourStyle: (typeof schema.tourStyle.enumValues)[number];
  availabilityMode: (typeof schema.availabilityMode.enumValues)[number];
  availableDates: string[];
  featured: boolean;
  departureTime: string;
  transport: string;
  heroImageId: string | null;
  destinations: { slug: string; name: string }[];
  highlights: string[];
};

async function destinationsByTour() {
  const rows = await db
    .select({
      tourId: schema.tourDestinations.tourId,
      slug: schema.destinations.slug,
      name: schema.destinations.name,
      published: schema.destinations.published,
    })
    .from(schema.tourDestinations)
    .innerJoin(schema.destinations, eq(schema.destinations.id, schema.tourDestinations.destinationId))
    .orderBy(asc(schema.destinations.sortOrder));
  const map = new Map<string, { slug: string; name: string }[]>();
  for (const r of rows) {
    if (!r.published) continue;
    const list = map.get(r.tourId) ?? [];
    list.push({ slug: r.slug, name: r.name });
    map.set(r.tourId, list);
  }
  return map;
}

export async function getPublishedTours(): Promise<TourCard[]> {
  "use cache";
  tagContent();
  const [rows, dest] = await Promise.all([
    db
      .select()
      .from(schema.tours)
      .where(eq(schema.tours.published, true))
      .orderBy(asc(schema.tours.sortOrder), asc(schema.tours.title)),
    destinationsByTour(),
  ]);
  return rows.map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    subtitle: t.subtitle,
    summary: t.summary,
    category: t.category,
    durationDays: t.durationDays,
    durationNights: t.durationNights,
    durationLabel: t.durationLabel,
    priceFrom: t.priceFrom,
    priceCurrency: t.priceCurrency,
    priceBasis: t.priceBasis,
    tourStyle: t.tourStyle,
    availabilityMode: t.availabilityMode,
    availableDates: t.availableDates,
    featured: t.featured,
    departureTime: t.departureTime,
    transport: t.transport,
    heroImageId: t.heroImageId,
    destinations: dest.get(t.id) ?? [],
    // Attractions only: skip timed logistics entries ("Departure 7:30 AM", "Arrive Kodaikanal", "Lunch break").
    highlights: t.itinerary
      .flatMap((d) => d.stops)
      .filter((s) => !s.time && !/^(departure|depart|arrive|return|lunch)\b/i.test(s.name))
      .map((s) => s.name)
      .slice(0, 5),
  }));
}

export async function getTourBySlug(slug: string) {
  "use cache";
  tagContent();
  const [tour] = await db
    .select()
    .from(schema.tours)
    .where(and(eq(schema.tours.slug, slug), eq(schema.tours.published, true)));
  if (!tour) return null;
  const dest = await destinationsByTour();
  // Strip internal-only fields before anything reaches the page.
  const { verificationNotes: _internal, ...publicTour } = tour;
  void _internal;
  return { ...publicTour, destinations: dest.get(tour.id) ?? [] };
}

export type PublicTour = NonNullable<Awaited<ReturnType<typeof getTourBySlug>>>;

export async function getPublishedDestinations() {
  "use cache";
  tagContent();
  const [rows, links, tourRows] = await Promise.all([
    db
      .select()
      .from(schema.destinations)
      .where(eq(schema.destinations.published, true))
      .orderBy(asc(schema.destinations.sortOrder), asc(schema.destinations.name)),
    db.select().from(schema.tourDestinations),
    db.select({ id: schema.tours.id }).from(schema.tours).where(eq(schema.tours.published, true)),
  ]);
  const live = new Set(tourRows.map((t) => t.id));
  return rows.map((d) => ({
    ...d,
    tourCount: links.filter((l) => l.destinationId === d.id && live.has(l.tourId)).length,
  }));
}

export async function getDestinationBySlug(slug: string) {
  "use cache";
  tagContent();
  const [d] = await db
    .select()
    .from(schema.destinations)
    .where(and(eq(schema.destinations.slug, slug), eq(schema.destinations.published, true)));
  return d ?? null;
}

export async function getPublishedFaqs() {
  "use cache";
  tagContent();
  return db
    .select()
    .from(schema.faqs)
    .where(eq(schema.faqs.published, true))
    .orderBy(asc(schema.faqs.sortOrder));
}

/** Only testimonials staff have marked both verified AND published. */
export async function getVerifiedTestimonials() {
  "use cache";
  tagContent();
  return db
    .select({
      id: schema.testimonials.id,
      name: schema.testimonials.name,
      location: schema.testimonials.location,
      quote: schema.testimonials.quote,
      travelledOn: schema.testimonials.travelledOn,
      tourId: schema.testimonials.tourId,
    })
    .from(schema.testimonials)
    .where(and(eq(schema.testimonials.published, true), eq(schema.testimonials.verified, true)))
    .orderBy(asc(schema.testimonials.sortOrder));
}

export async function getPublishedVehicles() {
  "use cache";
  tagContent();
  return db
    .select()
    .from(schema.vehicles)
    .where(and(eq(schema.vehicles.published, true), eq(schema.vehicles.verified, true)))
    .orderBy(asc(schema.vehicles.sortOrder));
}

export async function getPublishedBusRoutes() {
  "use cache";
  tagContent();
  return db
    .select()
    .from(schema.busRoutes)
    .where(eq(schema.busRoutes.published, true))
    .orderBy(asc(schema.busRoutes.operator), asc(schema.busRoutes.sortOrder));
}

export async function getPublishedPage(slug: string) {
  "use cache";
  tagContent();
  const [p] = await db
    .select()
    .from(schema.pages)
    .where(and(eq(schema.pages.slug, slug), eq(schema.pages.published, true)));
  return p ?? null;
}

export async function getFooterPages() {
  "use cache";
  tagContent();
  return db
    .select({ slug: schema.pages.slug, title: schema.pages.title })
    .from(schema.pages)
    .where(and(eq(schema.pages.published, true), eq(schema.pages.showInFooter, true)))
    .orderBy(asc(schema.pages.title));
}

export async function getToursByIds(ids: string[]) {
  if (!ids.length) return [];
  const all = await getPublishedTours();
  return all.filter((t) => ids.includes(t.id));
}
