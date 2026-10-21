import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { EnquiryWizard } from "@/components/forms/enquiry-wizard";
import { PageHero } from "@/components/site/page-hero";
import { getHomeSettings, getMediaMap, getSiteSettings } from "@/lib/data";
import { phoneDigits, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with Sardar Travels about tours, vehicle hire and hotel reservations.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [site, media, home] = await Promise.all([getSiteSettings(), getMediaMap(), getHomeSettings()]);
  const c = site.contact;
  const items = [
    c.phone && { icon: Phone, label: "Call", value: c.phone, href: `tel:${phoneDigits(c.phone)}` },
    c.whatsapp && { icon: MessageCircle, label: "WhatsApp", value: c.whatsapp, href: whatsappLink(c.whatsapp, "Hello Sardar Travels, I'd like to enquire about a trip.") },
    c.email && { icon: Mail, label: "Email", value: c.email, href: `mailto:${c.email}` },
    c.address && { icon: MapPin, label: "Visit", value: c.address, href: c.mapUrl || undefined },
    c.hours && { icon: Clock, label: "Hours", value: c.hours },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];
  const heroId = home.hero.imageIds[2] ?? home.hero.imageIds[0];
  return (
    <>
      <PageHero size="sm" eyebrow="Contact" title="Let’s plan something good" intro="Send us a message and we’ll get back to you." media={heroId ? media[heroId] : undefined} crumbs={[{ href: "/contact", label: "Contact" }]} />
      <div className="container-x grid gap-14 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          {items.length > 0 ? (
            <ul className="divide-y divide-line border-y border-line">
              {items.map((it) => (
                <li key={it.label} className="flex gap-5 py-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ivory text-accent-strong"><it.icon className="size-5" aria-hidden /></span>
                  <div>
                    <p className="eyebrow">{it.label}</p>
                    {it.href ? (
                      <a href={it.href} className="mt-1 block font-display text-xl break-words whitespace-pre-line hover:text-accent-strong" {...(it.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{it.value}</a>
                    ) : (
                      <p className="mt-1 font-display text-xl whitespace-pre-line">{it.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-[1.5rem] bg-ivory p-8">
              <p className="font-display text-2xl font-medium">The quickest way to reach us is the form.</p>
              <p className="mt-3 text-muted">Leave your phone number or email and we’ll get back to you.</p>
            </div>
          )}
        </div>
        <section className="lg:col-span-7" aria-labelledby="contact-form-h">
          <h2 id="contact-form-h" className="mb-8 text-[clamp(1.8rem,3.2vw,2.4rem)] font-medium">Send a message</h2>
          <EnquiryWizard type="general" tripFields={[]} tone="card" submitLabel="Send message" />
        </section>
      </div>
    </>
  );
}
