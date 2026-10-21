import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { AdminForm, SelectField, SubmitButton, TextArea, TextField, Toggle } from "@/components/admin/form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge, Card, Empty, PageHeader } from "@/components/admin/ui";
import { deleteTestimonial, saveTestimonial } from "@/app/actions/admin/content";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsAdmin() {
  await requireUser("admin");
  const [items, tours] = await Promise.all([
    db.select().from(schema.testimonials).orderBy(asc(schema.testimonials.sortOrder)),
    db.select({ id: schema.tours.id, title: schema.tours.title }).from(schema.tours).orderBy(asc(schema.tours.title)),
  ]);
  const tourOpts = [{ value: "", label: "— Not linked —" }, ...tours.map((t) => ({ value: t.id, label: t.title }))];
  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Add only genuine reviews from real customers, with their permission. A testimonial appears on the website only when it is both Verified and Published."
      />
      <div className="space-y-4">
        {items.length === 0 && <Empty>No testimonials yet. The homepage hides this section until a verified one is published.</Empty>}
        {items.map((t) => (
          <Card key={t.id} actions={<Badge tone={t.published && t.verified ? "published" : "draft"}>{t.published && t.verified ? "Live" : "Not shown"}</Badge>}>
            <AdminForm action={saveTestimonial} className="grid gap-3 md:grid-cols-4">
              <input type="hidden" name="id" value={t.id} />
              <TextField name="name" label="Customer name" defaultValue={t.name} />
              <TextField name="location" label="From" defaultValue={t.location} />
              <TextField name="travelledOn" label="Travelled" defaultValue={t.travelledOn} placeholder="e.g. March 2026" />
              <SelectField name="tourId" label="Tour" defaultValue={t.tourId ?? ""} options={tourOpts} />
              <TextArea name="quote" label="Their words" defaultValue={t.quote} rows={3} className="md:col-span-4" />
              <div className="flex flex-wrap items-center gap-3 md:col-span-4">
                <Toggle name="verified" label="Verified genuine" defaultChecked={t.verified} />
                <Toggle name="published" label="Published" defaultChecked={t.published} />
                <span className="ml-auto flex items-center gap-2"><ConfirmButton action={deleteTestimonial.bind(null, t.id)} /><SubmitButton variant="dark">Save</SubmitButton></span>
              </div>
            </AdminForm>
          </Card>
        ))}
        <Card title="Add a testimonial">
          <AdminForm action={saveTestimonial} resetOnSuccess className="grid gap-3 md:grid-cols-4">
            <TextField name="name" label="Customer name" required />
            <TextField name="location" label="From" />
            <TextField name="travelledOn" label="Travelled" />
            <SelectField name="tourId" label="Tour" options={tourOpts} />
            <TextArea name="quote" label="Their words" required rows={3} className="md:col-span-4" />
            <div className="flex items-center gap-3 md:col-span-4">
              <Toggle name="verified" label="Verified genuine" />
              <Toggle name="published" label="Published" />
              <SubmitButton className="ml-auto">Add testimonial</SubmitButton>
            </div>
          </AdminForm>
        </Card>
      </div>
    </>
  );
}
