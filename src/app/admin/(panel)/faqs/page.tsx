import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { AdminForm, SelectField, SubmitButton, TextArea, TextField, Toggle } from "@/components/admin/form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Card, PageHeader } from "@/components/admin/ui";
import { deleteFaq, saveFaq } from "@/app/actions/admin/content";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "FAQs" };

const TOPICS = ["general", "booking", "hotel", "vehicle", "wildlife", "payments"].map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }));

export default async function FaqsAdmin() {
  await requireUser("admin");
  const faqs = await db.select().from(schema.faqs).orderBy(asc(schema.faqs.sortOrder));
  return (
    <>
      <PageHeader title="FAQs" description="Shown on the FAQ page. Tick “Show on homepage” to feature a question there too. Tour-specific questions are edited on each tour." />
      <div className="space-y-4">
        {faqs.map((f) => (
          <Card key={f.id}>
            <AdminForm action={saveFaq} className="grid gap-3 md:grid-cols-6">
              <input type="hidden" name="id" value={f.id} />
              <TextField name="question" label="Question" defaultValue={f.question} className="md:col-span-4" />
              <SelectField name="topic" label="Topic" defaultValue={f.topic} options={TOPICS} />
              <TextField name="sortOrder" label="Order" type="number" defaultValue={f.sortOrder} />
              <TextArea name="answer" label="Answer" defaultValue={f.answer} rows={3} className="md:col-span-6" />
              <div className="flex flex-wrap items-center gap-3 md:col-span-6">
                <Toggle name="published" label="Published" defaultChecked={f.published} />
                <Toggle name="showOnHome" label="Show on homepage" defaultChecked={f.showOnHome} />
                <span className="ml-auto flex items-center gap-2"><ConfirmButton action={deleteFaq.bind(null, f.id)} /><SubmitButton variant="dark">Save</SubmitButton></span>
              </div>
            </AdminForm>
          </Card>
        ))}
        <Card title="Add a question">
          <AdminForm action={saveFaq} resetOnSuccess className="grid gap-3 md:grid-cols-6">
            <TextField name="question" label="Question" required className="md:col-span-4" />
            <SelectField name="topic" label="Topic" options={TOPICS} />
            <TextField name="sortOrder" label="Order" type="number" defaultValue={faqs.length} />
            <TextArea name="answer" label="Answer" required rows={3} className="md:col-span-6" />
            <div className="flex items-center gap-3 md:col-span-6">
              <Toggle name="published" label="Published" defaultChecked />
              <Toggle name="showOnHome" label="Show on homepage" />
              <SubmitButton className="ml-auto">Add FAQ</SubmitButton>
            </div>
          </AdminForm>
        </Card>
      </div>
    </>
  );
}
