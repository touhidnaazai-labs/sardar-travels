import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db, schema } from "@/db";
import { Badge, PageHeader, TableWrap } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Pages" };

export default async function PagesAdmin() {
  await requireUser("admin");
  const rows = await db.select().from(schema.pages).orderBy(asc(schema.pages.title));
  return (
    <>
      <PageHeader title="Pages" description="Information pages such as About, Booking terms and Privacy. Published pages live at /info/<url>." actions={<Link href="/admin/pages/new" className="btn btn-primary !py-2.5"><Plus className="size-4" /> New page</Link>} />
      <TableWrap>
        <thead><tr><th>Title</th><th>URL</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="relative">
              <td><Link href={`/admin/pages/${p.id}`} className="font-semibold after:absolute after:inset-0">{p.title}</Link></td>
              <td className="text-muted">/info/{p.slug}</td>
              <td><Badge tone={p.published ? "published" : "draft"}>{p.published ? "Published" : "Draft"}</Badge></td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </>
  );
}
