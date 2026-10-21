import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { AlertTriangle, Plus } from "lucide-react";
import { db, schema } from "@/db";
import { Badge, Empty, PageHeader, TableWrap } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS, durationText, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Tours" };

export default async function ToursAdmin() {
  await requireUser("admin");
  const [tours, media] = await Promise.all([
    db.select().from(schema.tours).orderBy(asc(schema.tours.sortOrder), asc(schema.tours.title)),
    db.select({ id: schema.media.id, updatedAt: schema.media.updatedAt }).from(schema.media),
  ]);
  const thumb = (id: string | null) => {
    const m = id && media.find((x) => x.id === id);
    return m ? `/media/${m.id}?v=${m.updatedAt.getTime()}` : null;
  };
  return (
    <>
      <PageHeader
        title="Tours"
        description="Edit itineraries, prices, availability and images. Tours marked “Needs verification” carry brochure details the business should confirm."
        actions={<Link href="/admin/tours/new" className="btn btn-primary !py-2.5"><Plus className="size-4" /> New tour</Link>}
      />
      {tours.length === 0 ? (
        <Empty>No tours yet. <Link className="underline" href="/admin/tours/new">Create the first one</Link>.</Empty>
      ) : (
        <TableWrap>
          <thead><tr><th>Tour</th><th>Category</th><th>Duration</th><th>Price</th><th>Status</th></tr></thead>
          <tbody>
            {tours.map((t) => {
              const src = thumb(t.heroImageId);
              return (
                <tr key={t.id} className="relative">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-paper">
                        {src && <Image src={src} alt="" fill sizes="64px" className="object-cover" />}
                      </div>
                      <div>
                        <Link href={`/admin/tours/${t.id}`} className="font-semibold after:absolute after:inset-0">{t.title}</Link>
                        <p className="text-xs text-muted">/tours/{t.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td>{CATEGORY_LABELS[t.category]}</td>
                  <td className="whitespace-nowrap">{durationText(t)}</td>
                  <td className="whitespace-nowrap">{t.priceFrom != null ? formatPrice(t.priceFrom, t.priceCurrency) : <span className="text-muted">On request</span>}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      <Badge tone={t.published ? "published" : "draft"}>{t.published ? "Published" : "Draft"}</Badge>
                      {t.featured && <Badge tone="quote_sent">Featured</Badge>}
                      {t.verificationNotes && <Badge tone="verify"><AlertTriangle className="mr-1 size-3" /> Needs verification</Badge>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
