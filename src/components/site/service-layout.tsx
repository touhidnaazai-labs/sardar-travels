import type { ReactNode } from "react";
import type { MediaMeta } from "@/lib/data";
import { PageHero } from "./page-hero";
import { Reveal } from "./reveal";

/** Shared two-column layout for service pages: information left, enquiry form right. */
export function ServiceLayout({
  eyebrow,
  title,
  intro,
  media,
  crumb,
  aside,
  children,
  formTitle,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  media?: MediaMeta;
  crumb: { href: string; label: string };
  aside: ReactNode;
  children: ReactNode;
  formTitle: string;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} media={media} crumbs={[crumb]} />
      <div className="container-x grid gap-14 py-16 md:py-24 lg:grid-cols-12">
        <Reveal className="space-y-10 lg:col-span-5">{aside}</Reveal>
        <section className="lg:col-span-7" aria-labelledby="form-h">
          <h2 id="form-h" className="mb-8 text-[clamp(1.8rem,3.2vw,2.4rem)] font-medium">{formTitle}</h2>
          {children}
        </section>
      </div>
    </>
  );
}

export function InfoBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      {children}
    </div>
  );
}

export function HowItWorks() {
  return (
    <InfoBlock title="How it works">
      <ol className="space-y-5">
        {[
          ["Send your request", "Takes about a minute. You’ll receive a reference number immediately."],
          ["We check and quote", "We confirm availability and send you a clear price."],
          ["You confirm", "Reply to confirm — only then is anything booked."],
        ].map(([t, b], i) => (
          <li key={t} className="flex gap-4">
            <span className="font-display text-3xl leading-none font-medium text-accent italic">{i + 1}</span>
            <span><span className="block font-semibold">{t}</span><span className="text-sm text-muted">{b}</span></span>
          </li>
        ))}
      </ol>
    </InfoBlock>
  );
}
