import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { AdminForm, SubmitButton, TextArea, TextField, Toggle } from "@/components/admin/form";
import { ImagePicker } from "@/components/admin/editors";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Card, PageHeader } from "@/components/admin/ui";
import { deleteDestination, saveDestination } from "@/app/actions/admin/content";
import { requireUser } from "@/lib/auth";
import { getMediaOptions } from "@/lib/admin-data";
import { isUuid } from "@/lib/admin-action";

export const metadata: Metadata = { title: "Destination" };

export default async function DestinationEdit(props: PageProps<"/admin/destinations/[id]">) {
  await requireUser("admin");
  const { id } = await props.params;
  const isNew = id === "new";
  if (!isNew && !isUuid(id)) notFound();
  const [d] = isNew ? [undefined] : await db.select().from(schema.destinations).where(eq(schema.destinations.id, id));
  if (!isNew && !d) notFound();
  const media = await getMediaOptions();
  return (
    <>
      <PageHeader
        back={{ href: "/admin/destinations", label: "Destinations" }}
        title={d?.name ?? "New destination"}
        actions={d ? <ConfirmButton action={deleteDestination.bind(null, d.id)} label="Delete" /> : undefined}
      />
      <AdminForm action={saveDestination} className="space-y-6">
        {d && <input type="hidden" name="id" value={d.id} />}
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField name="name" label="Name" required defaultValue={d?.name} />
            <TextField name="slug" label="URL slug" defaultValue={d?.slug} help="Leave blank to generate" />
            <TextField name="region" label="Region" defaultValue={d?.region} />
            <TextField name="tagline" label="Tagline" defaultValue={d?.tagline} />
            <TextArea name="description" label="Description" defaultValue={d?.description} rows={5} className="md:col-span-2" />
            <div className="md:col-span-2"><ImagePicker name="heroImageId" label="Image" media={media} value={d?.heroImageId ?? null} /></div>
            <TextField name="seoTitle" label="SEO title" defaultValue={d?.seoTitle} />
            <TextField name="seoDescription" label="Meta description" defaultValue={d?.seoDescription} />
            <TextField name="sortOrder" label="Order" type="number" defaultValue={d?.sortOrder ?? 0} />
          </div>
        </Card>
        <div className="flex items-center gap-3">
          <Toggle name="published" label="Published" defaultChecked={d?.published ?? true} />
          <SubmitButton className="ml-auto">Save destination</SubmitButton>
        </div>
      </AdminForm>
    </>
  );
}
