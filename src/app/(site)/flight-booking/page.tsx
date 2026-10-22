import type { Metadata } from "next";
import { ServicePage } from "@/components/site/service-page";
import { getServicesSettings } from "@/lib/data";
import { flightFields } from "@/lib/enquiry-forms";

export const metadata: Metadata = {
  title: "Flight booking",
  description: "Tell Sardar Travels where and when you want to fly and get options and fares. Free enquiry — nothing is booked until you confirm.",
  alternates: { canonical: "/flight-booking" },
};

export default async function FlightBookingPage() {
  const s = (await getServicesSettings()).flight;
  return (
    <ServicePage
      service={s}
      eyebrow="Travel services"
      crumb={{ href: "/flight-booking", label: "Flight booking" }}
      type="flight"
      fields={flightFields(s)}
      tripStepTitle="Your flight"
      submitLabel="Send flight enquiry"
      formTitle="Flight booking enquiry"
      helps={["Domestic and international routes", "Options and fares sent to you before you decide", "Help with dates, timings and baggage questions"]}
      note="Flight fares and seats change constantly, so they aren’t shown here. We’ll send you current options after your enquiry, and nothing is booked or charged until you confirm."
    />
  );
}
