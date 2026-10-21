/**
 * One-off sync: applies the details transcribed from the original brochure
 * photos (Oct 2026) to an already-seeded database. Overwrites tour content,
 * the booking-terms page and brochure-related FAQs with the seed versions.
 *
 *   npm run db:apply-brochure -- --yes
 *
 * Run it once, before staff start editing tours in the dashboard; afterwards
 * the dashboard is the source of truth.
 */
import { eq } from "drizzle-orm";
import { scriptDb } from "./script-db";
import { BROCHURE_CANCELLATION, seedFaqs, seedPages, seedTours } from "./seed-data";
import { defaultServices, mergeDefaults } from "../src/lib/settings";

if (!process.argv.includes("--yes")) {
  console.error("This overwrites tour content with the brochure versions. Re-run with --yes to continue.");
  process.exit(1);
}

const { db, client, schema } = scriptDb();

const media = await db.select({ id: schema.media.id, filename: schema.media.filename }).from(schema.media);
const img = Object.fromEntries(media.map((m) => [m.filename.replace(/^seed-|\.jpg$/g, ""), m.id]));
const dests = await db.select({ id: schema.destinations.id, slug: schema.destinations.slug }).from(schema.destinations);
const destId = Object.fromEntries(dests.map((d) => [d.slug, d.id]));

let updated = 0;
let created = 0;
for (const [i, t] of seedTours.entries()) {
  const { destinations, hero, gallery, ...fields } = t;
  const values = {
    ...fields,
    dropOffs: t.dropOffs ?? "",
    transport: t.transport ?? "",
    accommodation: t.accommodation ?? "",
    importantNotes: t.importantNotes ?? "",
    faqs: t.faqs ?? [],
    cancellationPolicy: BROCHURE_CANCELLATION,
    heroImageId: img[hero] ?? null,
    gallery: gallery.filter((g) => img[g.image]).map((g) => ({ mediaId: img[g.image], caption: g.caption })),
    sortOrder: i,
    seoTitle: `${t.title} — ${t.durationLabel} tour | Sardar Travels`,
    seoDescription: t.summary.slice(0, 160),
    updatedAt: new Date(),
  };
  const [existing] = await db.select({ id: schema.tours.id }).from(schema.tours).where(eq(schema.tours.slug, t.slug));
  let tourId: string;
  if (existing) {
    await db.update(schema.tours).set(values).where(eq(schema.tours.id, existing.id));
    tourId = existing.id;
    updated++;
  } else {
    const [row] = await db.insert(schema.tours).values(values).returning({ id: schema.tours.id });
    tourId = row.id;
    created++;
  }
  await db.delete(schema.tourDestinations).where(eq(schema.tourDestinations.tourId, tourId));
  const links = destinations.filter((s) => destId[s]).map((s) => ({ tourId, destinationId: destId[s] }));
  if (links.length) await db.insert(schema.tourDestinations).values(links);
}
console.log(`✓ Tours: ${updated} updated, ${created} created`);

// FAQs: replace the old "entry tickets" question and add any new brochure FAQs.
await db.delete(schema.faqs).where(eq(schema.faqs.question, "Are entry tickets, boating and activities included?"));
const existingFaqs = new Set((await db.select({ q: schema.faqs.question }).from(schema.faqs)).map((f) => f.q));
for (const [i, f] of seedFaqs.entries()) {
  if (existingFaqs.has(f.question)) {
    await db.update(schema.faqs).set({ answer: f.answer, sortOrder: i }).where(eq(schema.faqs.question, f.question));
  } else {
    await db.insert(schema.faqs).values({ ...f, sortOrder: i });
  }
}
console.log("✓ FAQs");

for (const slug of ["booking-terms", "about"]) {
  const p = seedPages.find((x) => x.slug === slug)!;
  await db.update(schema.pages).set({ body: p.body, intro: p.intro, updatedAt: new Date() }).where(eq(schema.pages.slug, slug));
}
console.log("✓ Booking terms and About pages");

const [svc] = await db.select().from(schema.settings).where(eq(schema.settings.key, "services"));
if (svc) {
  const value = mergeDefaults(defaultServices, svc.value);
  value.vehicle.intro = defaultServices.vehicle.intro;
  await db.update(schema.settings).set({ value, updatedAt: new Date() }).where(eq(schema.settings.key, "services"));
  console.log("✓ Vehicle hire intro");
}

await client.end();
console.log("Done. Restart or redeploy the app so cached pages refresh.");
