import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { db, schema } from "@/db";
import { AdminForm, SubmitButton, TextArea, TextField, Toggle } from "@/components/admin/form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Card, PageHeader } from "@/components/admin/ui";
import { deletePage, savePage } from "@/app/actions/admin/content";
import { requireUser } from "@/lib/auth";
import { isUuid } from "@/lib/admin-action";

export const metadata: Metadata = { title: "Edit page" };

export default async function PageEdit(props: PageProps<"/admin/pages/[id]">) {
  await requireUser("admin");
  const { id } = await props.params;
  const isNew = id === "new";
  if (!isNew && !isUuid(id)) notFound();
  const [p] = isNew ? [undefined] : await db.select().from(schema.pages).where(eq(schema.pages.id, id));
  if (!isNew && !p) notFound();
  return (
    <>
      <PageHeader
        back={{ href: "/admin/pages", label: "Pages" }}
        title={p?.title ?? "New page"}
        actions={
          p && (
            <>
              {p.published && <Link className="btn btn-ghost !py-2" target="_blank" href={`/info/${p.slug}`}><ExternalLink className="size-4" /> View</Link>}
              <ConfirmButton action={deletePage.bind(null, p.id)} label="Delete page" />
            </>
          )
        }
      />
      <AdminForm action={savePage} className="space-y-6">
        {p && <input type="hidden" name="id" value={p.id} />}
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField name="title" label="Title" required defaultValue={p?.title} />
            <TextField name="slug" label="URL" defaultValue={p?.slug} help="/info/<url>. Leave blank to generate." />
            <TextArea name="intro" label="Introduction" defaultValue={p?.intro} rows={2} className="md:col-span-2" />
            <TextArea
              name="body"
              label="Content"
              defaultValue={p?.body}
              rows={18}
              className="md:col-span-2"
              help="Formatting: “## Heading”, “- list item”, **bold**, *italic*, [link text](https://…). Blank line = new paragraph."
            />
            <TextField name="seoTitle" label="SEO title" defaultValue={p?.seoTitle} />
            <TextField name="seoDescription" label="Meta description" defaultValue={p?.seoDescription} />
          </div>
        </Card>
        <div className="flex flex-wrap items-center gap-3">
          <Toggle name="published" label="Published" defaultChecked={p?.published ?? false} />
          <Toggle name="showInFooter" label="Link in footer" defaultChecked={p?.showInFooter ?? true} />
          <SubmitButton className="ml-auto">Save page</SubmitButton>
        </div>
      </AdminForm>
    </>
  );
}
