import type { Metadata } from "next";
import { AdminForm, ColorField, SubmitButton, TextArea, TextField } from "@/components/admin/form";
import { ImagePicker } from "@/components/admin/editors";
import { Card, PageHeader } from "@/components/admin/ui";
import { saveSiteSettings } from "@/app/actions/admin/settings";
import { requireUser } from "@/lib/auth";
import { getMediaOptions } from "@/lib/admin-data";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Site settings" };

export default async function SettingsAdmin() {
  await requireUser("admin");
  const [site, media] = await Promise.all([getSiteSettings(), getMediaOptions()]);
  return (
    <>
      <PageHeader title="Site settings" description="Contact details, brand and default search engine settings. Empty contact fields are simply hidden on the website." />
      <AdminForm action={saveSiteSettings} className="space-y-6">
        <Card title="Business & contact" description="Use only the business's own verified details.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField name="siteName" label="Business name" defaultValue={site.siteName} />
            <TextField name="tagline" label="Tagline" defaultValue={site.tagline} />
            <TextField name="phone" label="Phone" defaultValue={site.contact.phone} placeholder="+91 …" />
            <TextField name="whatsapp" label="WhatsApp number" defaultValue={site.contact.whatsapp} placeholder="+91 …" />
            <TextField name="email" label="Email" defaultValue={site.contact.email} />
            <TextField name="mapUrl" label="Google Maps link" defaultValue={site.contact.mapUrl} />
            <TextArea name="address" label="Address" defaultValue={site.contact.address} rows={3} />
            <TextArea name="hours" label="Opening hours" defaultValue={site.contact.hours} rows={3} />
            <TextField name="announcement" label="Announcement bar" defaultValue={site.announcement} className="md:col-span-2" help="Optional short message shown at the top of every page." />
          </div>
        </Card>
        <Card title="Social">
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="instagram" label="Instagram URL" defaultValue={site.social.instagram} />
            <TextField name="facebook" label="Facebook URL" defaultValue={site.social.facebook} />
            <TextField name="youtube" label="YouTube URL" defaultValue={site.social.youtube} />
          </div>
        </Card>
        <Card title="Brand" description="Colours apply across the whole website. Keep enough contrast between Ink and Ivory for readability.">
          <div className="grid gap-4 md:grid-cols-4">
            <ColorField name="colorInk" label="Ink (dark)" defaultValue={site.colors.ink} />
            <ColorField name="colorIvory" label="Ivory (light)" defaultValue={site.colors.ivory} />
            <ColorField name="colorAccent" label="Accent (gold)" defaultValue={site.colors.accent} />
            <ColorField name="colorForest" label="Secondary (forest)" defaultValue={site.colors.forest} />
          </div>
          <div className="mt-6"><ImagePicker name="logoMediaId" label="Logo" media={media} value={site.logoMediaId} help="A transparent PNG works best on the dark header. Leave empty to use the text logo." /></div>
        </Card>
        <Card title="Search engines & sharing">
          <div className="grid gap-4">
            <TextField name="seoTitle" label="Default page title" defaultValue={site.seo.defaultTitle} />
            <TextArea name="seoDescription" label="Default meta description" defaultValue={site.seo.defaultDescription} rows={2} />
            <ImagePicker name="ogImageId" label="Default social sharing image" media={media} value={site.seo.ogImageId} />
          </div>
        </Card>
        <div className="flex justify-end"><SubmitButton>Save settings</SubmitButton></div>
      </AdminForm>
    </>
  );
}
