import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import type { EnquiryStatus, EnquiryType } from "@/db/schema";
import { Badge, Empty, PageHeader, TableWrap } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth";
import { STATUS_LABELS, TYPE_LABELS } from "@/lib/enquiry-schema";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Enquiries" };

const PAGE_SIZE = 25;

export default async function EnquiriesPage(props: PageProps<"/admin/enquiries">) {
  await requireUser();
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const status = typeof sp.status === "string" && sp.status in STATUS_LABELS ? (sp.status as EnquiryStatus) : undefined;
  const type = typeof sp.type === "string" && sp.type in TYPE_LABELS ? (sp.type as EnquiryType) : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const where: SQL[] = [];
  if (status) where.push(eq(schema.enquiries.status, status));
  if (type) where.push(eq(schema.enquiries.type, type));
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
    where.push(
      or(
        ilike(schema.enquiries.reference, like),
        ilike(schema.enquiries.name, like),
        ilike(schema.enquiries.email, like),
        ilike(schema.enquiries.phone, like),
        ilike(schema.enquiries.subject, like),
        ilike(schema.enquiries.destination, like),
      )!,
    );
  }
  const cond = where.length ? and(...where) : undefined;

  const [rows, [{ total }], counts] = await Promise.all([
    db.select().from(schema.enquiries).where(cond).orderBy(desc(schema.enquiries.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(schema.enquiries).where(cond),
    db.select({ status: schema.enquiries.status, n: count() }).from(schema.enquiries).groupBy(schema.enquiries.status),
  ]);
  const countFor = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q: q || undefined, status, type, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, String(v));
    const str = p.toString();
    return `/admin/enquiries${str ? `?${str}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Enquiries" description="Every enquiry submitted on the website. Open one to update its status or send a quote." />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <Link href={qs({ status: undefined, page: undefined })} className={cn("rounded-full border px-3 py-1.5 text-sm whitespace-nowrap", !status ? "border-ink bg-ink text-ivory" : "border-line bg-white")}>
          All <span className="opacity-60">{counts.reduce((a, c) => a + c.n, 0)}</span>
        </Link>
        {Object.entries(STATUS_LABELS).map(([k, label]) => (
          <Link key={k} href={qs({ status: k, page: undefined })} className={cn("rounded-full border px-3 py-1.5 text-sm whitespace-nowrap", status === k ? "border-ink bg-ink text-ivory" : "border-line bg-white")}>
            {label} <span className="opacity-60">{countFor(k)}</span>
          </Link>
        ))}
      </div>

      <form className="mb-6 flex flex-col gap-3 sm:flex-row" role="search">
        {status && <input type="hidden" name="status" value={status} />}
        <label className="sr-only" htmlFor="q">Search enquiries</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search name, email, phone, reference, tour…" className="field flex-1" />
        <label className="sr-only" htmlFor="type">Type</label>
        <select id="type" name="type" defaultValue={type ?? ""} className="field sm:w-48">
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn btn-dark !py-2.5">Search</button>
      </form>

      {rows.length === 0 ? (
        <Empty>{q || status || type ? "No enquiries match these filters." : "No enquiries yet. They'll appear here as soon as customers submit them."}</Empty>
      ) : (
        <TableWrap>
          <thead>
            <tr><th>Reference</th><th>Customer</th><th>Enquiry</th><th>Travel date</th><th>Status</th><th>Received</th></tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="relative">
                <td className="font-mono text-xs">
                  <Link href={`/admin/enquiries/${e.id}`} className="font-semibold after:absolute after:inset-0">{e.reference}</Link>
                </td>
                <td><p className="font-semibold">{e.name}</p><p className="text-xs text-muted">{e.phone}</p></td>
                <td><p>{e.subject || e.destination || "—"}</p><p className="text-xs text-muted">{TYPE_LABELS[e.type]}</p></td>
                <td className="whitespace-nowrap">{e.travelDate ?? "—"}</td>
                <td><Badge tone={e.status}>{STATUS_LABELS[e.status]}</Badge></td>
                <td className="text-xs whitespace-nowrap text-muted">{e.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-between text-sm" aria-label="Pagination">
          <span className="text-muted">Page {page} of {pages} · {total} enquiries</span>
          <div className="flex gap-2">
            {page > 1 && <Link className="btn btn-ghost !py-2" href={qs({ page: String(page - 1) })}>Previous</Link>}
            {page < pages && <Link className="btn btn-ghost !py-2" href={qs({ page: String(page + 1) })}>Next</Link>}
          </div>
        </nav>
      )}
    </>
  );
}
