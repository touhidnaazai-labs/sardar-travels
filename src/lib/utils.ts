export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}

export function formatPrice(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const CATEGORY_LABELS: Record<string, string> = {
  sightseeing: "City sightseeing",
  "hill-station": "Hill stations",
  heritage: "Heritage & architecture",
  pilgrimage: "Pilgrimage",
  "wildlife-nature": "Wildlife & nature",
  honeymoon: "Honeymoon",
  waterfalls: "Waterfalls",
  "national-package": "National packages",
  "international-package": "International packages",
};

export const STYLE_LABELS: Record<string, string> = {
  private: "Private tour",
  group: "Group tour",
  "private-or-group": "Private or group",
  unconfirmed: "",
};

export function durationText(t: { durationLabel: string; durationDays: number; durationNights: number }) {
  if (t.durationLabel) return t.durationLabel;
  const d = `${t.durationDays} day${t.durationDays === 1 ? "" : "s"}`;
  return t.durationNights ? `${d} / ${t.durationNights} night${t.durationNights === 1 ? "" : "s"}` : d;
}

/** Digits only, for tel: and wa.me links. */
export function phoneDigits(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export function whatsappLink(number: string, text?: string) {
  const digits = number.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
