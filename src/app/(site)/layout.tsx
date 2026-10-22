import { Suspense } from "react";
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
  const bookings = [
    ...(services.flight.enabled ? [{ href: "/flight-booking", label: "Flights", hint: "Domestic & international" }] : []),
    ...(services.train.enabled ? [{ href: "/train-booking", label: "Trains", hint: "Train ticket booking" }] : []),
    ...(services.visa.enabled ? [{ href: "/visa", label: "Visa assistance", hint: "Documents & applications" }] : []),
    ...(services.hotel.enabled ? [{ href: "/hotels", label: "Hotels", hint: "Mysuru, Ooty, Kodaikanal" }] : []),
    ...(services.vehicle.enabled ? [{ href: "/vehicle-hire", label: "Vehicle hire", hint: "Cars, vans & more" }] : []),
    ...(services.intercity.enabled ? [{ href: "/intercity", label: "Intercity buses", hint: "Overnight services" }] : []),
  ];
  const nav: NavItem[] = [
    {
      href: "/tours",
      label: "Packages",
      children: [
        { href: "/tours", label: "Mysuru & local tours", hint: "Day trips and short holidays" },
        { href: "/national-packages", label: "National packages", hint: "Kashmir, Goa, Kerala & more" },
        ...(services.international.enabled ? [{ href: "/international-packages", label: "International packages", hint: "Holidays abroad" }] : []),
      ],
    },
    { href: "/destinations", label: "Destinations" },
    ...(bookings.length ? [{ href: bookings[0].href, label: "Bookings", children: bookings }] : []),
    { href: "/contact", label: "Contact" },
  ];
  // The footer shows every link, one level.
  const footerNav = nav.flatMap((n) => (n.children ? n.children.map((c) => ({ href: c.href, label: c.label })) : [{ href: n.href, label: n.label }]));
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
      <Footer site={site} nav={footerNav} pages={pages} />
      <Suspense fallback={null}>
        <ScrollTopOnLoad />
      </Suspense>
      <ToastHost />
      <Analytics />
      <ActionBar phone={site.contact.phone} whatsapp={site.contact.whatsapp} />
      <div aria-hidden className="h-[4.5rem] md:hidden" />
    </MotionProvider>
  );
}
