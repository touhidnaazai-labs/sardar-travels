import { z } from "zod";

export const ENQUIRY_TYPES = ["tour", "planner", "vehicle", "hotel", "intercity", "general"] as const;

export const STATUS_LABELS = {
  new: "New enquiry",
  reviewing: "Reviewing",
  quote_sent: "Quote sent",
  awaiting_confirmation: "Awaiting confirmation",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

export const TYPE_LABELS = {
  tour: "Tour package",
  planner: "Trip planner",
  vehicle: "Vehicle hire",
  hotel: "Hotel reservation",
  intercity: "Intercity bus",
  general: "General enquiry",
} as const;

/** What the customer sees for each status on the tracking page. */
export const STATUS_EXPLAINERS = {
  new: "We've received your enquiry and will review it shortly.",
  reviewing: "We're checking availability and preparing your quote.",
  quote_sent: "Your quote is ready below. Accept it to let us know you'd like to go ahead.",
  awaiting_confirmation: "Thanks — you've accepted the quote. We're confirming the final arrangements with you.",
  confirmed: "Your trip is confirmed. We'll be in touch with final details.",
  completed: "This trip has been completed. Thank you for travelling with us.",
  cancelled: "This enquiry has been closed. Contact us if you'd like to plan something new.",
} as const;

const todayIso = () => {
  // Compare in India Standard Time so late-evening submissions aren't rejected.
  const now = new Date(Date.now() + 5.5 * 3600_000);
  return now.toISOString().slice(0, 10);
};

const optionalDate = z
  .string()
  .trim()
  .transform((v) => v || undefined)
  .pipe(z.iso.date({ error: "Enter a valid date" }).optional());

export const enquirySchema = z
  .object({
    type: z.enum(ENQUIRY_TYPES),
    tourId: z.uuid().optional().or(z.literal("").transform(() => undefined)),
    subject: z.string().trim().max(200).default(""),
    name: z.string().trim().min(2, "Please enter your name").max(100),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(200)
      .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address")
      .default(""),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s\-()]{7,20}$/, "Enter a valid phone number, e.g. +91 98765 43210"),
    preferredContact: z.enum(["phone", "whatsapp", "email"]).default("phone"),
    travelDate: optionalDate,
    returnDate: optionalDate,
    adults: z.coerce.number().int().min(1, "At least one adult").max(99).default(1),
    children: z.coerce.number().int().min(0).max(60).default(0),
    pickup: z.string().trim().max(200).default(""),
    destination: z.string().trim().max(200).default(""),
    message: z.string().trim().max(3000, "Please keep your message under 3000 characters").default(""),
    details: z.record(z.string().regex(/^[a-zA-Z]{1,30}$/), z.string().trim().max(500)).default({}),
  })
  .superRefine((v, ctx) => {
    if (v.travelDate && v.travelDate < todayIso()) {
      ctx.addIssue({ code: "custom", path: ["travelDate"], message: "Travel date can't be in the past" });
    }
    if (v.travelDate && v.returnDate && v.returnDate < v.travelDate) {
      ctx.addIssue({ code: "custom", path: ["returnDate"], message: "Return date must be after the travel date" });
    }
    if (v.type === "tour" && !v.tourId) {
      ctx.addIssue({ code: "custom", path: ["tourId"], message: "Please choose a tour" });
    }
    if ((v.type === "vehicle" || v.type === "intercity") && !v.destination) {
      ctx.addIssue({ code: "custom", path: ["destination"], message: "Where would you like to go?" });
    }
    if (v.type === "hotel" && !v.destination) {
      ctx.addIssue({ code: "custom", path: ["destination"], message: "Choose a destination" });
    }
    if (v.type === "general" && v.message.length < 5) {
      ctx.addIssue({ code: "custom", path: ["message"], message: "Please tell us how we can help" });
    }
  });

export type EnquiryInput = z.infer<typeof enquirySchema>;

export function humanize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
