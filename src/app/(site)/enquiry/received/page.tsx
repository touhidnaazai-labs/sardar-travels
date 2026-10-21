import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CopyButton } from "@/components/site/copy-button";
import { TrackLead } from "@/components/site/analytics";

export const metadata: Metadata = { title: "Enquiry received", robots: { index: false } };

const REF = /^ST-\d{6}-[A-Z2-9]{4}$/;

async function Reference({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" && REF.test(sp.ref) ? sp.ref : null;
  if (!ref) {
    return (
      <p className="text-muted">
        We couldn’t read an enquiry reference. If you’ve just sent an enquiry, check your email — or <Link className="underline" href="/enquiry/track">track an enquiry</Link>.
      </p>
    );
  }
  return (
    <>
      <p className="eyebrow">Your reference</p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <p className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-medium tracking-wide">{ref}</p>
        <CopyButton text={ref} />
      </div>
      <p className="mt-3 text-sm text-muted">Keep this reference to track your enquiry or when you speak with us.</p>
      <TrackLead reference={ref} />
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/enquiry/track?ref=${ref}`} className="btn btn-dark">Track this enquiry</Link>
        <Link href="/tours" className="btn btn-ghost">Keep exploring</Link>
      </div>
    </>
  );
}

export default function ReceivedPage(props: PageProps<"/enquiry/received">) {
  return (
    <>
      <PageHero size="sm" eyebrow="Thank you" title="We’ve received your enquiry" />
      <div className="container-x grid gap-14 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-[1.75rem] bg-white p-8 shadow-[0_30px_80px_-40px_rgba(15,27,45,.45)] md:p-10">
            <CheckCircle2 className="mb-6 size-10 text-forest" aria-hidden />
            <Suspense fallback={<div className="skeleton h-24" />}>
              <Reference searchParams={props.searchParams} />
            </Suspense>
          </div>
        </div>
        <div className="lg:col-span-5">
          <p className="eyebrow mb-5">What happens next</p>
          <ol className="space-y-6">
            {[
              ["This is not yet a booking", "Your enquiry is saved with our team. Nothing has been reserved or charged."],
              ["We check availability", "We’ll review your dates and requirements and prepare a quote."],
              ["You receive a quote", "We’ll contact you using your preferred method. You can also see the quote on the tracking page."],
              ["You confirm", "Your trip is confirmed only once you accept the quote and we confirm it with you."],
            ].map(([t, b], i) => (
              <li key={t} className="flex gap-4">
                <span className="font-display text-3xl leading-none font-medium text-accent italic">{i + 1}</span>
                <span><span className="block font-semibold">{t}</span><span className="text-sm text-muted">{b}</span></span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
