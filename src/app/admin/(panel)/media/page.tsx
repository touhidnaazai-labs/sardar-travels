import type { Metadata } from "next";
import Image from "next/image";
import { desc, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { AdminForm, SubmitButton, TextField } from "@/components/admin/form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { MediaUploader } from "@/components/admin/media-uploader";
import { PageHeader } from "@/components/admin/ui";
import { deleteMedia, updateMedia } from "@/app/actions/admin/media";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Media library" };

export default async function MediaAdmin() {
  await requireUser("admin");
  const rows = await db
    .select({
      id: schema.media.id, filename: schema.media.filename, alt: schema.media.alt, width: schema.media.width, height: schema.media.height,
      bytes: schema.media.bytes, credit: schema.media.credit, creditUrl: schema.media.creditUrl, license: schema.media.license, updatedAt: schema.media.updatedAt,
    })
    .from(schema.media)
    .orderBy(desc(schema.media.createdAt), sql`filename`);
  return (
    <>
      <PageHeader title="Media library" description="Upload, describe and replace images. Replacing an image updates it everywhere it's used. Add a description (alt text) for accessibility and SEO." />
      <MediaUploader />
      <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((m) => (
          <li key={m.id} className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="relative aspect-[16/10] bg-paper">
              <Image src={`/media/${m.id}?v=${m.updatedAt.getTime()}`} alt={m.alt} fill sizes="400px" className="object-cover" />
            </div>
            <AdminForm action={updateMedia} resetOnSuccess className="space-y-3 p-4">
              <input type="hidden" name="id" value={m.id} />
              <p className="truncate text-xs text-muted">{m.filename} · {m.width}×{m.height} · {Math.round(m.bytes / 1024)} KB</p>
              <TextField name="alt" label="Description (alt text)" defaultValue={m.alt} />
              <details>
                <summary className="cursor-pointer text-xs font-semibold text-muted">Credit & licence</summary>
                <div className="mt-3 space-y-3">
                  <TextField name="credit" label="Credit" defaultValue={m.credit} />
                  <TextField name="creditUrl" label="Source URL" defaultValue={m.creditUrl} />
                  <TextField name="license" label="Licence" defaultValue={m.license} />
                </div>
              </details>
              <div>
                <label className="field-label" htmlFor={`file-${m.id}`}>Replace image</label>
                <input id={`file-${m.id}`} type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-xs file:mr-3 file:rounded-full file:border-0 file:bg-paper file:px-3 file:py-1.5 file:text-xs file:font-semibold" />
              </div>
              <div className="flex items-center justify-between">
                <ConfirmButton action={deleteMedia.bind(null, m.id)} />
                <SubmitButton variant="dark">Save</SubmitButton>
              </div>
            </AdminForm>
          </li>
        ))}
      </ul>
    </>
  );
}
