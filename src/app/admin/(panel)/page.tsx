import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, gte, sql } from "drizzle-orm";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { db, schema } from "@/db";
import { Badge, Card, Empty, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth";
import { emailConfigured } from "@/lib/email";
import { STATUS_LABELS, TYPE_LABELS } from "@/lib/enquiry-schema";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

export default async function Overview(props: PageProps<"/admin">) {
  const me = await requireUser();
  const sp = await props.searchParams;
  const [byStatus, [{ week }], recent, tours, site] = await Promise.all([
    db.select({ status: schema.enquiries.status, n: count() }).from(schema.enquiries).groupBy(schema.enquiries.status),
    db.select({ week: count() }).from(schema.enquiries).where(gte(schema.enquiries.createdAt, sql`now() - interval '7 days'`)),
    db.select().from(schema.enquiries).orderBy(desc(schema.enquiries.createdAt)).limit(8),
    db.select({ published: schema.tours.published, verificationNotes: schema.tours.verificationNotes }).from(schema.tours),
    getSiteSettings(),
  ]);
  const n = (s: string) => byStatus.find((b) => b.status === s)?.n ?? 0;
  const unverified = tours.filter((t) => t.verificationNotes).length;
  const setup = [
    !site.contact.phone && !site.contact.email && { label: "Add your phone number and email so customers can reach you", href: "/admin/settings" },
    !emailConfigured() && { label: "Email (SMTP) isn't configured — enquiry acknowledgements and quotes won't be emailed automatically", href: null },
    unverified > 0 && { label: `${unverified} tour${unverified > 1 ? "s" : ""} contain brochure details that need confirming`, href: "/admin/tours" },
  ].filter(Boolean) as { label: string; href: string | null }[];

  const stats = [
    { label: "New", value: n("new"), href: "/admin/enquiries?status=new" },
    { label: "Reviewing", value: n("reviewing"), href: "/admin/enquiries?status=reviewing" },
    { label: "Quote sent", value: n("quote_sent"), href: "/admin/enquiries?status=quote_sent" },
    { label: "Awaiting confirmation", value: n("awaiting_confirmation"), href: "/admin/enquiries?status=awaiting_confirmation" },
    { label: "Confirmed", value: n("confirmed"), href: "/admin/enquiries?status=confirmed" },
    { label: "Last 7 days", value: week, href: "/admin/enquiries" },
  ];

  return (
    <>
      <PageHeader title={`Hello, ${me.name.split(" ")[0]}`} description="Here's what's happening with enquiries and the website." />
      {sp.denied && <p className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">That section is available to administrators only.</p>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-line bg-white p-5 transition-colors hover:border-ink">
            <p className="font-display text-4xl font-light">{s.value}</p>
            <p className="mt-1 text-xs font-semibold text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      {me.role === "admin" && setup.length > 0 && (
        <Card title="Before you go live" className="mt-6">
          <ul className="space-y-2 text-sm">
            {setup.map((item) => (
              <li key={item.label} className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                {item.href ? <Link href={item.href} className="underline underline-offset-2">{item.label}</Link> : <span>{item.label} (see DEPLOYMENT.md).</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Latest enquiries" className="mt-6" actions={<Link href="/admin/enquiries" className="flex items-center gap-1 text-sm font-semibold text-accent-strong">All <ArrowRight className="size-4" /></Link>}>
        {recent.length === 0 ? (
          <Empty>No enquiries yet.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/enquiries/${e.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-paper/60">
                  <span>
                    <span className="font-semibold">{e.name}</span>
                    <span className="text-sm text-muted"> · {e.subject || TYPE_LABELS[e.type]}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted">{e.reference}</span>
                    <Badge tone={e.status}>{STATUS_LABELS[e.status]}</Badge>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
