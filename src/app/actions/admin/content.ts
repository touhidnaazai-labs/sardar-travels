"use server";

import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { b, contentChanged, fail, isUuid, lines, n, nullable, s, type ActionResult } from "@/lib/admin-action";
import { slugify } from "@/lib/utils";

/* ---------------- Destinations ---------------- */

export async function saveDestination(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireUser("admin");
  const id = s(fd, "id");
  const name = s(fd, "name");
  const slug = slugify(s(fd, "slug") || name);
  if (name.length < 2) return fail("Please fix the highlighted fields.", { name: "Name is required" });
  const [clash] = await db
    .select({ id: schema.destinations.id })
    .from(schema.destinations)
    .where(id ? and(eq(schema.destinations.slug, slug), ne(schema.destinations.id, id)) : eq(schema.destinations.slug, slug));
  if (clash) return fail("Please fix the highlighted fields.", { slug: "Another destination uses this URL" });
  const hero = s(fd, "heroImageId");
  const values = {
    name,
    slug,
    region: s(fd, "region"),
    tagline: s(fd, "tagline"),
    description: s(fd, "description"),
    heroImageId: isUuid(hero) ? hero : null,
    published: b(fd, "published"),
    sortOrder: n(fd, "sortOrder") ?? 0,
    seoTitle: nullable(s(fd, "seoTitle")),
    seoDescription: nullable(s(fd, "seoDescription")),
    updatedAt: new Date(),
  };
  if (id && isUuid(id)) {
    await db.update(schema.destinations).set(values).where(eq(schema.destinations.id, id));
  } else {
    const [row] = await db.insert(schema.destinations).values(values).returning({ id: schema.destinations.id });
    contentChanged();
    redirect(`/admin/destinations/${row.id}`);
  }
  contentChanged();
  return { ok: true, message: "Destination saved." };
}

export async function deleteDestination(id: string) {
  await requireUser("admin");
  if (isUuid(id)) await db.delete(schema.destinations).where(eq(schema.destinations.id, id));
  contentChanged();
  redirect("/admin/destinations");
}

/* ---------------- FAQs ---------------- */

export async function saveFaq(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireUser("admin");
  const id = s(fd, "id");
  const question = s(fd, "question");
  const answer = s(fd, "answer");
  const errors: Record<string, string> = {};
  if (question.length < 3) errors.question = "Question is required";
  if (answer.length < 3) errors.answer = "Answer is required";
  if (Object.keys(errors).length) return fail("Please complete the FAQ.", errors);
  const values = {
    question,
    answer,
    topic: s(fd, "topic") || "general",
    showOnHome: b(fd, "showOnHome"),
    published: b(fd, "published"),
    sortOrder: n(fd, "sortOrder") ?? 0,
  };
  if (id && isUuid(id)) await db.update(schema.faqs).set(values).where(eq(schema.faqs.id, id));
  else await db.insert(schema.faqs).values(values);
  contentChanged();
  return { ok: true, message: id ? "FAQ saved." : "FAQ added." };
}

export async function deleteFaq(id: string) {
  await requireUser("admin");
  if (isUuid(id)) await db.delete(schema.faqs).where(eq(schema.faqs.id, id));
  contentChanged();
}

/* ---------------- Testimonials ---------------- */

export async function saveTestimonial(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireUser("admin");
  const id = s(fd, "id");
  const name = s(fd, "name");
  const quote = s(fd, "quote");
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Name is required";
  if (quote.length < 10) errors.quote = "Add the customer's words";
  if (Object.keys(errors).length) return fail("Please complete the testimonial.", errors);
  const verified = b(fd, "verified");
  const published = b(fd, "published");
  if (published && !verified) {
    return fail("Only verified testimonials can be published. Confirm the review is genuine and tick “Verified”.", { verified: "Required to publish" });
  }
  const tourId = s(fd, "tourId");
  const values = {
    name,
    quote,
    location: s(fd, "location"),
    travelledOn: s(fd, "travelledOn"),
    tourId: isUuid(tourId) ? tourId : null,
    verified,
    published,
    sortOrder: n(fd, "sortOrder") ?? 0,
  };
  if (id && isUuid(id)) await db.update(schema.testimonials).set(values).where(eq(schema.testimonials.id, id));
  else await db.insert(schema.testimonials).values(values);
  contentChanged();
  return { ok: true, message: "Testimonial saved." };
}

export async function deleteTestimonial(id: string) {
  await requireUser("admin");
  if (isUuid(id)) await db.delete(schema.testimonials).where(eq(schema.testimonials.id, id));
  contentChanged();
}

/* ---------------- Pages ---------------- */

const RESERVED = new Set(["admin", "tours", "destinations", "plan", "contact", "faq", "enquiry", "media", "credits"]);

export async function savePage(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireUser("admin");
  const id = s(fd, "id");
  const title = s(fd, "title");
  const slug = slugify(s(fd, "slug") || title);
  const errors: Record<string, string> = {};
  if (title.length < 2) errors.title = "Title is required";
  if (!slug || RESERVED.has(slug)) errors.slug = "Choose a different URL";
  const [clash] = await db
    .select({ id: schema.pages.id })
    .from(schema.pages)
    .where(id ? and(eq(schema.pages.slug, slug), ne(schema.pages.id, id)) : eq(schema.pages.slug, slug));
  if (clash) errors.slug = "Another page uses this URL";
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields.", errors);
  const values = {
    title,
    slug,
    intro: s(fd, "intro"),
    body: s(fd, "body"),
    seoTitle: nullable(s(fd, "seoTitle")),
    seoDescription: nullable(s(fd, "seoDescription")),
    showInFooter: b(fd, "showInFooter"),
    published: b(fd, "published"),
    updatedAt: new Date(),
  };
  if (id && isUuid(id)) {
    await db.update(schema.pages).set(values).where(eq(schema.pages.id, id));
  } else {
    const [row] = await db.insert(schema.pages).values(values).returning({ id: schema.pages.id });
    contentChanged();
    redirect(`/admin/pages/${row.id}`);
  }
  contentChanged();
  return { ok: true, message: values.published ? "Page saved and published." : "Page saved as draft." };
}

export async function deletePage(id: string) {
  await requireUser("admin");
  if (isUuid(id)) await db.delete(schema.pages).where(eq(schema.pages.id, id));
  contentChanged();
  redirect("/admin/pages");
}

/* ---------------- Vehicles ---------------- */

export async function saveVehicle(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireUser("admin");
  const id = s(fd, "id");
  const name = s(fd, "name");
  if (name.length < 2) return fail("Please fix the highlighted fields.", { name: "Name is required" });
  const verified = b(fd, "verified");
  const published = b(fd, "published");
  if (published && !verified) return fail("Only vehicles the business has verified can be published.", { verified: "Required to publish" });
  const img = s(fd, "imageId");
  const values = {
    name,
    category: s(fd, "category"),
    seats: s(fd, "seats"),
    description: s(fd, "description"),
    features: lines(fd, "features"),
    imageId: isUuid(img) ? img : null,
    verified,
    published,
    sortOrder: n(fd, "sortOrder") ?? 0,
  };
  if (id && isUuid(id)) await db.update(schema.vehicles).set(values).where(eq(schema.vehicles.id, id));
  else await db.insert(schema.vehicles).values(values);
  contentChanged();
  return { ok: true, message: "Vehicle saved." };
}

export async function deleteVehicle(id: string) {
  await requireUser("admin");
  if (isUuid(id)) await db.delete(schema.vehicles).where(eq(schema.vehicles.id, id));
  contentChanged();
}

/* ---------------- Bus routes ---------------- */

export async function saveBusRoute(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireUser("admin");
  const id = s(fd, "id");
  const operator = s(fd, "operator");
  const destination = s(fd, "destination");
  const errors: Record<string, string> = {};
  if (!operator) errors.operator = "Operator is required";
  if (!destination) errors.destination = "Destination is required";
  if (Object.keys(errors).length) return fail("Please complete the route.", errors);
  const values = { operator, destination, origin: s(fd, "origin"), serviceNote: s(fd, "serviceNote"), published: b(fd, "published"), sortOrder: n(fd, "sortOrder") ?? 0 };
  if (id && isUuid(id)) await db.update(schema.busRoutes).set(values).where(eq(schema.busRoutes.id, id));
  else await db.insert(schema.busRoutes).values(values);
  contentChanged();
  return { ok: true, message: "Route saved." };
}

export async function deleteBusRoute(id: string) {
  await requireUser("admin");
  if (isUuid(id)) await db.delete(schema.busRoutes).where(eq(schema.busRoutes.id, id));
  contentChanged();
}
