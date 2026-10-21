"use server";

import { randomInt } from "node:crypto";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSiteSettings } from "@/lib/data";
import { sendEnquiryEmails } from "@/lib/email";
import {
  STATUS_EXPLAINERS,
  STATUS_LABELS,
  TYPE_LABELS,
  enquirySchema,
} from "@/lib/enquiry-schema";
import { clientIpHash, rateLimit } from "@/lib/security";
import { formatPrice } from "@/lib/utils";

export type FormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeReference() {
  const d = new Date(Date.now() + 5.5 * 3600_000); // IST date in the reference
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, "");
  let tail = "";
  for (let i = 0; i < 4; i++) tail += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return `ST-${ymd}-${tail}`;
}

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export async function submitEnquiry(_prev: FormState, fd: FormData): Promise<FormState> {
  // Bot traps: hidden honeypot field and an implausibly fast submission.
  const started = Number(str(fd, "startedAt"));
  if (str(fd, "companyWebsite") || (started && Date.now() - started < 1500)) {
    return { ok: false, message: "We couldn't submit your enquiry. Please try again." };
  }

  const ipHash = await clientIpHash();
  if (!(await rateLimit(`enquiry:${ipHash}`, 8, 600))) {
    return { ok: false, message: "Too many enquiries from this connection. Please wait a few minutes and try again." };
  }

  const details: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    if (k.startsWith("d_") && typeof v === "string" && v.trim() && Object.keys(details).length < 25) {
      details[k.slice(2)] = v;
    }
  }

  const parsed = enquirySchema.safeParse({
    type: str(fd, "type"),
    tourId: str(fd, "tourId"),
    subject: str(fd, "subject"),
    name: str(fd, "name"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    preferredContact: str(fd, "preferredContact") || undefined,
    travelDate: str(fd, "travelDate"),
    returnDate: str(fd, "returnDate"),
    adults: str(fd, "adults") || undefined,
    children: str(fd, "children") || undefined,
    pickup: str(fd, "pickup"),
    destination: str(fd, "destination"),
    message: str(fd, "message"),
    details,
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] === "details" ? `d_${String(issue.path[1])}` : issue.path[0]);
      errors[key] ??= issue.message;
    }
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  const input = parsed.data;

  let subject = input.subject;
  if (input.tourId) {
    const [tour] = await db
      .select({ title: schema.tours.title })
      .from(schema.tours)
      .where(and(eq(schema.tours.id, input.tourId), eq(schema.tours.published, true)));
    if (!tour) return { ok: false, message: "That tour is no longer available. Please choose another." };
    subject = tour.title;
  }

  let reference = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    reference = makeReference();
    try {
      await db.transaction(async (tx) => {
        const [row] = await tx
          .insert(schema.enquiries)
          .values({
            reference,
            type: input.type,
            tourId: input.tourId ?? null,
            subject,
            name: input.name,
            email: input.email,
            phone: input.phone,
            preferredContact: input.preferredContact,
            travelDate: input.travelDate ?? null,
            returnDate: input.returnDate ?? null,
            adults: input.adults,
            children: input.children,
            pickup: input.pickup,
            destination: input.destination,
            message: input.message,
            details: input.details,
            ipHash,
          })
          .returning({ id: schema.enquiries.id });
        await tx.insert(schema.enquiryEvents).values({
          enquiryId: row.id,
          kind: "created",
          toStatus: "new",
          note: "Enquiry submitted online",
        });
      });
      break;
    } catch (err) {
      const code = (err as { code?: string; cause?: { code?: string } }).code ?? (err as { cause?: { code?: string } }).cause?.code;
      if (code === "23505" && attempt < 4) continue; // reference collision — retry
      console.error("[enquiry] insert failed", err);
      return { ok: false, message: "Something went wrong saving your enquiry. Please try again." };
    }
  }

  const site = await getSiteSettings();
  after(() =>
    sendEnquiryEmails({
      reference,
      name: input.name,
      email: input.email,
      phone: input.phone,
      subject,
      typeLabel: TYPE_LABELS[input.type],
      siteName: site.siteName,
    }),
  );

  redirect(`/enquiry/received?ref=${encodeURIComponent(reference)}`);
}

/* ------------------------------------------------------------------ */
/* Customer self-service tracking                                      */
/* ------------------------------------------------------------------ */

export type TrackState = FormState & {
  enquiry?: {
    reference: string;
    status: keyof typeof STATUS_LABELS;
    statusLabel: string;
    explainer: string;
    subject: string;
    typeLabel: string;
    travelDate: string | null;
    submittedOn: string;
    quote?: { amountText: string; summary: string; validUntil: string | null; sentOn: string };
    canAccept: boolean;
  };
  ref?: string;
  contact?: string;
};

const digits = (s: string) => s.replace(/\D/g, "");

async function findForCustomer(ref: string, contact: string) {
  const [e] = await db
    .select()
    .from(schema.enquiries)
    .where(eq(schema.enquiries.reference, ref.trim().toUpperCase()));
  if (!e) return null;
  const c = contact.trim().toLowerCase();
  const emailMatch = c.includes("@") && c === e.email.toLowerCase();
  const phoneMatch = digits(c).length >= 7 && digits(e.phone).slice(-10) === digits(c).slice(-10);
  return emailMatch || phoneMatch ? e : null;
}

async function toTrackState(e: typeof schema.enquiries.$inferSelect, ref: string, contact: string): Promise<TrackState> {
  const [quote] = await db
    .select()
    .from(schema.quotes)
    .where(eq(schema.quotes.enquiryId, e.id))
    .orderBy(desc(schema.quotes.createdAt))
    .limit(1);
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
  return {
    ok: true,
    ref,
    contact,
    enquiry: {
      reference: e.reference,
      status: e.status,
      statusLabel: STATUS_LABELS[e.status],
      explainer: STATUS_EXPLAINERS[e.status],
      subject: e.subject || TYPE_LABELS[e.type],
      typeLabel: TYPE_LABELS[e.type],
      travelDate: e.travelDate,
      submittedOn: fmt(e.createdAt),
      quote: quote
        ? {
            amountText: formatPrice(quote.amount, quote.currency),
            summary: quote.summary,
            validUntil: quote.validUntil,
            sentOn: fmt(quote.createdAt),
          }
        : undefined,
      canAccept: e.status === "quote_sent" && !!quote,
    },
  };
}

export async function trackEnquiry(_prev: TrackState, fd: FormData): Promise<TrackState> {
  const ref = str(fd, "ref").trim();
  const contact = str(fd, "contact").trim();
  if (!ref || !contact) {
    return { ok: false, message: "Enter your reference and the email or phone number you used.", ref, contact };
  }
  const ipHash = await clientIpHash();
  if (!(await rateLimit(`track:${ipHash}`, 20, 600))) {
    return { ok: false, message: "Too many attempts. Please wait a few minutes.", ref, contact };
  }
  const e = await findForCustomer(ref, contact);
  if (!e) {
    return { ok: false, message: "We couldn't find an enquiry matching those details. Check the reference and contact you used.", ref, contact };
  }
  return toTrackState(e, ref, contact);
}

export async function acceptQuote(_prev: TrackState, fd: FormData): Promise<TrackState> {
  const ref = str(fd, "ref");
  const contact = str(fd, "contact");
  const ipHash = await clientIpHash();
  if (!(await rateLimit(`track:${ipHash}`, 20, 600))) {
    return { ok: false, message: "Too many attempts. Please wait a few minutes.", ref, contact };
  }
  const e = await findForCustomer(ref, contact);
  if (!e) return { ok: false, message: "We couldn't verify this enquiry.", ref, contact };
  if (e.status !== "quote_sent") return toTrackState(e, ref, contact);

  await db.transaction(async (tx) => {
    await tx
      .update(schema.enquiries)
      .set({ status: "awaiting_confirmation", updatedAt: new Date() })
      .where(and(eq(schema.enquiries.id, e.id), eq(schema.enquiries.status, "quote_sent")));
    await tx.insert(schema.enquiryEvents).values({
      enquiryId: e.id,
      kind: "customer",
      fromStatus: "quote_sent",
      toStatus: "awaiting_confirmation",
      note: "Customer accepted the quote online",
    });
  });
  const updated = { ...e, status: "awaiting_confirmation" as const };
  const state = await toTrackState(updated, ref, contact);
  return { ...state, message: "Thank you — we've let our team know you'd like to go ahead." };
}
