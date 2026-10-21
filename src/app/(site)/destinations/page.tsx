import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaImage } from "@/components/site/media-image";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { getMediaMap, getPublishedDestinations } from "@/lib/data";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Mysuru, Ooty, Coonoor, Kodaikanal, Coorg, Belur & Halebidu and more — explore the places Sardar Travels tours visit.",
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage() {
  const [destinations, media] = await Promise.all([getPublishedDestinations(), getMediaMap()]);
  const heroId = destinations.find((d) => d.slug === "ooty")?.heroImageId ?? destinations[0]?.heroImageId;
  return (
    <>
      <PageHero
        eyebrow="Where we travel"
        title="Destinations"
        intro="Royal cities, misty hill stations, coffee country and centuries-old temples — all within reach of Mysuru."
        media={heroId ? media[heroId] : undefined}
        crumbs={[{ href: "/destinations", label: "Destinations" }]}
      />
      <div className="container-x py-20 md:py-28">
        <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d, i) => (
            <li key={d.id} className={i % 3 === 1 ? "lg:mt-16" : undefined}>
              <Reveal delay={(i % 3) * 0.08}>
                <Link href={`/destinations/${d.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-sand">
                    <MediaImage media={d.heroImageId ? media[d.heroImageId] : undefined} sizes="(min-width:1024px) 30vw, (min-width:640px) 50vw, 100vw" className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
                    {d.tourCount > 0 && (
                      <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold">
                        {d.tourCount} {d.tourCount === 1 ? "tour" : "tours"}
                      </span>
                    )}
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">{d.region}</p>
                      <h2 className="mt-2 text-3xl font-medium">{d.name}</h2>
                      <p className="mt-2 text-muted">{d.tagline}</p>
                    </div>
                    <ArrowUpRight className="mt-6 size-5 shrink-0 text-accent transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden />
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
