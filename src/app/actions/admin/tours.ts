"use server";

import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import type { FaqItem, GalleryItem, ItineraryDay, PricingRule } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { b, contentChanged, fail, isUuid, json, lines, n, nullable, s, type ActionResult } from "@/lib/admin-action";
import { slugify } from "@/lib/utils";

const itinerarySchema = z
  .array(
    z.object({
      day: z.coerce.number().int().min(1).max(60),
      title: z.string().trim().max(200),
      summary: z.string().trim().max(2000).optional(),
      overnight: z.string().trim().max(200).optional(),
      stops: z.array(z.object({ time: z.string().trim().max(40).optional(), name: z.string().trim().min(1).max(200), note: z.string().trim().max(500).optional() })).max(60),
    }),
  )
  .max(60);
const faqSchema = z.array(z.object({ q: z.string().trim().min(1).max(300), a: z.string().trim().min(1).max(3000) })).max(40);
const rulesSchema = z.array(z.object({ label: z.string().trim().min(1).max(120), amount: z.coerce.number().min(0).max(1e8), basis: z.string().trim().max(80).optional() })).max(30);
const gallerySchema = z.array(z.object({ mediaId: z.uuid(), caption: z.string().trim().max(200).optional() })).max(40);

const CATEGORIES = schema.tourCategory.enumValues;
const STYLES = schema.tourStyle.enumValues;
const MODES = schema.availabilityMode.enumValues;

export async function saveTour(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireUser("admin");
  const id = s(fd, "id");
  const title = s(fd, "title");
  const slug = slugify(s(fd, "slug") || title);
  const errors: Record<string, string> = {};
  if (title.length < 2) errors.title = "Title is required";
  if (!slug) errors.slug = "Slug is required";

  const category = s(fd, "category") as (typeof CATEGORIES)[number];
  const tourStyle = s(fd, "tourStyle") as (typeof STYLES)[number];
  const availabilityMode = s(fd, "availabilityMode") as (typeof MODES)[number];
  if (!CATEGORIES.includes(category)) errors.category = "Choose a category";

  const itinerary = itinerarySchema.safeParse(json<ItineraryDay[]>(fd, "itinerary", []));
  const faqs = faqSchema.safeParse(json<FaqItem[]>(fd, "faqs", []));
  const rules = rulesSchema.safeParse(json<PricingRule[]>(fd, "pricingRules", []));
  const gallery = gallerySchema.safeParse(json<GalleryItem[]>(fd, "gallery", []));
  if (!itinerary.success) errors.itinerary = "Every stop needs a name";
  if (!faqs.success) errors.faqs = "Each FAQ needs a question and an answer";
  if (!rules.success) errors.pricingRules = "Each pricing rule needs a label and amount";
  if (!gallery.success) errors.gallery = "Invalid gallery";

  const priceFrom = n(fd, "priceFrom");
  if (priceFrom !== null && (priceFrom < 0 || priceFrom > 1e8)) errors.priceFrom = "Enter a valid price";
  const dates = lines(fd, "availableDates").filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  if (availabilityMode === "scheduled" && !dates.length) errors.availableDates = "Add at least one departure date (YYYY-MM-DD)";

  const destinationIds = fd.getAll("destinationIds").map(String).filter(isUuid);
  const heroImageId = s(fd, "heroImageId");

  const [clash] = await db
    .select({ id: schema.tours.id })
    .from(schema.tours)
    .where(id ? and(eq(schema.tours.slug, slug), ne(schema.tours.id, id)) : eq(schema.tours.slug, slug));
  if (clash) errors.slug = "Another tour already uses this URL";
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields.", errors);

  const values = {
    slug,
    title,
    code: nullable(s(fd, "code")),
    subtitle: s(fd, "subtitle"),
    category,
    durationDays: Math.max(1, Math.min(60, n(fd, "durationDays") ?? 1)),
    durationNights: Math.max(0, Math.min(60, n(fd, "durationNights") ?? 0)),
    durationLabel: s(fd, "durationLabel"),
    summary: s(fd, "summary"),
    overview: s(fd, "overview"),
    startPoint: s(fd, "startPoint"),
    departureTime: s(fd, "departureTime"),
    departureNotes: s(fd, "departureNotes"),
    dropOffs: s(fd, "dropOffs"),
    transport: s(fd, "transport"),
    tourStyle: STYLES.includes(tourStyle) ? tourStyle : "unconfirmed",
    priceFrom,
    priceCurrency: (s(fd, "priceCurrency") || "INR").toUpperCase().slice(0, 3),
    priceBasis: s(fd, "priceBasis"),
    pricingRules: rules.data!,
    pricingNotes: s(fd, "pricingNotes"),
    availabilityMode: MODES.includes(availabilityMode) ? availabilityMode : "on-request",
    availableDates: dates,
    itinerary: itinerary.data!,
    inclusions: lines(fd, "inclusions"),
    exclusions: lines(fd, "exclusions"),
    accommodation: s(fd, "accommodation"),
    cancellationPolicy: s(fd, "cancellationPolicy"),
    importantNotes: s(fd, "importantNotes"),
    faqs: faqs.data!,
    heroImageId: isUuid(heroImageId) ? heroImageId : null,
    gallery: gallery.data!,
    seoTitle: nullable(s(fd, "seoTitle")),
    seoDescription: nullable(s(fd, "seoDescription")),
    featured: b(fd, "featured"),
    published: b(fd, "published"),
    sortOrder: n(fd, "sortOrder") ?? 0,
    verificationNotes: s(fd, "verificationNotes"),
    updatedAt: new Date(),
  };

  const tourId = await db.transaction(async (tx) => {
    let tid = id;
    if (tid && isUuid(tid)) {
      const updated = await tx.update(schema.tours).set(values).where(eq(schema.tours.id, tid)).returning({ id: schema.tours.id });
      if (!updated.length) throw new Error("Tour not found");
    } else {
      const [row] = await tx.insert(schema.tours).values(values).returning({ id: schema.tours.id });
      tid = row.id;
    }
    await tx.delete(schema.tourDestinations).where(eq(schema.tourDestinations.tourId, tid));
    if (destinationIds.length) {
      await tx.insert(schema.tourDestinations).values(destinationIds.map((destinationId) => ({ tourId: tid, destinationId })));
    }
    return tid;
  });

  contentChanged();
  if (!id) redirect(`/admin/tours/${tourId}?created=1`);
  return { ok: true, message: values.published ? "Tour saved and live on the website." : "Tour saved as a draft.", id: tourId };
}

export async function setTourPublished(id: string, published: boolean) {
  await requireUser("admin");
  if (!isUuid(id)) return;
  await db.update(schema.tours).set({ published, updatedAt: new Date() }).where(eq(schema.tours.id, id));
  contentChanged();
}

export async function duplicateTour(id: string) {
  await requireUser("admin");
  if (!isUuid(id)) return;
  const [t] = await db.select().from(schema.tours).where(eq(schema.tours.id, id));
  if (!t) return;
  const links = await db.select().from(schema.tourDestinations).where(eq(schema.tourDestinations.tourId, id));
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = t;
  void _id; void _c; void _u;
  const [copy] = await db
    .insert(schema.tours)
    .values({ ...rest, slug: `${t.slug}-copy-${Date.now().toString(36)}`, title: `${t.title} (copy)`, published: false, featured: false })
    .returning({ id: schema.tours.id });
  if (links.length) await db.insert(schema.tourDestinations).values(links.map((l) => ({ tourId: copy.id, destinationId: l.destinationId })));
  contentChanged();
  redirect(`/admin/tours/${copy.id}`);
}

export async function deleteTour(id: string) {
  await requireUser("admin");
  if (!isUuid(id)) return;
  await db.delete(schema.tours).where(eq(schema.tours.id, id));
  contentChanged();
  redirect("/admin/tours");
}
