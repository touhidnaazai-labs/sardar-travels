import type { FieldDef } from "@/lib/form-fields";
import type { ServicesSettings } from "@/lib/settings";

export function tourEnquiryFields(opts: { tours?: { id: string; title: string }[]; multiDay?: boolean }): FieldDef[] {
  return [
    ...(opts.tours
      ? [{ name: "tourId", label: "Tour", kind: "select", required: true, options: opts.tours.map((t) => ({ value: t.id, label: t.title })), width: "full", placeholder: "Choose a tour" } satisfies FieldDef]
      : []),
    { name: "travelDate", label: "Preferred travel date", kind: "date", required: true, width: "half" },
    { name: "pickup", label: "Pickup location", kind: "text", width: "half", placeholder: "Hotel, station or address" },
    { name: "adults", label: "Adults", kind: "number", min: 1, max: 99, required: true, width: "third" },
    { name: "children", label: "Children", kind: "number", min: 0, max: 60, width: "third" },
    { name: "tourStyle", label: "Tour style", kind: "select", detail: true, width: "third", options: ["Private", "Group", "Either"], placeholder: "No preference" },
    ...(opts.multiDay
      ? [{ name: "stay", label: "Accommodation preference", kind: "select", detail: true, width: "full", options: ["Budget", "Mid-range", "Premium", "Luxury", "No hotel needed"], placeholder: "Discuss with me" } satisfies FieldDef]
      : []),
  ];
}

export function vehicleFields(s: ServicesSettings["vehicle"]): FieldDef[] {
  return [
    { name: "pickup", label: "Pickup location", kind: "text", required: true, width: "half", placeholder: "e.g. Mysuru railway station" },
    { name: "destination", label: "Destination", kind: "text", required: true, width: "half", placeholder: "e.g. Ooty" },
    { name: "travelDate", label: "Pickup date", kind: "date", required: true, width: "third" },
    { name: "time", label: "Pickup time", kind: "time", detail: true, width: "third" },
    { name: "duration", label: "Trip duration", kind: "select", detail: true, width: "third", options: ["One way / drop", "Half day", "Full day", "2 days", "3 days", "4–6 days", "A week or more"], placeholder: "Select…" },
    { name: "adults", label: "Passengers", kind: "number", min: 1, max: 99, required: true, width: "third" },
    { name: "vehicleCategory", label: "Requested vehicle type", kind: "select", detail: true, width: "full", options: s.categoryOptions, placeholder: "No preference", help: "A request only — we confirm what's available in your quote." },
    { name: "stops", label: "Stops along the way", kind: "textarea", detail: true, width: "full", placeholder: "List any places you'd like to stop" },
  ];
}

export function hotelFields(s: ServicesSettings["hotel"]): FieldDef[] {
  return [
    { name: "destination", label: "Destination", kind: "select", required: true, width: "full", options: s.destinations, placeholder: "Choose a destination" },
    { name: "travelDate", label: "Check-in", kind: "date", required: true, width: "half" },
    { name: "returnDate", label: "Check-out", kind: "date", required: true, width: "half", after: "travelDate" },
    { name: "rooms", label: "Rooms", kind: "number", detail: true, min: 1, max: 50, width: "third", required: true },
    { name: "adults", label: "Adults", kind: "number", min: 1, max: 99, required: true, width: "third" },
    { name: "children", label: "Children", kind: "number", min: 0, max: 60, width: "third" },
    { name: "budget", label: "Budget per night", kind: "select", detail: true, width: "full", options: s.budgetOptions, placeholder: "Select…" },
    { name: "preferences", label: "Accommodation preferences", kind: "textarea", detail: true, width: "full", placeholder: "Room type, view, meals, accessibility needs, location…" },
  ];
}

export function plannerFields(opts: { destinations: string[]; vehicleOptions: string[] }): FieldDef[] {
  return [
    { name: "tripType", label: "Trip type", kind: "select", detail: true, required: true, width: "full", options: ["Day sightseeing", "Multi-day holiday", "Honeymoon", "Pilgrimage / temples", "Family trip", "Group / corporate", "Something else"] },
    { name: "pickup", label: "Pickup location", kind: "text", width: "half", placeholder: "City, hotel or station" },
    { name: "destination", label: "Destination", kind: "text", width: "half", placeholder: opts.destinations.slice(0, 3).join(", ") + "…" },
    { name: "travelDate", label: "Travel date", kind: "date", required: true, width: "half" },
    { name: "returnDate", label: "Return date", kind: "date", width: "half", after: "travelDate", help: "Leave blank for a day trip" },
    { name: "adults", label: "Adults", kind: "number", min: 1, max: 99, required: true, width: "third" },
    { name: "children", label: "Children", kind: "number", min: 0, max: 60, width: "third" },
    { name: "vehiclePreference", label: "Vehicle preference", kind: "select", detail: true, width: "third", options: opts.vehicleOptions, placeholder: "No preference" },
  ];
}

export function intercityFields(routes: { operator: string; destination: string }[]): FieldDef[] {
  const dests = [...new Set(routes.map((r) => r.destination))];
  return [
    { name: "pickup", label: "From", kind: "text", required: true, width: "half", placeholder: "Boarding city" },
    { name: "destination", label: "To", kind: "select", required: true, width: "half", options: dests, placeholder: "Choose a destination" },
    { name: "travelDate", label: "Journey date", kind: "date", required: true, width: "half" },
    { name: "adults", label: "Seats needed", kind: "number", min: 1, max: 40, required: true, width: "half" },
    { name: "berth", label: "Seat preference", kind: "select", detail: true, width: "full", options: ["Sleeper", "Semi-sleeper / seater", "No preference"], placeholder: "No preference" },
  ];
}
