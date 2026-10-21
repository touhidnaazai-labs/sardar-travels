import type { Tour } from "@/db/schema";
import { saveTour } from "@/app/actions/admin/tours";
import { AdminForm, SelectField, SubmitButton, TextArea, TextField, Toggle } from "./form";
import { FaqEditor, GalleryPicker, ImagePicker, ItineraryEditor, PricingRulesEditor, type MediaOption } from "./editors";
import { Card } from "./ui";
import { CATEGORY_LABELS } from "@/lib/utils";

export function TourForm({
  tour,
  media,
  destinations,
  selectedDestinations,
}: {
  tour?: Tour;
  media: MediaOption[];
  destinations: { id: string; name: string }[];
  selectedDestinations: string[];
}) {
  const t = tour;
  return (
    <AdminForm action={saveTour} className="space-y-6">
      {t && <input type="hidden" name="id" value={t.id} />}

      {t?.verificationNotes && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">
          <p className="font-bold">Needs verification before relying on it</p>
          <p className="mt-1 whitespace-pre-line">{t.verificationNotes}</p>
          <p className="mt-2 text-xs">Clear the “Verification notes” field below once the business has confirmed these details.</p>
        </div>
      )}

      <Card title="Basics">
        <div className="grid gap-4 md:grid-cols-6">
          <TextField name="title" label="Title" required defaultValue={t?.title} className="md:col-span-4" />
          <TextField name="code" label="Brochure code" defaultValue={t?.code} className="md:col-span-2" help="Internal reference, e.g. A" />
          <TextField name="subtitle" label="Subtitle" defaultValue={t?.subtitle} className="md:col-span-6" />
          <TextField name="slug" label="URL slug" defaultValue={t?.slug} className="md:col-span-3" help="Leave blank to generate from the title" />
          <SelectField name="category" label="Category" defaultValue={t?.category ?? "sightseeing"} className="md:col-span-3" options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))} />
          <TextField name="durationDays" label="Days" type="number" defaultValue={t?.durationDays ?? 1} className="md:col-span-1" />
          <TextField name="durationNights" label="Nights" type="number" defaultValue={t?.durationNights ?? 0} className="md:col-span-1" />
          <TextField name="durationLabel" label="Duration label" defaultValue={t?.durationLabel} className="md:col-span-2" help="e.g. “2 or 3 days” (optional)" />
          <SelectField
            name="tourStyle"
            label="Private / group"
            defaultValue={t?.tourStyle ?? "unconfirmed"}
            className="md:col-span-2"
            options={[
              { value: "unconfirmed", label: "Not stated" },
              { value: "private", label: "Private" },
              { value: "group", label: "Group" },
              { value: "private-or-group", label: "Private or group" },
            ]}
          />
          <TextArea name="summary" label="Summary" defaultValue={t?.summary} rows={3} className="md:col-span-6" help="One or two sentences shown on cards and search results." />
          <TextArea name="overview" label="Overview" defaultValue={t?.overview} rows={6} className="md:col-span-6" help="Blank lines start new paragraphs." />
        </div>
      </Card>

      <Card title="Destinations">
        <div className="flex flex-wrap gap-2">
          {destinations.map((d) => (
            <label key={d.id} className="flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm has-checked:border-ink has-checked:bg-ink has-checked:text-ivory">
              <input type="checkbox" name="destinationIds" value={d.id} defaultChecked={selectedDestinations.includes(d.id)} className="sr-only" />
              {d.name}
            </label>
          ))}
        </div>
      </Card>

      <Card title="Departure & logistics">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField name="startPoint" label="Starts from" defaultValue={t?.startPoint} />
          <TextField name="departureTime" label="Departure time" defaultValue={t?.departureTime} placeholder="e.g. 8:00 AM" />
          <TextArea name="departureNotes" label="Departure notes" defaultValue={t?.departureNotes} rows={2} />
          <TextField name="transport" label="Transport" defaultValue={t?.transport} placeholder="e.g. By car" />
          <TextArea name="dropOffs" label="Drop-off options" defaultValue={t?.dropOffs} rows={2} className="md:col-span-2" />
        </div>
      </Card>

      <Card title="Itinerary">
        <ItineraryEditor name="itinerary" initial={t?.itinerary ?? []} />
      </Card>

      <Card title="Inclusions, accommodation & policies">
        <div className="grid gap-4 md:grid-cols-2">
          <TextArea name="inclusions" label="Included (one per line)" defaultValue={t?.inclusions.join("\n")} rows={6} />
          <TextArea name="exclusions" label="Not included (one per line)" defaultValue={t?.exclusions.join("\n")} rows={6} />
          <TextArea name="accommodation" label="Accommodation" defaultValue={t?.accommodation} rows={3} />
          <TextArea name="importantNotes" label="Important notes" defaultValue={t?.importantNotes} rows={3} />
          <TextArea name="cancellationPolicy" label="Cancellation policy" defaultValue={t?.cancellationPolicy} rows={3} className="md:col-span-2" />
        </div>
      </Card>

      <Card title="Pricing" description="Leave the price empty to show “Request a quote”. Only publish prices the business has confirmed.">
        <div className="grid gap-4 md:grid-cols-4">
          <TextField name="priceFrom" label="Price from" type="number" defaultValue={t?.priceFrom} className="md:col-span-2" />
          <TextField name="priceCurrency" label="Currency" defaultValue={t?.priceCurrency ?? "INR"} maxLength={3} />
          <TextField name="priceBasis" label="Basis" defaultValue={t?.priceBasis} placeholder="per person" />
          <div className="md:col-span-4">
            <p className="field-label">Price options</p>
            <PricingRulesEditor name="pricingRules" initial={t?.pricingRules ?? []} />
          </div>
          <TextArea name="pricingNotes" label="Pricing notes" defaultValue={t?.pricingNotes} rows={2} className="md:col-span-4" />
        </div>
      </Card>

      <Card title="Availability">
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            name="availabilityMode"
            label="Availability"
            defaultValue={t?.availabilityMode ?? "on-request"}
            options={[
              { value: "on-request", label: "On request — confirmed per enquiry" },
              { value: "daily", label: "Runs daily" },
              { value: "scheduled", label: "Fixed departure dates" },
            ]}
          />
          <TextArea name="availableDates" label="Departure dates (one per line, YYYY-MM-DD)" defaultValue={t?.availableDates.join("\n")} rows={4} help="Used when “Fixed departure dates” is selected." />
        </div>
      </Card>

      <Card title="Images">
        <div className="space-y-6">
          <ImagePicker name="heroImageId" label="Hero image" media={media} value={t?.heroImageId ?? null} />
          <div>
            <p className="field-label">Attraction gallery</p>
            <GalleryPicker name="gallery" media={media} value={t?.gallery ?? []} />
          </div>
        </div>
      </Card>

      <Card title="Tour FAQs">
        <FaqEditor name="faqs" initial={t?.faqs ?? []} />
      </Card>

      <Card title="Search engines">
        <div className="grid gap-4">
          <TextField name="seoTitle" label="SEO title" defaultValue={t?.seoTitle} maxLength={70} help="Up to ~60 characters. Defaults to the tour title." />
          <TextArea name="seoDescription" label="Meta description" defaultValue={t?.seoDescription} rows={2} help="Up to ~160 characters. Defaults to the summary." />
        </div>
      </Card>

      <Card title="Internal">
        <TextArea name="verificationNotes" label="Verification notes (staff only — never shown publicly)" defaultValue={t?.verificationNotes} rows={4} />
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-paper/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
        <Toggle name="published" label="Published" defaultChecked={t?.published ?? false} />
        <Toggle name="featured" label="Featured on homepage" defaultChecked={t?.featured ?? false} />
        <div className="w-24">
          <TextField name="sortOrder" label="Order" type="number" defaultValue={t?.sortOrder ?? 0} />
        </div>
        <SubmitButton className="ml-auto">{t ? "Save tour" : "Create tour"}</SubmitButton>
      </div>
    </AdminForm>
  );
}
