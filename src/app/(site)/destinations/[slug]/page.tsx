import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { TourCard } from "@/components/site/tour-card";
import { getDestinationBySlug, getMediaMap, getPublishedDestinations, getPublishedTours } from "@/lib/data";

export async function generateStaticParams() {
  const d = await getPublishedDestinations();
  return d.map((x) => ({ slug: x.slug }));
}

export async function generateMetadata(props: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const [d, media] = await Promise.all([getDestinationBySlug(slug), getMediaMap()]);
  if (!d) return { title: "Destination not found", robots: { index: false } };
  const img = d.heroImageId ? media[d.heroImageId] : undefined;
  return {
    title: d.seoTitle || `${d.name} tours & travel`,
    description: d.seoDescription || d.description.slice(0, 160),
    alternates: { canonical: `/destinations/${d.slug}` },
    openGraph: img ? { images: [{ url: img.src, width: img.width, height: img.height, alt: img.alt }] } : undefined,
  };
}

export default function DestinationPage(props: PageProps<"/destinations/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[62svh] bg-ink" />}>
      <Content params={props.params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [d, media, tours, all] = await Promise.all([getDestinationBySlug(slug), getMediaMap(), getPublishedTours(), getPublishedDestinations()]);
  if (!d) notFound();
  const here = tours.filter((t) => t.destinations.some((x) => x.slug === d.slug));
  const others = all.filter((x) => x.slug !== d.slug).slice(0, 6);
  return (
    <>
      <PageHero
        eyebrow={d.region}
        title={d.name}
        intro={d.tagline}
        media={d.heroImageId ? media[d.heroImageId] : undefined}
        crumbs={[{ href: "/destinations", label: "Destinations" }, { href: `/destinations/${d.slug}`, label: d.name }]}
      />
      <section className="container-x grid gap-12 py-20 md:py-28 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-snug font-medium">{d.description}</p>
        </Reveal>
        <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
          <div className="rounded-[1.5rem] bg-ivory p-7">
            <p className="eyebrow mb-3">Plan a visit</p>
            <p className="text-muted">Tell us your dates and we’ll suggest the best way to see {d.name}.</p>
            <Link href="/plan" className="btn btn-primary mt-6 w-full">Plan your journey</Link>
          </div>
        </Reveal>
      </section>
      {here.length > 0 && (
        <section className="container-x pb-20 md:pb-28">
          <h2 className="mb-10 text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium">Tours visiting {d.name}</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {here.map((t) => <li key={t.id}><TourCard tour={t} media={media} /></li>)}
          </ul>
        </section>
      )}
      <section className="bg-ivory py-16">
        <div className="container-x">
          <p className="eyebrow mb-6">More destinations</p>
          <ul className="flex flex-wrap gap-3">
            {others.map((o) => (
              <li key={o.id}>
                <Link href={`/destinations/${o.slug}`} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink">
                  {o.name} <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
