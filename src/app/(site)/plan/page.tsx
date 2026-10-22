import type { Metadata } from "next";
import { HomePlanner, type PlannerTab } from "@/components/forms/home-planner";
import { PageHero } from "@/components/site/page-hero";
import { HowItWorks } from "@/components/site/service-layout";
import { getHomeSettings, getMediaMap, getPublishedBusRoutes, getPublishedDestinations, getPublishedTours, getServicesSettings } from "@/lib/data";
import { flightFields, hotelFields, intercityFields, internationalFields, plannerFields, tourEnquiryFields, trainFields, vehicleFields, visaFields } from "@/lib/enquiry-forms";

export const metadata: Metadata = {
  title: "Plan your journey",
  description: "Tell us about your trip — tours, vehicle hire, hotels or a custom itinerary — and receive a tailored quote from Sardar Travels.",
  alternates: { canonical: "/plan" },
};

export default async function PlanPage() {
  const [tours, destinations, services, media, home, routes] = await Promise.all([
    getPublishedTours(), getPublishedDestinations(), getServicesSettings(), getMediaMap(), getHomeSettings(), getPublishedBusRoutes(),
  ]);
  const tabs: PlannerTab[] = [
    { key: "custom", label: "Custom trip", icon: "custom", type: "planner", fields: plannerFields({ destinations: destinations.map((d) => d.name), vehicleOptions: services.vehicle.categoryOptions }) },
    { key: "tour", label: "Tour package", icon: "tour", type: "tour", fields: tourEnquiryFields({ tours, multiDay: true }) },
    ...(services.vehicle.enabled ? [{ key: "vehicle", label: "Vehicle hire", icon: "vehicle", type: "vehicle", fields: vehicleFields(services.vehicle) } satisfies PlannerTab] : []),
    ...(services.hotel.enabled ? [{ key: "hotel", label: "Hotel stay", icon: "hotel", type: "hotel", fields: hotelFields(services.hotel) } satisfies PlannerTab] : []),
    ...(services.flight.enabled ? [{ key: "flight", label: "Flights", icon: "flight", type: "flight", fields: flightFields(services.flight) } satisfies PlannerTab] : []),
    ...(services.train.enabled ? [{ key: "train", label: "Trains", icon: "train", type: "train", fields: trainFields(services.train) } satisfies PlannerTab] : []),
    ...(services.visa.enabled ? [{ key: "visa", label: "Visa", icon: "visa", type: "visa", fields: visaFields(services.visa) } satisfies PlannerTab] : []),
    ...(services.international.enabled ? [{ key: "intl", label: "International", icon: "globe", type: "international", fields: internationalFields() } satisfies PlannerTab] : []),
    ...(services.intercity.enabled && routes.length ? [{ key: "bus", label: "Intercity bus", icon: "bus", type: "intercity", fields: intercityFields(routes) } satisfies PlannerTab] : []),
  ];
  const heroId = home.cta.imageId ?? home.hero.imageIds[0];
  return (
    <>
      <PageHero size="sm" eyebrow="Plan your journey" title="Where would you like to go?" intro="Choose what you need and share a few details. We’ll reply with an itinerary and a clear quote." media={heroId ? media[heroId] : undefined} crumbs={[{ href: "/plan", label: "Plan your journey" }]} />
      <div className="container-x grid gap-14 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-8"><HomePlanner tabs={tabs} /></div>
        <aside className="lg:col-span-4"><HowItWorks /></aside>
      </div>
    </>
  );
}
