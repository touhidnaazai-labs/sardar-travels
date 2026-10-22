import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null | undefined;

export function emailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);
}

function getTransport() {
  if (transporter !== undefined) return transporter;
  transporter = emailConfigured()
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
      })
    : null;
  return transporter;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(siteName: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f7f2e8;font-family:Helvetica,Arial,sans-serif;color:#0f1b2d">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:#0f1b2d;color:#f7f2e8;padding:24px 32px;font-family:Georgia,serif;font-size:22px">${esc(siteName)}</td></tr>
<tr><td style="padding:32px;font-size:15px;line-height:1.6">${body}</td></tr>
</table></td></tr></table></body></html>`;
}

/** Sends an email if SMTP is configured. Never throws — failures are logged. */
export async function sendMail(opts: { to: string | string[]; subject: string; html: string; text: string; replyTo?: string }) {
  const t = getTransport();
  if (!t) return false;
  try {
    await t.sendMail({ from: process.env.MAIL_FROM, ...opts });
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

export async function sendEnquiryEmails(e: {
  reference: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  typeLabel: string;
  siteName: string;
}) {
  if (e.email) await sendMail({
    to: e.email,
    subject: `We've received your enquiry — ${e.reference}`,
    text: `Hello ${e.name},\n\nThank you for your enquiry (${e.subject || e.typeLabel}). Your reference is ${e.reference}.\n\nThis is not yet a confirmed booking. We'll be in touch with a quote.\n\n${e.siteName}`,
    html: layout(
      e.siteName,
      `<p>Hello ${esc(e.name)},</p><p>Thank you for your enquiry about <strong>${esc(e.subject || e.typeLabel)}</strong>.</p>
<p style="font-size:13px;letter-spacing:.15em;text-transform:uppercase;color:#8a6a2f;margin:24px 0 4px">Your reference</p>
<p style="font-family:Georgia,serif;font-size:28px;margin:0 0 24px">${esc(e.reference)}</p>
<p>This is <strong>not yet a confirmed booking</strong>. We'll be in touch with a quote.</p>
`,
    ),
  });
  const staff = (process.env.STAFF_NOTIFY_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (staff.length) {
    await sendMail({
      to: staff,
      replyTo: e.email || undefined,
      subject: `New ${e.typeLabel.toLowerCase()} enquiry ${e.reference}: ${e.subject || e.name}`,
      text: `${e.name} (${[e.email, e.phone].filter(Boolean).join(", ")}) sent an enquiry: ${e.subject || e.typeLabel}.`,
      html: layout(
        e.siteName,
        `<p><strong>${esc(e.name)}</strong> sent a ${esc(e.typeLabel.toLowerCase())} enquiry: ${esc(e.subject || "—")}</p>
<p>${esc(e.email)} · ${esc(e.phone)}</p><p>Ref ${esc(e.reference)}</p>`,
      ),
    });
  }
}
