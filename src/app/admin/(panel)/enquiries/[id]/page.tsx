import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { db, schema } from "@/db";
import { AdminForm, SelectField, SubmitButton, TextArea, TextField } from "@/components/admin/form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { deleteEnquiry, saveInternalNotes, sendQuote, updateEnquiryStatus } from "@/app/actions/admin/enquiries";
import { requireUser } from "@/lib/auth";
import { emailConfigured } from "@/lib/email";
import { STATUS_LABELS, TYPE_LABELS, humanize } from "@/lib/enquiry-schema";
import { formatPrice, phoneDigits, siteUrl, whatsappLink } from "@/lib/utils";
import { isUuid } from "@/lib/admin-action";

export const metadata: Metadata = { title: "Enquiry" };

const fmt = (d: Date) => d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

export default async function EnquiryDetail(props: PageProps<"/admin/enquiries/[id]">) {
  const me = await requireUser();
  const { id } = await props.params;
  if (!isUuid(id)) notFound();
  const [e] = await db.select().from(schema.enquiries).where(eq(schema.enquiries.id, id));
  if (!e) notFound();

  const [events, quotes, users, tour] = await Promise.all([
    db.select().from(schema.enquiryEvents).where(eq(schema.enquiryEvents.enquiryId, id)).orderBy(asc(schema.enquiryEvents.createdAt)),
    db.select().from(schema.quotes).where(eq(schema.quotes.enquiryId, id)).orderBy(desc(schema.quotes.createdAt)),
    db.select({ id: schema.users.id, name: schema.users.name }).from(schema.users),
    e.tourId ? db.select({ slug: schema.tours.slug, title: schema.tours.title }).from(schema.tours).where(eq(schema.tours.id, e.tourId)).then((r) => r[0]) : undefined,
  ]);
  const userName = (uid: string | null) => users.find((u) => u.id === uid)?.name ?? "Customer";
  const latest = quotes[0];
  const trackUrl = siteUrl(`/enquiry/track?ref=${encodeURIComponent(e.reference)}`);
  const shareText = latest
    ? `Hello ${e.name}, here is your Sardar Travels quote for ${e.subject || TYPE_LABELS[e.type]} (ref ${e.reference}): ${formatPrice(latest.amount, latest.currency)}.\n\n${latest.summary}\n\nView and accept it here: ${trackUrl}`
    : `Hello ${e.name}, thank you for your enquiry (ref ${e.reference}) with Sardar Travels. You can track it here: ${trackUrl}`;

  const facts: [string, string | number | null | undefined][] = [
    ["Type", TYPE_LABELS[e.type]],
    ["Tour / subject", e.subject],
    [e.type === "hotel" ? "Check-in" : "Travel date", e.travelDate],
    [e.type === "hotel" ? "Check-out" : "Return date", e.returnDate],
    ["Adults", e.adults],
    ["Children", e.children || null],
    ["Pickup", e.pickup],
    ["Destination", e.destination],
    ...Object.entries(e.details).map(([k, v]) => [humanize(k), v] as [string, string]),
  ];

  return (
    <>
      <PageHeader
        back={{ href: "/admin/enquiries", label: "All enquiries" }}
        title={e.name}
        description={
          <span className="flex flex-wrap items-center gap-3">
            <span className="font-mono">{e.reference}</span>
            <Badge tone={e.status}>{STATUS_LABELS[e.status]}</Badge>
            <span>Received {fmt(e.createdAt)}</span>
          </span>
        }
        actions={me.role === "admin" ? <ConfirmButton action={deleteEnquiry.bind(null, e.id)} label="Delete enquiry" /> : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Trip requirements">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {facts.filter(([, v]) => v !== null && v !== undefined && v !== "").map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-bold tracking-wider text-muted uppercase">{k}</dt>
                  <dd className="mt-0.5 text-sm whitespace-pre-line">{String(v)}</dd>
                </div>
              ))}
            </dl>
            {tour && (
              <p className="mt-4 text-sm">
                <Link className="text-accent-strong underline" href={`/tours/${tour.slug}`} target="_blank">View tour page ↗</Link>
              </p>
            )}
            {e.message && (
              <div className="mt-6 rounded-xl bg-paper p-4">
                <p className="text-xs font-bold tracking-wider text-muted uppercase">Customer message</p>
                <p className="mt-1 text-sm whitespace-pre-line">{e.message}</p>
              </div>
            )}
          </Card>

          <Card
            title="Send a quotation"
            description={
              emailConfigured()
                ? "Saving a quote sets the status to “Quote sent”. The customer can accept it online from the tracking page."
                : "Email isn't configured (SMTP), so quotes are saved and shown on the customer's tracking page. Share them using the WhatsApp or email buttons."
            }
          >
            <AdminForm action={sendQuote} className="space-y-4" resetOnSuccess>
              <input type="hidden" name="id" value={e.id} />
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField name="amount" label="Amount" type="number" required className="sm:col-span-2" placeholder="e.g. 8500" />
                <SelectField name="currency" label="Currency" options={[{ value: "INR", label: "INR ₹" }, { value: "USD", label: "USD $" }, { value: "EUR", label: "EUR €" }]} />
              </div>
              <TextArea name="summary" label="What's included" required rows={5} placeholder={"Vehicle with driver for the full itinerary\nFuel, tolls and parking\nNot included: entry tickets, meals"} />
              <TextField name="validUntil" label="Valid until" type="date" className="sm:w-1/2" />
              {emailConfigured() && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="sendEmail" defaultChecked className="accent-[var(--accent)]" /> Email the quote to {e.email}
                </label>
              )}
              <SubmitButton>Save quote</SubmitButton>
            </AdminForm>

            {quotes.length > 0 && (
              <div className="mt-8 border-t border-line pt-6">
                <h3 className="mb-3 font-sans text-sm font-bold">Quote history</h3>
                <ul className="space-y-3">
                  {quotes.map((q, i) => (
                    <li key={q.id} className="rounded-xl border border-line p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-display text-xl">{formatPrice(q.amount, q.currency)}</p>
                        <p className="text-xs text-muted">
                          {i === 0 && <Badge tone="quote_sent">Latest</Badge>} {fmt(q.createdAt)} · {userName(q.createdBy)} {q.emailed && "· emailed"}
                        </p>
                      </div>
                      <p className="mt-2 text-sm whitespace-pre-line text-muted">{q.summary}</p>
                      {q.validUntil && <p className="mt-2 text-xs text-muted">Valid until {q.validUntil}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <Card title="Activity">
            <ol className="relative space-y-5 border-l border-line pl-6">
              {events.map((ev) => (
                <li key={ev.id} className="relative">
                  <span className="absolute top-1.5 -left-[1.72rem] size-2.5 rounded-full bg-accent ring-4 ring-white" />
                  <p className="text-sm">
                    {ev.toStatus && ev.fromStatus ? (
                      <>Status <strong>{STATUS_LABELS[ev.fromStatus]}</strong> → <strong>{STATUS_LABELS[ev.toStatus]}</strong></>
                    ) : ev.kind === "created" ? (
                      <strong>Enquiry received</strong>
                    ) : (
                      <strong className="capitalize">{ev.kind}</strong>
                    )}
                  </p>
                  {ev.note && <p className="mt-0.5 text-sm whitespace-pre-line text-muted">{ev.note}</p>}
                  <p className="mt-0.5 text-xs text-muted">{fmt(ev.createdAt)} · {ev.kind === "created" || ev.kind === "customer" ? "Customer" : userName(ev.userId)}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Customer">
            <p className="font-semibold">{e.name}</p>
            <p className="text-xs text-muted">Prefers {e.preferredContact}</p>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <a className="flex items-center gap-2 hover:text-accent-strong" href={`tel:${phoneDigits(e.phone)}`}><Phone className="size-4" /> {e.phone}</a>
              <a className="flex items-center gap-2 break-all hover:text-accent-strong" href={`mailto:${e.email}`}><Mail className="size-4 shrink-0" /> {e.email}</a>
            </div>
            <div className="mt-5 grid gap-2">
              <a className="btn btn-dark !py-2 text-xs" target="_blank" rel="noopener noreferrer" href={whatsappLink(e.phone, shareText)}>
                <MessageCircle className="size-4" /> {latest ? "Send quote on WhatsApp" : "Message on WhatsApp"}
              </a>
              <a className="btn btn-ghost !py-2 text-xs" href={`mailto:${e.email}?subject=${encodeURIComponent(`Your Sardar Travels ${latest ? "quote" : "enquiry"} — ${e.reference}`)}&body=${encodeURIComponent(shareText)}`}>
                <Mail className="size-4" /> {latest ? "Email quote" : "Email customer"}
              </a>
            </div>
          </Card>

          <Card title="Update status">
            <AdminForm action={updateEnquiryStatus} className="space-y-4" resetOnSuccess>
              <input type="hidden" name="id" value={e.id} />
              <SelectField name="status" label="Status" defaultValue={e.status} options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))} />
              <TextArea name="note" label="Note (optional)" rows={3} placeholder="e.g. Called customer, confirmed pickup at 7 AM" />
              <SubmitButton variant="dark">Update</SubmitButton>
            </AdminForm>
            <p className="mt-3 text-xs text-muted">An enquiry only becomes a booking when you set it to “Confirmed”.</p>
          </Card>

          <Card title="Internal notes" description="Visible to staff only.">
            <AdminForm action={saveInternalNotes} className="space-y-3">
              <input type="hidden" name="id" value={e.id} />
              <TextArea name="internalNotes" label="Notes" defaultValue={e.internalNotes} rows={6} />
              <SubmitButton variant="ghost">Save notes</SubmitButton>
            </AdminForm>
          </Card>
        </div>
      </div>
    </>
  );
}
