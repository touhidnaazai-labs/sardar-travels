import Link from "next/link";
import { ArrowRight, BadgeCheck, Bus, Car, Compass, Globe, Hotel, Map, MapPin, MessageCircle, Phone, PhoneCall, Plane, ReceiptText, Route, ShieldCheck, Star, Stamp, TrainFront } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { QuickQuote } from "@/components/forms/quick-quote";
import { AccentText } from "@/components/site/accent-text";
import { FaqList } from "@/components/site/faq-list";
import { MediaImage } from "@/components/site/media-image";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { TourCard } from "@/components/site/tour-card";
import {
  getHomeSettings,
  getMediaMap,
  getPublishedBusRoutes,
  getPublishedDestinations,
  getPublishedFaqs,
  getPublishedTours,
  getServicesSettings,
  getSiteSettings,
  getVerifiedTestimonials,
} from "@/lib/data";
import type { HomeSectionKey } from "@/lib/settings";
import { cn, phoneDigits, whatsappLink } from "@/lib/utils";

import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [home, services, site, media, tours, destinations, faqs, testimonials, busRoutes] = await Promise.all([
    getHomeSettings(),
    getServicesSettings(),
    getSiteSettings(),
    getMediaMap(),
    getPublishedTours(),
    getPublishedDestinations(),
    getPublishedFaqs(),
    getVerifiedTestimonials(),
    getPublishedBusRoutes(),
  ]);
  const c = site.contact;
  const tel = c.phone ? `tel:${phoneDigits(c.phone)}` : "";
  const wa = c.whatsapp ? whatsappLink(c.whatsapp, "Hello Sardar Travels, I'd like to plan a trip.") : "";
  const landmark = c.address.split("\n").find((l) => /opp\.|near|behind/i.test(l));

  const featured = tours.filter((t) => t.featured && t.category !== "national-package");
  const popular = (featured.length >= 3 ? featured : tours.filter((t) => t.category !== "national-package")).slice(0, 6);
  const more = tours.filter((t) => !popular.some((p) => p.id === t.id));

  const chips = ["Pickup & drop complimentary", "No payment to enquire", "50% refund if cancelled 24 hrs before", ...(landmark ? [`Office ${landmark.trim()}`] : [])];
  const quoteOptions = [
    ...tours.map((t) => ({ value: t.id, label: t.title, tourId: t.id })),
    ...(services.vehicle.enabled ? [{ value: "vehicle", label: "Vehicle / cab hire" }] : []),
    ...(services.hotel.enabled ? [{ value: "hotel", label: "Hotel booking" }] : []),
    ...(services.flight.enabled ? [{ value: "flight", label: "Flight booking" }] : []),
    ...(services.train.enabled ? [{ value: "train", label: "Train booking" }] : []),
    ...(services.visa.enabled ? [{ value: "visa", label: "Visa assistance" }] : []),
    ...(services.international.enabled ? [{ value: "international", label: "International package" }] : []),
    { value: "custom", label: "A custom holiday" },
  ];

  const sections: Record<HomeSectionKey, () => React.ReactNode> = {
    hero: () => (
      <Hero
        key="hero"
        eyebrow={home.hero.eyebrow}
        headline={home.hero.headline}
        subhead={home.hero.subhead}
        phone={c.phone}
        whatsapp={c.whatsapp}
        chips={chips}
        options={quoteOptions}
        slides={home.hero.imageIds.map((id) => media[id]).filter(Boolean).map((m) => ({ media: m, caption: m.alt }))}
      />
    ),

    planner: () => (
      <section key="planner" className="pt-20 pb-12 md:pt-28 md:pb-20" aria-labelledby="steps-h">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-6">
              <p className="eyebrow">How it works</p>
              <h2 id="steps-h" className="mt-3 text-[clamp(2rem,4.2vw,3.3rem)] leading-[1.05] font-semibold">
                From first message to the road, <AccentText text="*in three steps*" />
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.08}>
              <p className="leading-relaxed text-muted">
                We’re a Mysuru team that plans day trips and holidays, and arranges the vehicle and hotel as well. You always see the price before you commit.
              </p>
            </Reveal>
          </div>
          <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
            <span aria-hidden className="route-line absolute top-7 right-[16%] left-[16%] hidden h-1 md:block" />
            {([
              [PhoneCall, "Share your plan", "Use the quote bar, call or WhatsApp us. Tell us where, when and how many."],
              [ReceiptText, "Receive a clear quote", "We call back with the itinerary and an exact price. Asking is always free."],
              [Car, "Confirm and travel", "Accept the quote and we lock it in. Pickup and drop come at no extra cost."],
            ] as const).map(([Icon, t, b], i) => (
              <Reveal as="li" key={t} delay={i * 0.08} className="relative">
                <span className="relative z-10 grid size-14 place-items-center rounded-2xl bg-ink text-accent"><Icon className="size-6" aria-hidden /></span>
                <p className="mt-5 text-xs font-bold tracking-[0.18em] text-forest uppercase">Step {i + 1}</p>
                <h3 className="mt-1 text-2xl font-semibold">{t}</h3>
                <p className="mt-2 max-w-xs leading-relaxed text-muted">{b}</p>
              </Reveal>
            ))}
          </ol>
          <ul className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
            {[[String(tours.length), "ready-made tour packages"], [String(destinations.length), "destinations covered"], ["3 cities", "hotel reservations"], ["24 hrs", "for a 50% refund"]].map(([n, l]) => (
              <li key={l} className="bg-white p-6 md:p-8">
                <p className="font-display text-4xl font-semibold md:text-5xl">{n}</p>
                <p className="mt-1 text-sm text-muted">{l}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    ),

    experiences: () =>
      popular.length > 0 && (
        <section key="experiences" className="bg-ivory py-16 md:py-24">
          <div className="container-x">
            <SectionHeading
              eyebrow={home.experiences.eyebrow}
              title={home.experiences.heading}
              intro={home.experiences.intro}
              action={<Link href="/tours" className="btn btn-dark">All {tours.length} tours <ArrowRight className="size-4" aria-hidden /></Link>}
            />
            <ul className="mt-12 grid gap-5 lg:grid-cols-3">
              {popular.map((t, i) => (
                <Reveal as="li" key={t.id} delay={(i % 3) * 0.06} className={cn(i === 0 && "lg:col-span-2 lg:row-span-2")}>
                  <TourCard tour={t} media={media} variant={i === 0 ? "feature" : "card"} priority={i < 2} className={i === 0 ? "h-full" : undefined} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ),

    tours: () => {
      const local = more.filter((t) => t.category !== "national-package" && t.category !== "international-package");
      const national = tours.filter((t) => t.category === "national-package");
      return (
        (local.length > 0 || national.length > 0) && (
          <section key="tours" className="py-16 md:py-24">
            <div className="container-x space-y-20">
              {local.length > 0 && (
                <div>
                  <SectionHeading eyebrow={home.tours.eyebrow} title={home.tours.heading} intro={home.tours.intro} />
                  <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {local.map((t, i) => (
                      <Reveal as="li" key={t.id} delay={(i % 3) * 0.06}><TourCard tour={t} media={media} /></Reveal>
                    ))}
                  </ul>
                </div>
              )}
              {national.length > 0 && (
                <div>
                  <SectionHeading
                    eyebrow="Across India"
                    title="National *tour packages*"
                    intro="Kashmir, Goa, Kerala, Himachal, Delhi and the temple towns of Tamil Nadu — planned around your dates and group."
                    action={<Link href="/national-packages" className="btn btn-ghost">All national packages <ArrowRight className="size-4" aria-hidden /></Link>}
                  />
                  <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {national.slice(0, 6).map((t, i) => (
                      <Reveal as="li" key={t.id} delay={(i % 3) * 0.06}><TourCard tour={t} media={media} /></Reveal>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )
      );
    },

    destinations: () =>
      destinations.length > 0 && (
        <section key="destinations" className="py-16 md:py-24">
          <div className="container-x">
            <SectionHeading
              eyebrow={home.destinations.eyebrow}
              title={home.destinations.heading}
              intro={home.destinations.intro}
              action={<Link href="/destinations" className="btn btn-ghost">All destinations <ArrowRight className="size-4" aria-hidden /></Link>}
            />
            <ul className="mt-12 grid auto-rows-[11rem] grid-cols-2 gap-3 md:auto-rows-[13rem] md:grid-cols-4">
              {destinations.slice(0, 7).map((d, i) => (
                <Reveal as="li" key={d.id} delay={(i % 4) * 0.05} className={cn(i === 0 && "col-span-2 row-span-2", i === 3 && "md:col-span-2")}>
                  <Link href={`/destinations/${d.slug}`} className="group relative block h-full overflow-hidden rounded-2xl bg-sand">
                    <MediaImage media={d.heroImageId ? media[d.heroImageId] : undefined} sizes={i === 0 ? "(min-width:768px) 50vw, 100vw" : "(min-width:768px) 25vw, 50vw"} className="transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(9,17,38,.85))]" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
                      <p className={cn("leading-tight font-semibold", i === 0 ? "text-3xl md:text-4xl" : "text-xl")}>{d.name}</p>
                      <p className="mt-0.5 text-xs text-white/75">{d.tourCount ? `${d.tourCount} ${d.tourCount === 1 ? "tour" : "tours"}` : d.region}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ),

    services: () => {
      const nationalHero = tours.find((t) => t.category === "national-package")?.heroImageId;
      const tiles = [
        { href: "/tours", title: "Mysuru & local tours", body: "Palaces, hill stations, temples and waterfalls", icon: Map, img: home.hero.imageIds[0] },
        { href: "/national-packages", title: "National packages", body: "Kashmir, Goa, Kerala, Shimla, Delhi & more", icon: Compass, img: nationalHero },
        ...(services.international.enabled ? [{ href: "/international-packages", title: services.international.heading, body: "Holidays abroad, planned for you", icon: Globe, img: services.international.imageId }] : []),
        ...(services.flight.enabled ? [{ href: "/flight-booking", title: services.flight.heading, body: "Domestic and international flights", icon: Plane, img: services.flight.imageId }] : []),
        ...(services.train.enabled ? [{ href: "/train-booking", title: services.train.heading, body: "Help booking your train journey", icon: TrainFront, img: services.train.imageId }] : []),
        ...(services.visa.enabled ? [{ href: "/visa", title: services.visa.heading, body: "Documents and applications, guided", icon: Stamp, img: services.visa.imageId }] : []),
        ...(services.vehicle.enabled ? [{ href: "/vehicle-hire", title: services.vehicle.heading, body: `In ${services.vehicle.serviceAreas.join(", ")}`, icon: Car, img: services.vehicle.imageId }] : []),
        ...(services.hotel.enabled ? [{ href: "/hotels", title: services.hotel.heading, body: `In ${services.hotel.destinations.join(", ")}`, icon: Hotel, img: services.hotel.imageId }] : []),
      ];
      return (
        <section key="services" className="bg-ivory py-16 md:py-24">
          <div className="container-x">
            <SectionHeading eyebrow={home.services.eyebrow} title={home.services.heading} intro={home.services.intro} />
            <ul className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {tiles.map((t, i) => (
                <Reveal as="li" key={t.href} delay={(i % 4) * 0.05}>
                  <Link href={t.href} className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-ink p-4 text-white md:aspect-[4/3] md:p-5">
                    <MediaImage media={t.img ? media[t.img] : undefined} sizes="(min-width: 768px) 25vw, 50vw" className="-z-10 transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,17,38,.05)_30%,rgba(9,17,38,.88))]" />
                    <span className="absolute top-3 left-3 grid size-9 place-items-center rounded-lg bg-white text-ink md:top-4 md:left-4"><t.icon className="size-[1.15rem]" aria-hidden /></span>
                    <p className="text-lg leading-tight font-semibold md:text-xl">{t.title}</p>
                    <p className="mt-1 text-xs leading-snug text-white/75 md:text-sm">{t.body}</p>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      );
    },

    intercity: () =>
      services.intercity.enabled &&
      busRoutes.length > 0 && (
        <section key="intercity" className="py-16 md:py-24">
          <div className="container-x grid gap-10 rounded-3xl bg-ink p-8 text-white md:p-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow eyebrow-light">Intercity travel</p>
              <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{services.intercity.heading}</h2>
              <p className="mt-4 text-white/80">{services.intercity.intro}</p>
              <Link href="/intercity" className="btn btn-primary mt-6"><Bus className="size-4" aria-hidden /> Route enquiry</Link>
              <p className="mt-5 text-xs text-white/60">{services.intercity.disclaimer}</p>
            </div>
            <div className="flex flex-wrap content-start gap-2">
              {busRoutes.map((r) => <span key={r.id} className="rounded-full bg-white/10 px-3 py-1.5 text-sm">{r.destination}</span>)}
            </div>
          </div>
        </section>
      ),

    why: () => (
      <section key="why" className="py-16 md:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow={home.why.eyebrow} title={home.why.heading} />
            <ul className="mt-12 grid gap-5 sm:grid-cols-2">
              {home.why.points.map((p, i) => (
                <Reveal as="li" key={i} delay={(i % 2) * 0.06} className="rounded-2xl border border-line bg-white p-6">
                  <BadgeCheck className="size-7 text-forest" aria-hidden />
                  <h3 className="mt-4 text-xl font-semibold">{p.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{p.body}</p>
                </Reveal>
              ))}
            </ul>
          </div>
          <Reveal className="lg:col-span-5" delay={0.1}>
            <div className="h-full rounded-3xl bg-ink p-8 text-white md:p-9">
              <p className="flex items-center gap-2 text-sm font-bold text-accent"><ShieldCheck className="size-5" aria-hidden /> Terms, stated plainly</p>
              <dl className="mt-6 space-y-5">
                {[
                  ["Pickup & drop", "Provided free of charge on our tours."],
                  ["Cancellation", "50% refund if you cancel at least 24 hours before the trip."],
                  ["Paid separately", "Government entrance fees, guide, parking and tolls."],
                  ["Your quote", "Lists exactly what’s included. Nothing is booked until you accept it."],
                ].map(([k, v]) => (
                  <div key={k} className="border-b border-white/12 pb-5 last:border-0 last:pb-0">
                    <dt className="font-semibold">{k}</dt>
                    <dd className="mt-1 text-sm text-white/70">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/info/booking-terms" className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline">Full booking terms <ArrowRight className="size-4" aria-hidden /></Link>
            </div>
          </Reveal>
        </div>
      </section>
    ),

    testimonials: () =>
      testimonials.length > 0 && (
        <section key="testimonials" className="bg-ivory py-16 md:py-24">
          <div className="container-x">
            <SectionHeading eyebrow={home.testimonials.eyebrow} title={home.testimonials.heading} />
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <Reveal as="article" key={t.id} delay={(i % 3) * 0.06} className="flex flex-col rounded-2xl bg-white p-7">
                  <p className="flex gap-0.5 text-accent" aria-label="Verified traveller review">{Array.from({ length: 5 }, (_, k) => <Star key={k} className="size-4 fill-current" aria-hidden />)}</p>
                  <blockquote className="mt-4 flex-1 text-lg leading-relaxed">“{t.quote}”</blockquote>
                  <footer className="mt-5 text-sm"><p className="font-semibold">{t.name}</p><p className="text-muted">{[t.location, t.travelledOn].filter(Boolean).join(" · ")}</p></footer>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ),

    faqs: () => {
      const items = faqs.filter((f) => f.showOnHome);
      return (
        items.length > 0 && (
          <section key="faqs" className="bg-ivory py-16 md:py-24">
            <div className="container-x grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <SectionHeading eyebrow={home.faqs.eyebrow} title={home.faqs.heading} />
                <div className="mt-8 rounded-2xl bg-white p-6">
                  <p className="font-semibold">Prefer to talk it through?</p>
                  <p className="mt-1 text-sm text-muted">Our team is happy to help — free, with no obligation.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tel && <a href={tel} className="btn btn-dark !py-2.5"><Phone className="size-4" aria-hidden /> Call</a>}
                    {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp !py-2.5"><MessageCircle className="size-4" aria-hidden /> WhatsApp</a>}
                    <Link href="/faq" className="btn btn-ghost !py-2.5">All FAQs</Link>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8"><FaqList items={items.map((f) => ({ q: f.question, a: f.answer }))} /></div>
            </div>
          </section>
        )
      );
    },

    cta: () => (
      <section key="cta" className="relative isolate overflow-hidden bg-ink py-20 text-white md:py-28">
        <MediaImage media={home.cta.imageId ? media[home.cta.imageId] : undefined} sizes="100vw" className="-z-10 opacity-40" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(9,17,38,.92),rgba(9,17,38,.55))]" />
        <div className="container-x grid items-center gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <h2 className="text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[1.03] font-semibold"><AccentText text={home.cta.heading} /></h2>
            <p className="mt-5 max-w-md text-lg text-white/80">{home.cta.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {tel && <a href={tel} className="btn btn-primary"><Phone className="size-4" aria-hidden /> {c.phone}</a>}
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp"><MessageCircle className="size-4" aria-hidden /> WhatsApp</a>}
            </div>
            {c.address && (
              <address className="mt-8 flex max-w-sm items-start gap-3 text-sm leading-relaxed whitespace-pre-line text-white/75 not-italic">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <span>{c.address}{c.mapUrl && <> <a href={c.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1.5 font-semibold text-accent hover:underline"><Route className="size-4" aria-hidden /> Get directions</a></>}</span>
              </address>
            )}
          </Reveal>
          <Reveal className="lg:col-span-6" delay={0.1}>
            <QuickQuote options={quoteOptions} title="Request your quote" subtitle="Takes under a minute." />
          </Reveal>
        </div>
      </section>
    ),
  };

  return <>{home.sections.filter((s) => s.enabled).map((s) => sections[s.key]())}</>;
}
