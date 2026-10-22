import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BedDouble, Calendar, Car, Check, Clock, MapPin, MessageCircle, Minus, Phone, Route, Users } from "lucide-react";
import { EnquiryWizard } from "@/components/forms/enquiry-wizard";
import { FaqList } from "@/components/site/faq-list";
import { Gallery } from "@/components/site/gallery";
import { ItineraryTimeline } from "@/components/site/itinerary-timeline";
import { JsonLd } from "@/components/site/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { PriceTag, TourCard } from "@/components/site/tour-card";
import { getMediaMap, getPublishedTours, getSiteSettings, getTourBySlug } from "@/lib/data";
import { tourEnquiryFields } from "@/lib/enquiry-forms";
import { CATEGORY_LABELS, STYLE_LABELS, durationText, formatPrice, phoneDigits, siteUrl, whatsappLink } from "@/lib/utils";

export async function generateStaticParams() {
  const tours = await getPublishedTours();
  return tours.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(props: PageProps<"/tours/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const [tour, media] = await Promise.all([getTourBySlug(slug), getMediaMap()]);
  if (!tour) return { title: "Tour not found", robots: { index: false } };
  const img = tour.heroImageId ? media[tour.heroImageId] : undefined;
  const description = tour.seoDescription || tour.summary.slice(0, 160);
  return {
    title: { absolute: tour.seoTitle || `${tour.title} — ${durationText(tour)} tour` },
    description,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      title: tour.title,
      description,
      url: `/tours/${tour.slug}`,
      ...(img ? { images: [{ url: img.src, width: img.width, height: img.height, alt: img.alt }] } : {}),
    },
  };
}

export default function TourPage(props: PageProps<"/tours/[slug]">) {
  return (
    <Suspense fallback={<TourSkeleton />}>
      <TourContent params={props.params} />
    </Suspense>
  );
}

function TourSkeleton() {
  return (
    <>
      <div className="min-h-[88svh] bg-ink" />
      <div className="container-x grid gap-8 py-20 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="skeleton h-10 w-2/3" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
        </div>
        <div className="skeleton h-64" />
      </div>
    </>
  );
}

const paragraphs = (s: string) => s.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

async function TourContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [tour, media, allTours, site] = await Promise.all([getTourBySlug(slug), getMediaMap(), getPublishedTours(), getSiteSettings()]);
  if (!tour) notFound();

  const hero = tour.heroImageId ? media[tour.heroImageId] : undefined;
  const gallery = tour.gallery.filter((g) => media[g.mediaId]).map((g) => ({ media: media[g.mediaId], caption: g.caption }));
  const destSlugs = new Set(tour.destinations.map((d) => d.slug));
  const related = allTours
    .filter((t) => t.id !== tour.id)
    .map((t) => ({ t, score: t.destinations.filter((d) => destSlugs.has(d.slug)).length * 2 + (t.category === tour.category ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.t);
  const stopCount = tour.itinerary.reduce((n, d) => n + d.stops.length, 0);
  const upcoming = tour.availabilityMode === "scheduled" ? tour.availableDates.slice(0, 8) : [];

  const facts = [
    { icon: Clock, label: "Duration", value: durationText(tour) },
    tour.departureTime && { icon: Calendar, label: "Departure", value: tour.departureTime },
    tour.startPoint && { icon: MapPin, label: "Starts from", value: tour.startPoint },
    tour.transport && { icon: Car, label: "Travel", value: tour.transport },
    STYLE_LABELS[tour.tourStyle] && { icon: Users, label: "Tour style", value: STYLE_LABELS[tour.tourStyle] },
    stopCount > 0 && { icon: Route, label: "Places", value: `${stopCount} stops` },
  ].filter(Boolean) as { icon: typeof Clock; label: string; value: string }[];

  const navItems = [
    ["overview", "Overview"],
    ["itinerary", "Itinerary"],
    gallery.length > 0 && ["gallery", "Gallery"],
    ["included", "What’s included"],
    ["practical", "Practical info"],
    tour.faqs.length > 0 && ["faqs", "FAQs"],
    ["enquire", "Request a quote"],
  ].filter(Boolean) as [string, string][];

  const url = siteUrl(`/tours/${tour.slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: tour.title,
      description: tour.summary,
      url,
      ...(hero ? { image: siteUrl(hero.src) } : {}),
      touristType: CATEGORY_LABELS[tour.category],
      itinerary: {
        "@type": "ItemList",
        itemListElement: tour.itinerary
          .flatMap((d) => d.stops)
          .filter((s) => !/^(departure|depart|lunch|arrive|return)/i.test(s.name))
          .map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "TouristAttraction", name: s.name } })),
      },
      provider: { "@type": "TravelAgency", name: site.siteName, url: siteUrl("/") },
      ...(tour.priceFrom != null
        ? { offers: { "@type": "Offer", price: tour.priceFrom, priceCurrency: tour.priceCurrency, url, availability: "https://schema.org/InStock" } }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Tours", item: siteUrl("/tours") },
        { "@type": "ListItem", position: 3, name: tour.title, item: url },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        size="lg"
        eyebrow={`${CATEGORY_LABELS[tour.category]} · ${durationText(tour)}`}
        title={tour.title}
        intro={tour.subtitle}
        media={hero}
        crumbs={[{ href: "/tours", label: "Tours" }, { href: `/tours/${tour.slug}`, label: tour.title }]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <a href="#enquire" className="btn btn-primary">Request a quote</a>
          <a href="#itinerary" className="btn btn-ghost-light">View itinerary</a>
          {tour.destinations.length > 0 && (
            <p className="ml-1 flex items-center gap-2 text-sm text-white/75">
              <MapPin className="size-4" aria-hidden />
              {tour.destinations.map((d, i) => (
                <span key={d.slug}>
                  {i > 0 && " · "}
                  <Link href={`/destinations/${d.slug}`} className="hover:text-white hover:underline">{d.name}</Link>
                </span>
              ))}
            </p>
          )}
        </div>
      </PageHero>

      {/* Sticky section nav */}
      <nav aria-label="On this page" className="sticky top-16 md:top-[4.5rem] z-30 border-b border-line bg-paper/90 backdrop-blur-md">
        <ul className="container-x flex gap-6 overflow-x-auto text-sm font-medium whitespace-nowrap [scrollbar-width:none]">
          {navItems.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="block border-b-2 border-transparent py-4 text-muted transition-colors hover:border-accent hover:text-ink">{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-x grid gap-16 py-16 md:py-24 lg:grid-cols-12">
        <div className="space-y-24 lg:col-span-8">
          <section id="overview" aria-labelledby="overview-h">
            <Reveal>
              <p className="eyebrow mb-4">Overview</p>
              <h2 id="overview-h" className="text-[clamp(1.8rem,3.4vw,2.6rem)] leading-tight font-medium">{tour.summary}</h2>
              <div className="prose-site mt-8">
                {paragraphs(tour.overview).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </Reveal>
            <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.label} className="bg-paper p-5">
                  <dt className="flex items-center gap-2 text-[0.68rem] font-bold tracking-[0.16em] text-muted uppercase">
                    <f.icon className="size-3.5 text-accent" aria-hidden /> {f.label}
                  </dt>
                  <dd className="mt-2 font-display text-lg">{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="itinerary" aria-labelledby="itinerary-h">
            <p className="eyebrow mb-4">Day by day</p>
            <h2 id="itinerary-h" className="mb-10 text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium">Itinerary</h2>
            <ItineraryTimeline itinerary={tour.itinerary} />
          </section>

          {gallery.length > 0 && (
            <section id="gallery" aria-labelledby="gallery-h">
              <p className="eyebrow mb-4">Along the way</p>
              <h2 id="gallery-h" className="mb-10 text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium">Gallery</h2>
              <Gallery images={gallery} />
            </section>
          )}

          <section id="included" aria-labelledby="included-h">
            <h2 id="included-h" className="mb-10 text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium">What’s included</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-ivory p-7">
                <p className="eyebrow mb-5">Included</p>
                {tour.inclusions.length ? (
                  <ul className="space-y-3">
                    {tour.inclusions.map((x) => (
                      <li key={x} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-forest" aria-hidden /> {x}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">Confirmed in your quote.</p>
                )}
              </div>
              <div className="rounded-2xl border border-line p-7">
                <p className="eyebrow mb-5">Not included unless in your quote</p>
                <ul className="space-y-3">
                  {tour.exclusions.map((x) => (
                    <li key={x} className="flex gap-3 text-muted"><Minus className="mt-0.5 size-4 shrink-0" aria-hidden /> {x}</li>
                  ))}
                </ul>
              </div>
            </div>
            {tour.accommodation && (
              <div className="mt-6 flex gap-4 rounded-2xl border border-line p-7">
                <BedDouble className="size-6 shrink-0 text-accent" aria-hidden />
                <div>
                  <p className="eyebrow mb-2">Accommodation</p>
                  <p className="leading-relaxed">{tour.accommodation}</p>
                </div>
              </div>
            )}
          </section>

          <section id="practical" aria-labelledby="practical-h">
            <h2 id="practical-h" className="mb-10 text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium">Practical information</h2>
            <dl className="divide-y divide-line border-y border-line">
              {[
                ["Departure", [tour.departureTime && `Departs ${tour.departureTime}`, tour.startPoint && `from ${tour.startPoint}`].filter(Boolean).join(" ") + (tour.departureNotes ? `. ${tour.departureNotes}` : "")],
                ["Drop-off", tour.dropOffs],
                ["Pricing", tour.priceFrom != null ? `From ${formatPrice(tour.priceFrom, tour.priceCurrency)}${tour.priceBasis ? ` ${tour.priceBasis}` : ""}. ${tour.pricingNotes}` : `Prices depend on your group size, vehicle and dates — request a quote for an exact price. ${tour.pricingNotes}`],
                ["Availability", tour.availabilityMode === "daily" ? "Runs daily, subject to confirmation." : upcoming.length ? `Scheduled departures: ${upcoming.map((d) => new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })).join(", ")}` : "On request — we confirm availability for your dates."],
                ["Good to know", tour.importantNotes],
                ["Cancellation policy", tour.cancellationPolicy],
              ]
                .filter(([, v]) => v && v.trim())
                .map(([k, v]) => (
                  <div key={k} className="grid gap-2 py-6 md:grid-cols-[12rem_1fr]">
                    <dt className="text-xs font-bold tracking-[0.16em] text-muted uppercase">{k}</dt>
                    <dd className="leading-relaxed whitespace-pre-line">{v!.trim()}</dd>
                  </div>
                ))}
            </dl>
            {tour.pricingRules.length > 0 && (
              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="eyebrow mb-3 text-left">Pricing guide</caption>
                  <thead><tr className="border-b border-line text-muted"><th className="py-2 font-semibold">Option</th><th className="py-2 font-semibold">Price</th><th className="py-2 font-semibold">Basis</th></tr></thead>
                  <tbody>
                    {tour.pricingRules.map((r, i) => (
                      <tr key={i} className="border-b border-line"><td className="py-3">{r.label}</td><td className="py-3 font-semibold">{formatPrice(r.amount, tour.priceCurrency)}</td><td className="py-3 text-muted">{r.basis}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {tour.faqs.length > 0 && (
            <section id="faqs" aria-labelledby="faqs-h">
              <h2 id="faqs-h" className="mb-8 text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium">Questions about this tour</h2>
              <FaqList items={tour.faqs} />
            </section>
          )}

          <section id="enquire" aria-labelledby="enquire-h" className="scroll-mt-32">
            <p className="eyebrow mb-4">Request a quote</p>
            <h2 id="enquire-h" className="mb-3 text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium">Enquire about {tour.title}</h2>
            <p className="mb-10 max-w-xl text-muted">Share your dates and group. We’ll confirm availability and send a clear quote — your trip is only booked once you accept it.</p>
            <EnquiryWizard type="tour" tourId={tour.id} subject={tour.title} tripFields={tourEnquiryFields({ multiDay: tour.durationDays !== 1 })} tone="card" submitLabel="Send enquiry" />
          </section>
        </div>

        {/* Booking summary */}
        <aside className="lg:col-span-4" aria-label="Booking summary">
          <div className="space-y-5 lg:sticky lg:top-36">
            <div className="rounded-[1.5rem] bg-ink p-7 text-ivory">
              <p className="eyebrow eyebrow-light">{durationText(tour)}</p>
              <p className="mt-3 font-display text-3xl font-medium">{tour.title}</p>
              <PriceTag tour={tour} className="mt-5 block text-lg" />
              {tour.priceFrom == null && <p className="mt-1 text-sm text-ivory/60">We’ll send an exact quote for your dates and group.</p>}
              <a href="#enquire" className="btn btn-primary mt-7 w-full">Request a quote</a>
              {site.contact.phone && (
                <a href={`tel:${phoneDigits(site.contact.phone)}`} className="btn mt-3 w-full bg-white text-ink hover:bg-ivory">
                  <Phone className="size-4" aria-hidden /> Call {site.contact.phone}
                </a>
              )}
              {site.contact.whatsapp && (
                <a href={whatsappLink(site.contact.whatsapp, `Hello, I'd like a quote for "${tour.title}".`)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-3 w-full">
                  <MessageCircle className="size-4" aria-hidden /> Ask on WhatsApp
                </a>
              )}
              <p className="mt-4 text-center text-xs text-ivory/60">No payment to enquire · Pickup &amp; drop complimentary</p>
            </div>
            <div className="rounded-[1.5rem] border border-line p-6 text-sm leading-relaxed text-muted">
              <p className="font-semibold text-ink">How booking works</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5">
                <li>Send your enquiry — you’ll get a reference.</li>
                <li>We confirm availability and send a quote.</li>
                <li>Accept the quote and we confirm your trip.</li>
              </ol>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="bg-ivory py-20 md:py-28" aria-labelledby="related-h">
          <div className="container-x">
            <p className="eyebrow mb-4">You might also like</p>
            <h2 id="related-h" className="mb-12 text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium">Related journeys</h2>
            <ul className="grid gap-5 md:grid-cols-3">
              {related.map((t) => (
                <li key={t.id}><TourCard tour={t} media={media} /></li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
