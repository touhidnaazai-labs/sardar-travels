"use server";

import bcrypt from "bcryptjs";
import { and, count, eq, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser, revokeUserSessions } from "@/lib/auth";
import { b, contentChanged, fail, isUuid, json, lines, s, type ActionResult } from "@/lib/admin-action";
import { getHomeSettings, getServicesSettings, getSiteSettings } from "@/lib/data";
import { HOME_SECTION_LABELS, normaliseSections, type HomeSectionKey, type HomeSettings, type ServicesSettings, type SiteSettings } from "@/lib/settings";

async function put(key: string, value: unknown) {
  await db
    .insert(schema.settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
  contentChanged();
}

const hex = (v: string, fallback: string) => (/^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback);
const url = (v: string) => (!v || /^https?:\/\//i.test(v) ? v : `https://${v}`);
const mediaId = (v: string) => (isUuid(v) ? v : null);

export async function saveSiteSettings(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireUser("admin");
  const cur = await getSiteSettings();
  const email = s(fd, "email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please fix the highlighted fields.", { email: "Enter a valid email" });
  const next: SiteSettings = {
    siteName: s(fd, "siteName") || cur.siteName,
    tagline: s(fd, "tagline"),
    logoMediaId: mediaId(s(fd, "logoMediaId")),
    colors: {
      ink: hex(s(fd, "colorInk"), cur.colors.ink),
      ivory: hex(s(fd, "colorIvory"), cur.colors.ivory),
      accent: hex(s(fd, "colorAccent"), cur.colors.accent),
      forest: hex(s(fd, "colorForest"), cur.colors.forest),
    },
    contact: {
      phone: s(fd, "phone"),
      whatsapp: s(fd, "whatsapp"),
      email,
      address: s(fd, "address"),
      hours: s(fd, "hours"),
      mapUrl: url(s(fd, "mapUrl")),
    },
    social: { instagram: url(s(fd, "instagram")), facebook: url(s(fd, "facebook")), youtube: url(s(fd, "youtube")) },
    seo: {
      defaultTitle: s(fd, "seoTitle") || cur.seo.defaultTitle,
      defaultDescription: s(fd, "seoDescription") || cur.seo.defaultDescription,
      ogImageId: mediaId(s(fd, "ogImageId")),
    },
    announcement: s(fd, "announcement").slice(0, 200),
  };
  await put("site", next);
  return { ok: true, message: "Site settings saved." };
}

export async function saveHomeSettings(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireUser("admin");
  const cur = await getHomeSettings();
  const order = json<HomeSectionKey[]>(fd, "sectionOrder", cur.sections.map((x) => x.key)).filter((k) => k in HOME_SECTION_LABELS);
  const enabled = new Set(fd.getAll("sectionEnabled").map(String));
  const block = (k: "experiences" | "destinations" | "tours" | "services") => ({
    eyebrow: s(fd, `${k}.eyebrow`),
    heading: s(fd, `${k}.heading`) || cur[k].heading,
    intro: s(fd, `${k}.intro`),
  });
  const points = json<{ title: string; body: string }[]>(fd, "why.points", cur.why.points)
    .filter((p) => p.title?.trim())
    .slice(0, 8)
    .map((p) => ({ title: p.title.trim().slice(0, 120), body: (p.body ?? "").trim().slice(0, 500) }));
  const next: HomeSettings = {
    sections: normaliseSections(order.map((key) => ({ key, enabled: enabled.has(key) }))),
    hero: {
      eyebrow: s(fd, "hero.eyebrow"),
      headline: s(fd, "hero.headline") || cur.hero.headline,
      subhead: s(fd, "hero.subhead"),
      imageIds: json<string[]>(fd, "hero.imageIds", cur.hero.imageIds).filter(isUuid).slice(0, 8),
    },
    experiences: block("experiences"),
    destinations: block("destinations"),
    tours: block("tours"),
    services: block("services"),
    why: { eyebrow: s(fd, "why.eyebrow"), heading: s(fd, "why.heading") || cur.why.heading, points },
    testimonials: { eyebrow: s(fd, "testimonials.eyebrow"), heading: s(fd, "testimonials.heading") || cur.testimonials.heading },
    faqs: { eyebrow: s(fd, "faqs.eyebrow"), heading: s(fd, "faqs.heading") || cur.faqs.heading },
    cta: { heading: s(fd, "cta.heading") || cur.cta.heading, body: s(fd, "cta.body"), imageId: mediaId(s(fd, "cta.imageId")) },
  };
  await put("home", next);
  return { ok: true, message: "Homepage updated." };
}

/** Shared fields of the enquiry-based travel services. */
function booking(fd: FormData, key: string, cur: { heading: string }) {
  return {
    enabled: b(fd, `${key}.enabled`),
    heading: s(fd, `${key}.heading`) || cur.heading,
    intro: s(fd, `${key}.intro`),
    imageId: mediaId(s(fd, `${key}.imageId`)),
  };
}

export async function saveServicesSettings(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireUser("admin");
  const cur = await getServicesSettings();
  const next: ServicesSettings = {
    vehicle: {
      enabled: b(fd, "vehicle.enabled"),
      heading: s(fd, "vehicle.heading") || cur.vehicle.heading,
      intro: s(fd, "vehicle.intro"),
      serviceAreas: lines(fd, "vehicle.serviceAreas"),
      categoryOptions: lines(fd, "vehicle.categoryOptions"),
      imageId: mediaId(s(fd, "vehicle.imageId")),
    },
    hotel: {
      enabled: b(fd, "hotel.enabled"),
      heading: s(fd, "hotel.heading") || cur.hotel.heading,
      intro: s(fd, "hotel.intro"),
      destinations: lines(fd, "hotel.destinations"),
      budgetOptions: lines(fd, "hotel.budgetOptions"),
      imageId: mediaId(s(fd, "hotel.imageId")),
    },
    intercity: {
      enabled: b(fd, "intercity.enabled"),
      heading: s(fd, "intercity.heading") || cur.intercity.heading,
      intro: s(fd, "intercity.intro"),
      disclaimer: s(fd, "intercity.disclaimer") || cur.intercity.disclaimer,
      imageId: mediaId(s(fd, "intercity.imageId")),
    },
    train: { ...booking(fd, "train", cur.train), classOptions: lines(fd, "train.classOptions") },
    flight: { ...booking(fd, "flight", cur.flight), cabinOptions: lines(fd, "flight.cabinOptions") },
    visa: { ...booking(fd, "visa", cur.visa), visaTypes: lines(fd, "visa.visaTypes") },
    international: booking(fd, "international", cur.international),
  };
  if (next.hotel.enabled && !next.hotel.destinations.length) return fail("Add at least one hotel destination.", { "hotel.destinations": "Required" });
  await put("services", next);
  return { ok: true, message: "Services updated." };
}

/* ---------------- Users ---------------- */

export async function saveUser(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const me = await requireUser("admin");
  const id = s(fd, "id");
  const email = s(fd, "email").toLowerCase();
  const name = s(fd, "name");
  const role = s(fd, "role") === "admin" ? "admin" : "staff";
  const active = b(fd, "active");
  const password = String(fd.get("password") ?? "");
  const errors: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email";
  if (name.length < 2) errors.name = "Name is required";
  if ((!id && password.length < 10) || (id && password && password.length < 10)) errors.password = "At least 10 characters";
  const [clash] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(id ? and(eq(schema.users.email, email), ne(schema.users.id, id)) : eq(schema.users.email, email));
  if (clash) errors.email = "Already in use";
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields.", errors);

  if (id && isUuid(id)) {
    if (id === me.id && (role !== "admin" || !active)) return fail("You can't remove your own admin access.");
    if (role !== "admin" || !active) {
      const [{ admins }] = await db
        .select({ admins: count() })
        .from(schema.users)
        .where(and(eq(schema.users.role, "admin"), eq(schema.users.active, true), ne(schema.users.id, id)));
      if (!admins) return fail("At least one active administrator is required.");
    }
    await db
      .update(schema.users)
      .set({ email, name, role, active, ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}) })
      .where(eq(schema.users.id, id));
    if (!active || password) await revokeUserSessions(id);
    contentChanged();
    return { ok: true, message: "Team member updated." };
  }
  await db.insert(schema.users).values({ email, name, role, active: true, passwordHash: await bcrypt.hash(password, 12) });
  contentChanged();
  return { ok: true, message: `Account created for ${email}. Share the password with them securely.` };
}
