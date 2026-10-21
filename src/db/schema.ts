import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
  numeric,
  date,
  customType,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

/* ------------------------------------------------------------------ */
/* Shared JSON shapes                                                  */
/* ------------------------------------------------------------------ */

export type ItineraryStop = { time?: string; name: string; note?: string };
export type ItineraryDay = {
  day: number;
  title: string;
  summary?: string;
  overnight?: string;
  stops: ItineraryStop[];
};
export type FaqItem = { q: string; a: string };
export type PricingRule = { label: string; amount: number; basis?: string };
export type GalleryItem = { mediaId: string; caption?: string };

/* ------------------------------------------------------------------ */
/* Users & sessions                                                    */
/* ------------------------------------------------------------------ */

export const userRole = pgEnum("user_role", ["admin", "staff"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("staff"),
  active: boolean("active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 of the session token; the raw token only ever lives in the cookie. */
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** Generic sliding-window rate limit log (login attempts, public form posts). */
export const rateLimits = pgTable(
  "rate_limits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("rate_limits_key_idx").on(t.key, t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  data: bytea("data").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  bytes: integer("bytes").notNull(),
  alt: text("alt").notNull().default(""),
  credit: text("credit"),
  creditUrl: text("credit_url"),
  license: text("license"),
  /** Low-quality placeholder (data URI) for blur-up loading. */
  blurDataUrl: text("blur_data_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export const destinations = pgTable("destinations", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  region: text("region").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  heroImageId: uuid("hero_image_id").references(() => media.id, { onDelete: "set null" }),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tourCategory = pgEnum("tour_category", [
  "sightseeing",
  "hill-station",
  "heritage",
  "pilgrimage",
  "wildlife-nature",
  "honeymoon",
  "waterfalls",
]);
export const tourStyle = pgEnum("tour_style", ["private", "group", "private-or-group", "unconfirmed"]);
export const availabilityMode = pgEnum("availability_mode", ["on-request", "daily", "scheduled"]);

export const tours = pgTable(
  "tours",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    code: text("code"),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull().default(""),
    category: tourCategory("category").notNull().default("sightseeing"),
    durationDays: integer("duration_days").notNull().default(1),
    durationNights: integer("duration_nights").notNull().default(0),
    durationLabel: text("duration_label").notNull().default(""),
    summary: text("summary").notNull().default(""),
    overview: text("overview").notNull().default(""),
    startPoint: text("start_point").notNull().default(""),
    departureTime: text("departure_time").notNull().default(""),
    departureNotes: text("departure_notes").notNull().default(""),
    dropOffs: text("drop_offs").notNull().default(""),
    transport: text("transport").notNull().default(""),
    tourStyle: tourStyle("tour_style").notNull().default("unconfirmed"),
    priceFrom: numeric("price_from", { precision: 12, scale: 2, mode: "number" }),
    priceCurrency: text("price_currency").notNull().default("INR"),
    priceBasis: text("price_basis").notNull().default(""),
    pricingRules: jsonb("pricing_rules").$type<PricingRule[]>().notNull().default([]),
    pricingNotes: text("pricing_notes").notNull().default(""),
    availabilityMode: availabilityMode("availability_mode").notNull().default("on-request"),
    availableDates: jsonb("available_dates").$type<string[]>().notNull().default([]),
    itinerary: jsonb("itinerary").$type<ItineraryDay[]>().notNull().default([]),
    inclusions: jsonb("inclusions").$type<string[]>().notNull().default([]),
    exclusions: jsonb("exclusions").$type<string[]>().notNull().default([]),
    accommodation: text("accommodation").notNull().default(""),
    cancellationPolicy: text("cancellation_policy").notNull().default(""),
    importantNotes: text("important_notes").notNull().default(""),
    faqs: jsonb("faqs").$type<FaqItem[]>().notNull().default([]),
    heroImageId: uuid("hero_image_id").references(() => media.id, { onDelete: "set null" }),
    gallery: jsonb("gallery").$type<GalleryItem[]>().notNull().default([]),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    /** Internal only — never rendered publicly. */
    verificationNotes: text("verification_notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("tours_published_idx").on(t.published, t.sortOrder)],
);

export const tourDestinations = pgTable(
  "tour_destinations",
  {
    tourId: uuid("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    destinationId: uuid("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.tourId, t.destinationId] })],
);

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

/** Only vehicles the business has verified are ever shown publicly. */
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull().default(""),
  seats: text("seats").notNull().default(""),
  description: text("description").notNull().default(""),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  imageId: uuid("image_id").references(() => media.id, { onDelete: "set null" }),
  verified: boolean("verified").notNull().default(false),
  published: boolean("published").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const busRoutes = pgTable("bus_routes", {
  id: uuid("id").primaryKey().defaultRandom(),
  operator: text("operator").notNull(),
  destination: text("destination").notNull(),
  origin: text("origin").notNull().default(""),
  serviceNote: text("service_note").notNull().default(""),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  topic: text("topic").notNull().default("general"),
  showOnHome: boolean("show_on_home").notNull().default(true),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  location: text("location").notNull().default(""),
  quote: text("quote").notNull(),
  tourId: uuid("tour_id").references(() => tours.id, { onDelete: "set null" }),
  travelledOn: text("travelled_on").notNull().default(""),
  /** Must be ticked by staff after confirming the review is genuine. */
  verified: boolean("verified").notNull().default(false),
  published: boolean("published").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  intro: text("intro").notNull().default(""),
  body: text("body").notNull().default(""),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  showInFooter: boolean("show_in_footer").notNull().default(true),
  published: boolean("published").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Key/value JSON documents: "site", "home", "services". */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Enquiries                                                           */
/* ------------------------------------------------------------------ */

export const enquiryStatus = pgEnum("enquiry_status", [
  "new",
  "reviewing",
  "quote_sent",
  "awaiting_confirmation",
  "confirmed",
  "completed",
  "cancelled",
]);
export const enquiryType = pgEnum("enquiry_type", ["tour", "planner", "vehicle", "hotel", "intercity", "general"]);

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull(),
    type: enquiryType("type").notNull(),
    status: enquiryStatus("status").notNull().default("new"),
    tourId: uuid("tour_id").references(() => tours.id, { onDelete: "set null" }),
    /** Snapshot of the tour title at submission time. */
    subject: text("subject").notNull().default(""),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    preferredContact: text("preferred_contact").notNull().default("phone"),
    travelDate: date("travel_date"),
    returnDate: date("return_date"),
    adults: integer("adults").notNull().default(1),
    children: integer("children").notNull().default(0),
    pickup: text("pickup").notNull().default(""),
    destination: text("destination").notNull().default(""),
    details: jsonb("details").$type<Record<string, string>>().notNull().default({}),
    message: text("message").notNull().default(""),
    internalNotes: text("internal_notes").notNull().default(""),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("enquiries_reference_idx").on(t.reference),
    index("enquiries_status_idx").on(t.status, t.createdAt),
  ],
);

export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  enquiryId: uuid("enquiry_id")
    .notNull()
    .references(() => enquiries.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
  currency: text("currency").notNull().default("INR"),
  summary: text("summary").notNull(),
  validUntil: date("valid_until"),
  emailed: boolean("emailed").notNull().default(false),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const enquiryEvents = pgTable(
  "enquiry_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    enquiryId: uuid("enquiry_id")
      .notNull()
      .references(() => enquiries.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // created | status | note | quote | customer
    fromStatus: enquiryStatus("from_status"),
    toStatus: enquiryStatus("to_status"),
    note: text("note").notNull().default(""),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("enquiry_events_enquiry_idx").on(t.enquiryId, t.createdAt)],
);

export type Tour = typeof tours.$inferSelect;
export type Destination = typeof destinations.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type EnquiryStatus = (typeof enquiryStatus.enumValues)[number];
export type EnquiryType = (typeof enquiryType.enumValues)[number];
export type TourCategory = (typeof tourCategory.enumValues)[number];
export type User = typeof users.$inferSelect;
