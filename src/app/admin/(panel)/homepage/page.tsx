import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminForm, SubmitButton, TextArea, TextField } from "@/components/admin/form";
import { GalleryPicker, ImagePicker } from "@/components/admin/editors";
import { PointsEditor, SectionOrderEditor } from "@/components/admin/home-editors";
import { Card, PageHeader } from "@/components/admin/ui";
import { saveHomeSettings } from "@/app/actions/admin/settings";
import { requireUser } from "@/lib/auth";
import { getMediaOptions } from "@/lib/admin-data";
import { getHomeSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Homepage" };

function CopyBlock({ k, title, v }: { k: string; title: string; v: { eyebrow: string; heading: string; intro?: string } }) {
  return (
    <Card title={title}>
      <div className="grid gap-4 md:grid-cols-3">
        <TextField name={`${k}.eyebrow`} label="Eyebrow" defaultValue={v.eyebrow} />
        <TextField name={`${k}.heading`} label="Heading" defaultValue={v.heading} className="md:col-span-2" />
        {v.intro !== undefined && <TextArea name={`${k}.intro`} label="Introduction" defaultValue={v.intro} rows={2} className="md:col-span-3" />}
      </div>
    </Card>
  );
}

export default async function HomepageAdmin() {
  await requireUser("admin");
  const [home, media] = await Promise.all([getHomeSettings(), getMediaOptions()]);
  return (
    <>
      <PageHeader
        title="Homepage"
        description="Edit copy and images, and choose which sections appear and in what order."
        actions={<Link href="/" target="_blank" className="btn btn-ghost !py-2"><ExternalLink className="size-4" /> View homepage</Link>}
      />
      <AdminForm action={saveHomeSettings} className="space-y-6">
        <Card title="Sections & order"><SectionOrderEditor initial={home.sections} /></Card>
        <Card title="Hero">
          <div className="grid gap-4">
            <TextField name="hero.eyebrow" label="Eyebrow" defaultValue={home.hero.eyebrow} />
            <TextField name="hero.headline" label="Headline" defaultValue={home.hero.headline} />
            <TextArea name="hero.subhead" label="Supporting copy" defaultValue={home.hero.subhead} rows={2} />
            <div>
              <p className="field-label">Slideshow images</p>
              <GalleryPicker name="hero.imageIds" idsOnly captions={false} media={media} value={home.hero.imageIds.map((mediaId) => ({ mediaId }))} />
              <p className="mt-2 text-xs text-muted">Captions under the slideshow come from each image&apos;s description in the media library.</p>
            </div>
          </div>
        </Card>
        <CopyBlock k="experiences" title="Featured experiences" v={home.experiences} />
        <CopyBlock k="destinations" title="Explore destinations" v={home.destinations} />
        <CopyBlock k="tours" title="Tour packages" v={home.tours} />
        <CopyBlock k="services" title="Vehicle hire & hotels" v={home.services} />
        <Card title="Why travel with us">
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="why.eyebrow" label="Eyebrow" defaultValue={home.why.eyebrow} />
            <TextField name="why.heading" label="Heading" defaultValue={home.why.heading} className="md:col-span-2" />
          </div>
          <div className="mt-4"><PointsEditor name="why.points" initial={home.why.points} /></div>
          <p className="mt-2 text-xs text-muted">Keep these factual — avoid statistics or awards that can&apos;t be verified.</p>
        </Card>
        <CopyBlock k="testimonials" title="Testimonials" v={home.testimonials} />
        <CopyBlock k="faqs" title="FAQs" v={home.faqs} />
        <Card title="Closing call to action">
          <div className="grid gap-4">
            <TextField name="cta.heading" label="Heading" defaultValue={home.cta.heading} />
            <TextArea name="cta.body" label="Text" defaultValue={home.cta.body} rows={2} />
            <ImagePicker name="cta.imageId" label="Background image" media={media} value={home.cta.imageId} />
          </div>
        </Card>
        <div className="sticky bottom-0 flex justify-end border-t border-line bg-paper/95 py-4 backdrop-blur"><SubmitButton>Save homepage</SubmitButton></div>
      </AdminForm>
    </>
  );
}
