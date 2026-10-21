import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db, schema } from "@/db";
import { Badge, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth";
import { getMediaOptions } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Destinations" };

export default async function DestinationsAdmin() {
  await requireUser("admin");
  const [rows, media] = await Promise.all([db.select().from(schema.destinations).orderBy(asc(schema.destinations.sortOrder)), getMediaOptions()]);
  return (
    <>
      <PageHeader title="Destinations" actions={<Link href="/admin/destinations/new" className="btn btn-primary !py-2.5"><Plus className="size-4" /> New destination</Link>} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((d) => {
          const m = media.find((x) => x.id === d.heroImageId);
          return (
            <li key={d.id}>
              <Link href={`/admin/destinations/${d.id}`} className="block overflow-hidden rounded-2xl border border-line bg-white transition-colors hover:border-ink">
                <div className="relative aspect-[16/9] bg-paper">{m && <Image src={m.src} alt="" fill sizes="320px" className="object-cover" />}</div>
                <div className="flex items-center justify-between p-4">
                  <span><span className="font-semibold">{d.name}</span><span className="block text-xs text-muted">{d.region}</span></span>
                  <Badge tone={d.published ? "published" : "draft"}>{d.published ? "Published" : "Hidden"}</Badge>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
