import type { Metadata } from "next";
import { ServicePage } from "@/components/site/service-page";
import { getServicesSettings } from "@/lib/data";
import { internationalFields } from "@/lib/enquiry-forms";

export const metadata: Metadata = {
  title: "International holiday packages",
  description: "Plan a holiday abroad with Sardar Travels. Tell us the country, dates and group size and we’ll send an itinerary and quote.",
  alternates: { canonical: "/international-packages" },
};

export default async function InternationalPackagesPage() {
  const s = (await getServicesSettings()).international;
  return (
    <ServicePage
      service={s}
      eyebrow="Holidays abroad"
      crumb={{ href: "/international-packages", label: "International packages" }}
      type="international"
      fields={internationalFields()}
      tripStepTitle="Your trip"
      submitLabel="Request a quote"
      formTitle="International package enquiry"
      helps={["A tailored itinerary for your dates and budget", "Flights, hotels, transfers and sightseeing on request", "Visa guidance for your destination"]}
      note="Each international package is planned around your group, so prices aren’t listed here. You receive a clear quote first, and nothing is booked until you accept it."
    />
  );
}
