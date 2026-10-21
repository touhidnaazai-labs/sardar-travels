import { Footer } from "@/components/site/footer";
import { ActionBar, Header, type NavItem } from "@/components/site/header";
import { JsonLd } from "@/components/site/json-ld";
import { Analytics } from "@/components/site/analytics";
import { MotionProvider } from "@/components/site/motion-provider";
import { ScrollTopOnLoad } from "@/components/site/scroll-top-on-load";
import { ToastHost } from "@/components/site/toast";
import { getFooterPages, getMediaMap, getServicesSettings, getSiteSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [site, services, pages, media] = await Promise.all([
    getSiteSettings(),
    getServicesSettings(),
    getFooterPages(),
    getMediaMap(),
  ]);
  const nav: NavItem[] = [
    { href: "/tours", label: "Tours" },
    { href: "/destinations", label: "Destinations" },
    ...(services.vehicle.enabled ? [{ href: "/vehicle-hire", label: "Vehicle hire" }] : []),
    ...(services.hotel.enabled ? [{ href: "/hotels", label: "Hotels" }] : []),
    ...(services.intercity.enabled ? [{ href: "/intercity", label: "Intercity" }] : []),
    { href: "/contact", label: "Contact" },
  ];
  const lines = site.contact.address.split("\n").map((l) => l.trim()).filter(Boolean);
  const landmark = lines.length > 2 ? `${lines[1]}, ${lines[2].split(",")[0]}` : (lines[0] ?? "");
  return (
    <MotionProvider>
      {(site.contact.phone || site.contact.address) && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            name: site.siteName,
            url: siteUrl("/"),
            ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
            ...(site.contact.email ? { email: site.contact.email } : {}),
            ...(site.contact.address ? { address: site.contact.address.replace(/\n+/g, ", ") } : {}),
            ...(site.contact.mapUrl ? { hasMap: site.contact.mapUrl } : {}),
          }}
        />
      )}
      <Header
        siteName={site.siteName}
        logo={site.logoMediaId ? media[site.logoMediaId] : undefined}
        nav={nav}
        phone={site.contact.phone}
        whatsapp={site.contact.whatsapp}
        landmark={landmark}
        announcement={site.announcement}
      />
      <main id="main">{children}</main>
      <Footer site={site} nav={nav} pages={pages} />
      <ScrollTopOnLoad />
      <ToastHost />
      <Analytics />
      <ActionBar phone={site.contact.phone} whatsapp={site.contact.whatsapp} />
      <div aria-hidden className="h-[4.5rem] md:hidden" />
    </MotionProvider>
  );
}
