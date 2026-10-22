/**
 * Idempotent seed: loads brochure tours, destinations, FAQs, pages, bus
 * routes, licensed photography and default settings. Existing records (matched
 * by slug / filename / key) are left untouched so admin edits are never lost.
 *
 *   npm run db:seed
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { scriptDb } from "./script-db";
import { processImage } from "../src/lib/images";
import { defaultHome, defaultServices, defaultSite, mergeDefaults } from "../src/lib/settings";
import {
  cancellationFor,
  seedBusRoutes,
  seedDestinations,
  seedFaqs,
  seedHeroImages,
  seedImageAlts,
  seedPages,
  allSeedTours as seedTours,
} from "./seed-data";

const { db, client, schema } = scriptDb();
const IMG_DIR = path.join(process.cwd(), "db/seed-images");

type Credit = { title: string; author: string; license: string; licenseUrl: string; source: string };

async function seedMedia() {
  const credits: Record<string, Credit> = JSON.parse(await readFile(path.join(IMG_DIR, "credits.json"), "utf8"));
  const files = (await readdir(IMG_DIR)).filter((f) => f.endsWith(".jpg"));
  const ids: Record<string, string> = {};
  for (const file of files) {
    const key = file.replace(/\.jpg$/, "");
    const filename = `seed-${key}.jpg`;
    const [existing] = await db
      .select({ id: schema.media.id })
      .from(schema.media)
      .where(eq(schema.media.filename, filename));
    if (existing) {
      ids[key] = existing.id;
      continue;
    }
    const processed = await processImage(await readFile(path.join(IMG_DIR, file)));
    const c = credits[key];
    const [row] = await db
      .insert(schema.media)
      .values({
        filename,
        ...processed,
        alt: seedImageAlts[key] ?? "",
        credit: c ? `${c.author || "Unknown author"} / Wikimedia Commons` : null,
        creditUrl: c?.source ?? null,
        license: c?.license ?? null,
      })
      .returning({ id: schema.media.id });
    ids[key] = row.id;
  }
  console.log(`✓ Media: ${Object.keys(ids).length} images`);
  return ids;
}

async function main() {
  const img = await seedMedia();

  // Destinations
  for (const [i, d] of seedDestinations.entries()) {
    await db
      .insert(schema.destinations)
      .values({
        slug: d.slug,
        name: d.name,
        region: d.region,
        tagline: d.tagline,
        description: d.description,
        heroImageId: img[d.image] ?? null,
        sortOrder: i,
      })
      .onConflictDoNothing({ target: schema.destinations.slug });
  }
  const destRows = await db.select().from(schema.destinations);
  const destId = Object.fromEntries(destRows.map((d) => [d.slug, d.id]));
  console.log(`✓ Destinations: ${destRows.length}`);

  // Tours
  let createdTours = 0;
  for (const [i, t] of seedTours.entries()) {
    const [exists] = await db
      .select({ id: schema.tours.id })
      .from(schema.tours)
      .where(eq(schema.tours.slug, t.slug));
    if (exists) continue;
    const { destinations, hero, gallery, ...fields } = t;
    const [row] = await db
      .insert(schema.tours)
      .values({
        ...fields,
        dropOffs: t.dropOffs ?? "",
        transport: t.transport ?? "",
        accommodation: t.accommodation ?? "",
        importantNotes: t.importantNotes ?? "",
        faqs: t.faqs ?? [],
        cancellationPolicy: cancellationFor(t.category),
        heroImageId: img[hero] ?? null,
        gallery: gallery.filter((g) => img[g.image]).map((g) => ({ mediaId: img[g.image], caption: g.caption })),
        sortOrder: i,
        seoTitle: `${t.title} — ${t.durationLabel} tour | Sardar Travels`,
        seoDescription: t.summary.slice(0, 160),
      })
      .returning({ id: schema.tours.id });
    const links = destinations.filter((s) => destId[s]).map((s) => ({ tourId: row.id, destinationId: destId[s] }));
    if (links.length) await db.insert(schema.tourDestinations).values(links).onConflictDoNothing();
    createdTours++;
  }
  console.log(`✓ Tours: ${createdTours} created`);

  // FAQs, pages, bus routes — only when empty
  const [{ n: faqCount }] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.faqs);
  if (!faqCount) await db.insert(schema.faqs).values(seedFaqs.map((f, i) => ({ ...f, sortOrder: i })));
  for (const p of seedPages) await db.insert(schema.pages).values(p).onConflictDoNothing({ target: schema.pages.slug });
  const [{ n: busCount }] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.busRoutes);
  if (!busCount) await db.insert(schema.busRoutes).values(seedBusRoutes.map((b, i) => ({ ...b, sortOrder: i })));
  console.log("✓ FAQs, pages and bus routes");

  // Settings
  const settingsRows: { key: string; value: unknown }[] = [
    { key: "site", value: defaultSite },
    {
      key: "home",
      value: {
        ...defaultHome,
        hero: { ...defaultHome.hero, imageIds: seedHeroImages.map((k) => img[k]).filter(Boolean) },
        cta: { ...defaultHome.cta, imageId: img["kodai-view"] ?? null },
      },
    },
    {
      key: "services",
      value: {
        vehicle: { ...defaultServices.vehicle, imageId: img["karnataka-highway"] ?? null },
        hotel: { ...defaultServices.hotel, imageId: img["kodaikanal-lake"] ?? null },
        intercity: { ...defaultServices.intercity, imageId: img["mudumalai"] ?? null },
      },
    },
  ];
  for (const s of settingsRows) await db.insert(schema.settings).values(s).onConflictDoNothing();

  // Existing databases: give the newer services their default photos if none is set yet.
  const [svc] = await db.select().from(schema.settings).where(eq(schema.settings.key, "services"));
  if (svc) {
    const merged = mergeDefaults(defaultServices, svc.value);
    const want: Record<string, string> = { train: "train", flight: "flight", visa: "visa", international: "international" };
    for (const [k, imgKey] of Object.entries(want)) {
      const entry = merged[k as keyof typeof merged] as { imageId: string | null };
      if (!entry.imageId && img[imgKey]) entry.imageId = img[imgKey];
    }
    await db.update(schema.settings).set({ value: merged, updatedAt: new Date() }).where(eq(schema.settings.key, "services"));
  }
  console.log("✓ Settings");
}

await main();
await client.end();
