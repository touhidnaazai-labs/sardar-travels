"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { EnquiryStatus } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { fail, isUuid, n, s, type ActionResult } from "@/lib/admin-action";
import { getSiteSettings } from "@/lib/data";
import { emailConfigured, sendQuoteEmail } from "@/lib/email";
import { STATUS_LABELS } from "@/lib/enquiry-schema";
import { formatPrice } from "@/lib/utils";

const STATUSES = Object.keys(STATUS_LABELS) as EnquiryStatus[];

async function load(id: string) {
  if (!isUuid(id)) return null;
  const [e] = await db.select().from(schema.enquiries).where(eq(schema.enquiries.id, id));
  return e ?? null;
}

export async function updateEnquiryStatus(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const e = await load(s(fd, "id"));
  if (!e) return fail("Enquiry not found.");
  const status = s(fd, "status") as EnquiryStatus;
  if (!STATUSES.includes(status)) return fail("Choose a valid status.");
  const note = s(fd, "note").slice(0, 2000);
  if (status === e.status && !note) return { ok: true, message: "No changes." };

  await db.transaction(async (tx) => {
    await tx.update(schema.enquiries).set({ status, updatedAt: new Date() }).where(eq(schema.enquiries.id, e.id));
    await tx.insert(schema.enquiryEvents).values({
      enquiryId: e.id,
      kind: status === e.status ? "note" : "status",
      fromStatus: status === e.status ? null : e.status,
      toStatus: status === e.status ? null : status,
      note,
      userId: user.id,
    });
  });
  revalidatePath("/admin", "layout");
  return { ok: true, message: status === e.status ? "Note added." : `Status changed to “${STATUS_LABELS[status]}”.` };
}

export async function saveInternalNotes(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireUser();
  const e = await load(s(fd, "id"));
  if (!e) return fail("Enquiry not found.");
  await db
    .update(schema.enquiries)
    .set({ internalNotes: s(fd, "internalNotes").slice(0, 10000), updatedAt: new Date() })
    .where(eq(schema.enquiries.id, e.id));
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Notes saved." };
}

export async function sendQuote(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const e = await load(s(fd, "id"));
  if (!e) return fail("Enquiry not found.");
  if (e.status === "cancelled" || e.status === "completed") return fail("Reopen this enquiry before sending a quote.");

  const amount = n(fd, "amount");
  const summary = s(fd, "summary");
  const validUntil = s(fd, "validUntil");
  const errors: Record<string, string> = {};
  if (amount === null || amount <= 0 || amount > 100_000_000) errors.amount = "Enter the quoted amount";
  if (summary.length < 10) errors.summary = "Describe what the quote includes";
  if (validUntil && !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) errors.validUntil = "Invalid date";
  if (Object.keys(errors).length) return fail("Please complete the quote.", errors);

  const currency = (s(fd, "currency") || "INR").toUpperCase().slice(0, 3);
  const [quote] = await db.transaction(async (tx) => {
    const q = await tx
      .insert(schema.quotes)
      .values({ enquiryId: e.id, amount: amount!, currency, summary: summary.slice(0, 5000), validUntil: validUntil || null, createdBy: user.id })
      .returning();
    await tx.update(schema.enquiries).set({ status: "quote_sent", updatedAt: new Date() }).where(eq(schema.enquiries.id, e.id));
    await tx.insert(schema.enquiryEvents).values({
      enquiryId: e.id,
      kind: "quote",
      fromStatus: e.status,
      toStatus: "quote_sent",
      note: `Quote ${formatPrice(amount!, currency)}`,
      userId: user.id,
    });
    return q;
  });

  let emailed = false;
  if (emailConfigured() && s(fd, "sendEmail") === "on") {
    const site = await getSiteSettings();
    emailed = await sendQuoteEmail({
      to: e.email,
      name: e.name,
      reference: e.reference,
      amountText: formatPrice(amount!, currency),
      summary,
      validUntil: validUntil || null,
      siteName: site.siteName,
    });
    if (emailed) await db.update(schema.quotes).set({ emailed: true }).where(eq(schema.quotes.id, quote.id));
  }
  revalidatePath("/admin", "layout");
  return {
    ok: true,
    message: emailed
      ? "Quote saved and emailed to the customer."
      : "Quote saved. The customer can view and accept it on the Track enquiry page — share it using the WhatsApp or email buttons.",
  };
}

export async function deleteEnquiry(id: string) {
  await requireUser("admin");
  if (!isUuid(id)) return;
  await db.delete(schema.enquiries).where(eq(schema.enquiries.id, id));
  revalidatePath("/admin", "layout");
  redirect("/admin/enquiries");
}
