import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/page-hero";
import { getMediaMap } from "@/lib/data";

export const metadata: Metadata = {
  title: "Photo credits",
  description: "Credits and licences for photographs used on this website.",
  alternates: { canonical: "/credits" },
};

export default async function CreditsPage() {
  const media = Object.values(await getMediaMap()).filter((m) => m.credit);
  return (
    <>
      <PageHero size="sm" title="Photo credits" intro="With thanks to the photographers whose openly licensed work appears on this site." crumbs={[{ href: "/credits", label: "Photo credits" }]} />
      <div className="container-x py-16 md:py-24">
        {media.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((m) => (
              <li key={m.id} className="flex gap-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl"><Image src={m.src} alt="" fill sizes="80px" className="object-cover" /></div>
                <div className="text-sm">
                  <p className="font-medium">{m.alt}</p>
                  <p className="text-muted">
                    {m.creditUrl ? <a href={m.creditUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{m.credit}</a> : m.credit}
                    {m.license && ` · ${m.license}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">All photographs on this site belong to Sardar Travels.</p>
        )}
      </div>
    </>
  );
}
