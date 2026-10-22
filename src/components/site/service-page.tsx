import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { EnquiryWizard } from "@/components/forms/enquiry-wizard";
import type { FieldDef } from "@/lib/form-fields";
import { getMediaMap } from "@/lib/data";
import type { BookingService } from "@/lib/settings";
import { HowItWorks, InfoBlock, ServiceLayout } from "./service-layout";

/** One template for the enquiry-based travel services (train, flight, visa, international). */
export async function ServicePage({
  service,
  eyebrow,
  crumb,
  type,
  fields,
  tripStepTitle,
  submitLabel,
  formTitle,
  helps,
  note,
}: {
  service: BookingService;
  eyebrow: string;
  crumb: { href: string; label: string };
  type: "train" | "flight" | "visa" | "international";
  fields: FieldDef[];
  tripStepTitle: string;
  submitLabel: string;
  formTitle: string;
  helps: string[];
  note: string;
}) {
  if (!service.enabled) notFound();
  const media = await getMediaMap();
  return (
    <ServiceLayout
      eyebrow={eyebrow}
      title={service.heading}
      intro={service.intro}
      media={service.imageId ? media[service.imageId] : undefined}
      crumb={crumb}
      formTitle={formTitle}
      aside={
        <>
          <InfoBlock title="How we help">
            <ul className="space-y-3">
              {helps.map((h) => (
                <li key={h} className="flex gap-3 text-[0.98rem]"><Check className="mt-1 size-4 shrink-0 text-forest" aria-hidden /> {h}</li>
              ))}
            </ul>
          </InfoBlock>
          <InfoBlock title="Please note">
            <p className="leading-relaxed text-muted">{note}</p>
          </InfoBlock>
          <HowItWorks />
        </>
      }
    >
      <EnquiryWizard type={type} tripFields={fields} tripStepTitle={tripStepTitle} tone="card" submitLabel={submitLabel} />
    </ServiceLayout>
  );
}
