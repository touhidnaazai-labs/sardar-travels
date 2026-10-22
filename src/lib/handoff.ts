/**
 * After an enquiry is saved, remember the WhatsApp message in this tab only
 * (never in the URL, so personal details don't end up in logs) and open the
 * confirmation page, which hands it to WhatsApp.
 */
export const HANDOFF_KEY = "sardar:wa";

export type Handoff = { ref: string; text: string; number: string };

/** Stores the message for the confirmation page and returns that page's URL. */
export function storeHandoff(s: { reference?: string; whatsappText?: string; whatsappNumber?: string }) {
  if (!s.reference) return null;
  try {
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ ref: s.reference, text: s.whatsappText ?? "", number: s.whatsappNumber ?? "" } satisfies Handoff));
  } catch {
    /* storage blocked: the confirmation page falls back to a plain WhatsApp link */
  }
  return `/enquiry/received?ref=${encodeURIComponent(s.reference)}`;
}
