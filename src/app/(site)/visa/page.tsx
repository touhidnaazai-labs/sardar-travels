import type { Metadata } from "next";
import { ServicePage } from "@/components/site/service-page";
import { getServicesSettings } from "@/lib/data";
import { visaFields } from "@/lib/enquiry-forms";

export const metadata: Metadata = {
  title: "Visa assistance",
  description: "Get guidance on documents and applications for your visa. Tell Sardar Travels the country, visa type and travel dates.",
  alternates: { canonical: "/visa" },
};

export default async function VisaPage() {
  const s = (await getServicesSettings()).visa;
  return (
    <ServicePage
      service={s}
      eyebrow="Travel services"
      crumb={{ href: "/visa", label: "Visa assistance" }}
      type="visa"
      fields={visaFields(s)}
      tripStepTitle="Your visa"
      submitLabel="Send visa enquiry"
      formTitle="Visa assistance enquiry"
      helps={["Guidance on the documents you’ll need", "Help filling in and submitting the application", "A checklist tailored to your destination and visa type"]}
      note="Visa decisions are made solely by the embassy or consulate. We can’t guarantee approval, and processing times and fees vary by country — we’ll confirm the current requirements when we reply."
    />
  );
}
