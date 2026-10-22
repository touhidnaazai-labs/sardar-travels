/**
 * Shapes and defaults for the JSON documents stored in the `settings` table.
 * Defaults for the JSON documents stored in the `settings` table.
 */

export type SiteSettings = {
  siteName: string;
  tagline: string;
  logoMediaId: string | null;
  colors: { ink: string; ivory: string; accent: string; forest: string };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    hours: string;
    mapUrl: string;
  };
  social: { instagram: string; facebook: string; youtube: string };
  seo: { defaultTitle: string; defaultDescription: string; ogImageId: string | null };
  announcement: string;
};

export type HomeSectionKey =
  | "hero"
  | "planner"
  | "experiences"
  | "destinations"
  | "tours"
  | "services"
  | "intercity"
  | "why"
  | "testimonials"
  | "faqs"
  | "cta";

export type HomeSettings = {
  sections: { key: HomeSectionKey; enabled: boolean }[];
  hero: {
    eyebrow: string;
    headline: string;
    subhead: string;
    imageIds: string[];
  };
  experiences: { eyebrow: string; heading: string; intro: string };
  destinations: { eyebrow: string; heading: string; intro: string };
  tours: { eyebrow: string; heading: string; intro: string };
  services: { eyebrow: string; heading: string; intro: string };
  why: { eyebrow: string; heading: string; points: { title: string; body: string }[] };
  testimonials: { eyebrow: string; heading: string };
  faqs: { eyebrow: string; heading: string };
  cta: { heading: string; body: string; imageId: string | null };
};

export type ServicesSettings = {
  vehicle: {
    enabled: boolean;
    heading: string;
    intro: string;
    serviceAreas: string[];
    categoryOptions: string[];
    imageId: string | null;
  };
  hotel: {
    enabled: boolean;
    heading: string;
    intro: string;
    destinations: string[];
    budgetOptions: string[];
    imageId: string | null;
  };
  intercity: {
    enabled: boolean;
    heading: string;
    intro: string;
    disclaimer: string;
    imageId: string | null;
  };
  train: BookingService & { classOptions: string[] };
  flight: BookingService & { cabinOptions: string[] };
  visa: BookingService & { visaTypes: string[] };
  international: BookingService;
};

/** Enquiry-based travel services that share one shape. */
export type BookingService = {
  enabled: boolean;
  heading: string;
  intro: string;
  imageId: string | null;
};

export const HOME_SECTION_LABELS: Record<HomeSectionKey, string> = {
  hero: "Hero",
  planner: "Trust strip & how it works",
  experiences: "Popular packages",
  destinations: "Explore destinations",
  tours: "More tours (list)",
  services: "Vehicle hire & hotels",
  intercity: "Intercity travel (needs module enabled)",
  why: "Why travel with us",
  testimonials: "Verified testimonials",
  faqs: "FAQs",
  cta: "Contact & booking CTA",
};

export const defaultSite: SiteSettings = {
  siteName: "Sardar Travels",
  tagline: "Tours, vehicle hire and hotel reservations across Mysuru, the Nilgiris, Kodaikanal and Coorg.",
  logoMediaId: null,
  colors: { ink: "#0f1c3a", ivory: "#f2f5f8", accent: "#3dd6c0", forest: "#0e7c86" },
  contact: {
    phone: "+91 77956 02153",
    whatsapp: "+91 77956 02153",
    email: "",
    address: "Ground Floor, Sundar Arcade Complex, No. 1 & 2\nOpp. KSRTC Bus Stand, Nazarbad\nMysuru, Karnataka 570010",
    hours: "",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Sundar+Arcade+Complex%2C+Opp.+KSRTC+Bus+Stand%2C+Nazarbad%2C+Mysuru%2C+Karnataka+570010",
  },
  social: { instagram: "", facebook: "", youtube: "" },
  seo: {
    defaultTitle: "Sardar Travels — Mysuru, Ooty, Kodaikanal & Coorg Tours",
    defaultDescription:
      "Plan sightseeing tours, hill-station holidays, heritage circuits and vehicle hire from Mysuru with Sardar Travels. Request a tailored quote online.",
    ogImageId: null,
  },
  announcement: "",
};

export const defaultHome: HomeSettings = {
  sections: [
    { key: "hero", enabled: true },
    { key: "planner", enabled: true },
    { key: "experiences", enabled: true },
    { key: "destinations", enabled: true },
    { key: "tours", enabled: true },
    { key: "services", enabled: true },
    { key: "intercity", enabled: false },
    { key: "why", enabled: true },
    { key: "testimonials", enabled: true },
    { key: "faqs", enabled: true },
    { key: "cta", enabled: true },
  ],
  hero: {
    eyebrow: "Mysuru · Nilgiris · Kodaikanal · Coorg",
    headline: "Your Journey. *Your Way.*",
    subhead:
      "Discover memorable destinations, thoughtfully planned tours, and convenient travel services with Sardar Travels.",
    imageIds: [],
  },
  experiences: {
    eyebrow: "Curated experiences",
    heading: "Palaces at dawn, *tea country by noon*",
    intro: "A few of the routes travellers ask us about most — each one adjustable to your pace.",
  },
  destinations: {
    eyebrow: "Where we travel",
    heading: "Destinations *across the south*",
    intro: "From royal Mysuru to the misty Nilgiris and Kodaikanal, and the coffee hills of Coorg.",
  },
  tours: {
    eyebrow: "Tour packages",
    heading: "Itineraries, day by day",
    intro: "Every package can be tailored. Prices are confirmed in a personal quote.",
  },
  services: {
    eyebrow: "Travel services",
    heading: "More than sightseeing",
    intro: "Arrange a vehicle for your own itinerary or let us find a stay that suits your plans.",
  },
  why: {
    eyebrow: "Why travel with us",
    heading: "Planned properly, *from the first call*",
    points: [
      {
        title: "Routes we know",
        body: "Our itineraries come from the circuits we run — Mysuru, the Nilgiris, Kodaikanal and Coorg.",
      },
      {
        title: "A clear quote first",
        body: "Tell us your dates and group. We confirm price and availability before anything is booked.",
      },
      {
        title: "One enquiry, whole trip",
        body: "Tours, vehicle hire and hotel reservations handled together, so the details line up.",
      },
      {
        title: "Your pace, your stops",
        body: "Departure times and stops can be adjusted for families, couples and senior travellers.",
      },
    ],
  },
  testimonials: { eyebrow: "Traveller stories", heading: "In their words" },
  faqs: { eyebrow: "Good to know", heading: "Frequently asked questions" },
  cta: {
    heading: "Tell us where you’d like to go",
    body: "Share your dates and group size — we’ll come back with an itinerary and a clear quote.",
    imageId: null,
  },
};

export const defaultServices: ServicesSettings = {
  vehicle: {
    enabled: true,
    heading: "Vehicle hire",
    intro:
      "All kinds of vehicles are available for hire — for sightseeing, station transfers or your own multi-day route. Vehicle hire is offered in Mysuru, Ooty and Kodaikanal.",
    serviceAreas: ["Mysuru", "Ooty", "Kodaikanal"],
    categoryOptions: [
      "Car (hatchback / sedan)",
      "SUV / MUV",
      "Tempo Traveller / mini-coach",
      "Larger coach",
      "No preference — please advise",
    ],
    imageId: null,
  },
  hotel: {
    enabled: true,
    heading: "Hotel reservations",
    intro:
      "Tell us your dates, budget and the kind of stay you prefer. We check options and come back with suggestions — hotel reservations are offered in Mysuru, Ooty and Kodaikanal.",
    destinations: ["Mysuru", "Ooty", "Kodaikanal"],
    budgetOptions: ["Budget", "Mid-range", "Premium", "Luxury", "Flexible"],
    imageId: null,
  },
  intercity: {
    enabled: false,
    heading: "Intercity night services",
    intro:
      "Daily overnight bus services to destinations across Karnataka, Maharashtra and the coast. Send a route enquiry and we’ll check seats and fares for you.",
    disclaimer:
      "Buses are run by independent operators. Sardar Travels does not own or operate these services. Schedules, fares and seats are confirmed only after we check with the operator.",
    imageId: null,
  },
  train: {
    enabled: true,
    heading: "Train ticket booking",
    intro:
      "Tell us your route, date and class and we’ll help you book your train journey. We check availability and confirm with you before anything is booked. Seat availability and fares are not shown on this website.",
    classOptions: ["Sleeper (SL)", "Third AC (3A)", "Second AC (2A)", "First AC (1A)", "AC Chair Car (CC)", "Executive Chair Car (EC)", "No preference"],
    imageId: null,
  },
  flight: {
    enabled: true,
    heading: "Flight booking",
    intro:
      "Share where and when you want to fly and we’ll come back with options and fares. Nothing is booked until you confirm. Fares and seats are not shown on this website because they change constantly.",
    cabinOptions: ["Economy", "Premium economy", "Business", "No preference"],
    imageId: null,
  },
  visa: {
    enabled: true,
    heading: "Visa assistance",
    intro:
      "Travelling abroad? Tell us the country, visa type and your travel dates and we’ll guide you through the documents and the application. Visa decisions are made by the embassy or consulate, so we can’t promise approval or a processing time.",
    visaTypes: ["Tourist", "Business", "Transit", "Other"],
    imageId: null,
  },
  international: {
    enabled: true,
    heading: "International packages",
    intro:
      "Planning a holiday abroad? Tell us the country, dates and how many are travelling and we’ll put together an itinerary and a quote. Flights, hotels, transfers and visa help can be included on request.",
    imageId: null,
  },
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge stored JSON over defaults so new fields always have values. */
export function mergeDefaults<T>(defaults: T, stored: unknown): T {
  if (!isPlainObject(defaults) || !isPlainObject(stored)) {
    return (stored === undefined || stored === null ? defaults : (stored as T));
  }
  const out: Record<string, unknown> = { ...defaults };
  for (const [k, v] of Object.entries(stored)) {
    const d = (defaults as Record<string, unknown>)[k];
    out[k] = isPlainObject(d) ? mergeDefaults(d, v) : v === undefined ? d : v;
  }
  return out as T;
}

/** Ensure every known section appears exactly once, keeping stored order. */
export function normaliseSections(sections: HomeSettings["sections"]): HomeSettings["sections"] {
  const known = Object.keys(HOME_SECTION_LABELS) as HomeSectionKey[];
  const seen = new Set<HomeSectionKey>();
  const out: HomeSettings["sections"] = [];
  for (const s of sections) {
    if (known.includes(s.key) && !seen.has(s.key)) {
      seen.add(s.key);
      out.push({ key: s.key, enabled: !!s.enabled });
    }
  }
  for (const k of known) if (!seen.has(k)) out.push({ key: k, enabled: false });
  return out;
}
