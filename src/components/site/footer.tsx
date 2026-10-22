import Link from "next/link";
import { HomeLink } from "./home-link";
import { Logo } from "./logo";
import { cacheLife } from "next/cache";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import type { NavItem } from "./header";
import { phoneDigits, whatsappLink } from "@/lib/utils";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer({
  site,
  nav,
  pages,
}: {
  site: SiteSettings;
  nav: NavItem[];
  pages: { slug: string; title: string }[];
}) {
  const c = site.contact;
  const hasContact = c.phone || c.email || c.address || c.whatsapp;
  const socials = Object.entries(site.social).filter(([, v]) => v);
  return (
    <footer className="relative overflow-hidden bg-ink-deep text-ivory/80">
      <div className="container-x grid gap-14 py-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <HomeLink label={`${site.siteName} — back to top`} className="inline-block"><Logo tone="light" className="h-14" /></HomeLink>
          <p className="mt-5 max-w-sm leading-relaxed text-ivory/65">{site.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/plan" className="btn btn-primary">Plan your journey</Link>
          </div>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <p className="eyebrow eyebrow-light mb-5">Explore</p>
          <ul className="space-y-3">
            {nav.map((n) => (
              <li key={n.href}>
                <Link className="link-underline hover:text-ivory" href={n.href}>{n.label}</Link>
              </li>
            ))}
            <li><Link className="link-underline hover:text-ivory" href="/faq">FAQs</Link></li>
          </ul>
        </nav>

        <div className="md:col-span-4">
          <p className="eyebrow eyebrow-light mb-5">Get in touch</p>
          {hasContact ? (
            <ul className="space-y-4">
              {c.phone && (
                <li className="flex gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <a className="hover:text-ivory" href={`tel:${phoneDigits(c.phone)}`}>{c.phone}</a></li>
              )}
              {c.whatsapp && (
                <li className="flex gap-3"><span aria-hidden className="mt-0.5 w-4 text-center text-xs font-bold text-accent">WA</span>
                  <a className="hover:text-ivory" href={whatsappLink(c.whatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp {c.whatsapp}</a></li>
              )}
              {c.email && (
                <li className="flex gap-3"><Mail className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <a className="break-all hover:text-ivory" href={`mailto:${c.email}`}>{c.email}</a></li>
              )}
              {c.address && (
                <li className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <span className="whitespace-pre-line">{c.address}</span></li>
              )}
              {c.hours && (
                <li className="flex gap-3"><Clock className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <span className="whitespace-pre-line">{c.hours}</span></li>
              )}
            </ul>
          ) : (
            <p className="leading-relaxed">
              Send us an enquiry and we&apos;ll get back to you. <Link href="/contact" className="text-accent underline underline-offset-4">Contact us</Link>
            </p>
          )}
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-4 text-sm">
              {socials.map(([k, v]) => (
                <li key={k}><a href={v} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-ivory">{k}</a></li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-line-light">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-ivory/50 md:flex-row md:items-center md:justify-between">
          <p>© <CurrentYear /> {site.siteName}. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {pages.map((p) => (
              <li key={p.slug}><Link className="hover:text-ivory" href={`/info/${p.slug}`}>{p.title}</Link></li>
            ))}
            <li><Link className="hover:text-ivory" href="/credits">Photo credits</Link></li>
          </ul>
        </div>
        <p className="container-x border-t border-line-light py-4 text-center text-sm text-ivory/70 md:pb-24">
          Designed and developed with <span role="img" aria-label="love">❤️</span> by{" "}
          <a
            href="https://naazailabs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-accent/15 px-1.5 py-0.5 font-bold text-accent transition-colors hover:bg-accent hover:text-ink"
          >
            Naaz AI Labs
          </a>
        </p>
      </div>
    </footer>
  );
}
