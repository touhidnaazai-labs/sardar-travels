"use server";

import { randomInt } from "node:crypto";
import { after } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSiteSettings } from "@/lib/data";
import { sendEnquiryEmails } from "@/lib/email";
import { TYPE_LABELS, enquirySchema, humanize, type EnquiryInput } from "@/lib/enquiry-schema";
import { clientIpHash, rateLimit } from "@/lib/security";

export type FormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Set on success: the reference and the ready-to-send WhatsApp message. */
  reference?: string;
  whatsappText?: string;
  whatsappNumber?: string;
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

  return {
    ok: true,
    reference,
    whatsappText: buildWhatsAppText({ reference, subject, input }),
    whatsappNumber: (site.contact.whatsapp || site.contact.phone).replace(/\D/g, ""),
  };
}

const fmtDate = (iso?: string) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

/** The enquiry as a WhatsApp message the customer sends to the business. */
function buildWhatsAppText({ reference, subject, input }: { reference: string; subject: string; input: EnquiryInput }) {
  const pax = `${input.adults} adult${input.adults === 1 ? "" : "s"}${input.children ? `, ${input.children} child${input.children === 1 ? "" : "ren"}` : ""}`;
  const lines = [
    `*${TYPE_LABELS[input.type]}*${subject ? `: ${subject}` : ""}`,
    `Name: ${input.name}`,
    `Phone: ${input.phone}`,
    input.email && `Email: ${input.email}`,
    input.pickup && `From: ${input.pickup}`,
    input.destination && `To: ${input.destination}`,
    input.travelDate && `Date: ${fmtDate(input.travelDate)}${input.returnDate ? ` to ${fmtDate(input.returnDate)}` : ""}`,
    `Travellers: ${pax}`,
    ...Object.entries(input.details).map(([k, v]) => `${humanize(k)}: ${v}`),
    input.message && `Message: ${input.message}`,
  ].filter(Boolean);
  return `Hello Sardar Travels, I'd like to enquire (ref ${reference}).\n\n${lines.join("\n")}`.slice(0, 1500);
}
