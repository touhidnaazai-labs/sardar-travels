import "server-only";
import { asc, desc } from "drizzle-orm";
import { db, schema } from "@/db";
import type { MediaOption } from "@/components/admin/editors";

export async function getMediaOptions(): Promise<MediaOption[]> {
  const rows = await db
    .select({ id: schema.media.id, alt: schema.media.alt, width: schema.media.width, height: schema.media.height, updatedAt: schema.media.updatedAt })
    .from(schema.media)
    .orderBy(desc(schema.media.createdAt));
  return rows.map((r) => ({ id: r.id, alt: r.alt, width: r.width, height: r.height, src: `/media/${r.id}?v=${r.updatedAt.getTime()}` }));
}

export async function getAllDestinations() {
  return db.select({ id: schema.destinations.id, name: schema.destinations.name }).from(schema.destinations).orderBy(asc(schema.destinations.sortOrder));
}
