import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnquiryWizard } from "@/components/forms/enquiry-wizard";
import { HowItWorks, InfoBlock, ServiceLayout } from "@/components/site/service-layout";
import { getMediaMap, getServicesSettings } from "@/lib/data";
import { hotelFields } from "@/lib/enquiry-forms";

export const metadata: Metadata = {
  title: "Hotel reservations",
  description: "Hotel reservation requests for Mysuru, Ooty and Kodaikanal. Share your dates, rooms and budget and we’ll come back with options.",
  alternates: { canonical: "/hotels" },
};

export default async function HotelsPage() {
  const [services, media] = await Promise.all([getServicesSettings(), getMediaMap()]);
  const s = services.hotel;
  if (!s.enabled) notFound();
  return (
    <ServiceLayout
      eyebrow="Travel services"
      title={s.heading}
      intro={s.intro}
      media={s.imageId ? media[s.imageId] : undefined}
      crumb={{ href: "/hotels", label: "Hotels" }}
      formTitle="Hotel enquiry"
      aside={
        <>
          <InfoBlock title="Destinations">
            <ul className="flex flex-wrap gap-2">
              {s.destinations.map((a) => <li key={a} className="rounded-full bg-ivory px-4 py-2 text-sm font-medium">{a}</li>)}
            </ul>
          </InfoBlock>
          <InfoBlock title="Please note">
            <p className="text-muted">Hotel availability isn’t live on this website. Your request is an enquiry — we check with hotels and confirm options, prices and terms before anything is reserved.</p>
          </InfoBlock>
          <HowItWorks />
        </>
      }
    >
      <EnquiryWizard type="hotel" tripFields={hotelFields(s)} tripStepTitle="Your stay" tone="card" submitLabel="Send hotel enquiry" />
    </ServiceLayout>
  );
}
