"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { contentChanged, fail, isUuid, s, type ActionResult } from "@/lib/admin-action";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES, processImage } from "@/lib/images";

export type UploadedMedia = { id: string; src: string; alt: string; width: number; height: number };

async function readImage(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose an image to upload.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(`“${file.name}” is larger than 12 MB.`);
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new Error(`“${file.name}” isn't a JPEG, PNG, WebP or AVIF image.`);
  try {
    return await processImage(Buffer.from(await file.arrayBuffer()));
  } catch {
    throw new Error(`“${file.name}” couldn't be read as an image.`);
  }
}

/** Upload one or more images. Returns the new records so pickers can select them immediately. */
export async function uploadMedia(fd: FormData): Promise<{ ok: boolean; message?: string; items: UploadedMedia[] }> {
  await requireUser("admin");
  const files = fd.getAll("files").slice(0, 20);
  const alt = s(fd, "alt");
  const items: UploadedMedia[] = [];
  try {
    for (const f of files) {
      const img = await readImage(f);
      const name = (f as File).name.slice(0, 200);
      const [row] = await db
        .insert(schema.media)
        .values({ filename: name, ...img, alt: alt || name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ") })
        .returning();
      items.push({ id: row.id, src: `/media/${row.id}?v=${row.updatedAt.getTime()}`, alt: row.alt, width: row.width, height: row.height });
    }
  } catch (err) {
    if (items.length) contentChanged();
    return { ok: false, message: (err as Error).message, items };
  }
  contentChanged();
  return { ok: true, message: `${items.length} image${items.length === 1 ? "" : "s"} uploaded.`, items };
}

export async function updateMedia(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireUser("admin");
  const id = s(fd, "id");
  if (!isUuid(id)) return fail("Image not found.");
  const patch: Partial<typeof schema.media.$inferInsert> = {
    alt: s(fd, "alt").slice(0, 300),
    credit: s(fd, "credit") || null,
    creditUrl: s(fd, "creditUrl") || null,
    license: s(fd, "license") || null,
  };
  const file = fd.get("file");
  if (file instanceof File && file.size > 0) {
    try {
      Object.assign(patch, await readImage(file), { filename: file.name.slice(0, 200) });
    } catch (err) {
      return fail((err as Error).message);
    }
  }
  // Bumping updatedAt changes the versioned URL so browsers and the image optimiser fetch the new file.
  await db.update(schema.media).set({ ...patch, updatedAt: new Date() }).where(eq(schema.media.id, id));
  contentChanged();
  return { ok: true, message: patch.data ? "Image replaced everywhere it's used." : "Image details saved." };
}

export async function deleteMedia(id: string) {
  await requireUser("admin");
  if (!isUuid(id)) return;
  await db.delete(schema.media).where(eq(schema.media.id, id));
  contentChanged();
}
