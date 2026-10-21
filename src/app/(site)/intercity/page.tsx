import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { EnquiryWizard } from "@/components/forms/enquiry-wizard";
import { HowItWorks, InfoBlock, ServiceLayout } from "@/components/site/service-layout";
import { getMediaMap, getPublishedBusRoutes, getServicesSettings } from "@/lib/data";
import { intercityFields } from "@/lib/enquiry-forms";

export const metadata: Metadata = {
  title: "Intercity bus enquiries",
  description: "Enquire about overnight intercity bus services to Maharashtra, north Karnataka and the coast.",
  alternates: { canonical: "/intercity" },
};

export default async function IntercityPage() {
  const [services, media, routes] = await Promise.all([getServicesSettings(), getMediaMap(), getPublishedBusRoutes()]);
  const s = services.intercity;
  if (!s.enabled || !routes.length) notFound();
  const byOperator = Object.entries(
    routes.reduce<Record<string, string[]>>((acc, r) => ((acc[r.operator] ??= []).push(r.destination), acc), {}),
  );
  return (
    <ServiceLayout
      eyebrow="Intercity travel"
      title={s.heading}
      intro={s.intro}
      media={s.imageId ? media[s.imageId] : undefined}
      crumb={{ href: "/intercity", label: "Intercity" }}
      formTitle="Route enquiry"
      aside={
        <>
          <div className="flex gap-3 rounded-2xl border border-accent/40 bg-accent-soft/60 p-5 text-sm leading-relaxed">
            <Info className="mt-0.5 size-5 shrink-0 text-accent-strong" aria-hidden />
            <p>{s.disclaimer}</p>
          </div>
          {byOperator.map(([op, dests]) => (
            <InfoBlock key={op} title={`Destinations served by ${op}`}>
              <ul className="flex flex-wrap gap-2">
                {dests.map((d) => <li key={d} className="rounded-full bg-ivory px-4 py-2 text-sm">{d}</li>)}
              </ul>
            </InfoBlock>
          ))}
          <HowItWorks />
        </>
      }
    >
      <EnquiryWizard type="intercity" tripFields={intercityFields(routes)} tripStepTitle="Journey" tone="card" submitLabel="Send route enquiry" note="We’ll check seats and fares with the operator and get back to you. No ticket is issued until you confirm and pay." />
    </ServiceLayout>
  );
}
