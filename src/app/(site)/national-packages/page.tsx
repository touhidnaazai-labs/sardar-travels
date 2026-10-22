import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { TourCard } from "@/components/site/tour-card";
import { getMediaMap, getPublishedTours } from "@/lib/data";

export const metadata: Metadata = {
  title: "National tour packages",
  description: "Holiday packages across India: Kashmir, Shimla, Delhi, Goa, Munnar, Thekkady, Alleppey houseboats, Madurai, Rameshwaram and Kanyakumari. Request a tailored quote.",
  alternates: { canonical: "/national-packages" },
};

export default async function NationalPackagesPage() {
  const [tours, media] = await Promise.all([getPublishedTours(), getMediaMap()]);
  const national = tours.filter((t) => t.category === "national-package");
  const hero = national[0]?.heroImageId ? media[national[0].heroImageId] : undefined;
  return (
    <>
      <PageHero
        eyebrow="Across India"
        title="National tour packages"
        intro="From the Himalayas to the southern tip — pick a destination and we’ll plan the trip around your dates, group and budget."
        media={hero}
        crumbs={[{ href: "/national-packages", label: "National packages" }]}
      />
      <div className="container-x py-16 md:py-24">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {national.map((t, i) => (
            <Reveal as="li" key={t.id} delay={(i % 3) * 0.06}><TourCard tour={t} media={media} priority={i < 3} /></Reveal>
          ))}
        </ul>
        <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-3xl bg-ink p-8 text-white md:flex-row md:items-center md:p-10">
          <div>
            <p className="text-2xl font-semibold md:text-3xl">Don’t see your destination?</p>
            <p className="mt-2 max-w-lg text-white/75">Tell us where you’d like to go — we’ll plan it, or combine several destinations into one trip.</p>
          </div>
          <Link href="/plan" className="btn btn-primary">Plan a custom trip <ArrowRight className="size-4" aria-hidden /></Link>
        </div>
      </div>
    </>
  );
}
