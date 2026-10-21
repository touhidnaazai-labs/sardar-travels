import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnquiryWizard } from "@/components/forms/enquiry-wizard";
import { MediaImage } from "@/components/site/media-image";
import { HowItWorks, InfoBlock, ServiceLayout } from "@/components/site/service-layout";
import { getMediaMap, getPublishedVehicles, getServicesSettings } from "@/lib/data";
import { vehicleFields } from "@/lib/enquiry-forms";

export const metadata: Metadata = {
  title: "Vehicle hire",
  description: "Hire a vehicle with driver in Mysuru, Ooty and Kodaikanal for sightseeing, transfers and multi-day trips. Send your route and get a quote.",
  alternates: { canonical: "/vehicle-hire" },
};

export default async function VehicleHirePage() {
  const [services, media, vehicles] = await Promise.all([getServicesSettings(), getMediaMap(), getPublishedVehicles()]);
  const s = services.vehicle;
  if (!s.enabled) notFound();
  return (
    <ServiceLayout
      eyebrow="Travel services"
      title={s.heading}
      intro={s.intro}
      media={s.imageId ? media[s.imageId] : undefined}
      crumb={{ href: "/vehicle-hire", label: "Vehicle hire" }}
      formTitle="Request a vehicle"
      aside={
        <>
          {s.serviceAreas.length > 0 && (
            <InfoBlock title="Where we offer vehicle hire">
              <ul className="flex flex-wrap gap-2">
                {s.serviceAreas.map((a) => <li key={a} className="rounded-full bg-ivory px-4 py-2 text-sm font-medium">{a}</li>)}
              </ul>
            </InfoBlock>
          )}
          {vehicles.length > 0 && (
            <InfoBlock title="Our vehicles">
              <ul className="space-y-4">
                {vehicles.map((v) => (
                  <li key={v.id} className="flex gap-4 rounded-2xl border border-line p-4">
                    {v.imageId && (
                      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl"><MediaImage media={media[v.imageId]} sizes="96px" /></div>
                    )}
                    <div>
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-sm text-muted">{[v.category, v.seats && `${v.seats} seats`].filter(Boolean).join(" · ")}</p>
                      {v.description && <p className="mt-1 text-sm">{v.description}</p>}
                      {v.features.length > 0 && <p className="mt-1 text-xs text-muted">{v.features.join(" · ")}</p>}
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">Availability of a specific vehicle is confirmed in your quote.</p>
            </InfoBlock>
          )}
          <HowItWorks />
        </>
      }
    >
      <EnquiryWizard type="vehicle" tripFields={vehicleFields(s)} tripStepTitle="Route & vehicle" tone="card" submitLabel="Request a quote" />
    </ServiceLayout>
  );
}
