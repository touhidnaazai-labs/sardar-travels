import type { Metadata } from "next";
import { ServicePage } from "@/components/site/service-page";
import { getServicesSettings } from "@/lib/data";
import { trainFields } from "@/lib/enquiry-forms";

export const metadata: Metadata = {
  title: "Train ticket booking",
  description: "Send your route, date and class and Sardar Travels will help you book your train journey. Free enquiry — nothing is booked until you confirm.",
  alternates: { canonical: "/train-booking" },
};

export default async function TrainBookingPage() {
  const s = (await getServicesSettings()).train;
  return (
    <ServicePage
      service={s}
      eyebrow="Travel services"
      crumb={{ href: "/train-booking", label: "Train booking" }}
      type="train"
      fields={trainFields(s)}
      tripStepTitle="Your journey"
      submitLabel="Send train enquiry"
      formTitle="Train booking enquiry"
      helps={["Tell us your route, date and class", "We check availability and confirm the details with you", "We help with booking once you’ve confirmed"]}
      note="Train availability and fares aren’t shown on this website. Your request is an enquiry — we check and come back to you, and nothing is booked or charged until you confirm."
    />
  );
}
