import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { TrackLead } from "@/components/site/analytics";
import { WhatsAppHandoff } from "@/components/site/whatsapp-handoff";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Enquiry received", robots: { index: false } };

const REF = /^ST-\d{6}-[A-Z2-9]{4}$/;

async function Reference({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [sp, site] = await Promise.all([searchParams, getSiteSettings()]);
  const ref = typeof sp.ref === "string" && REF.test(sp.ref) ? sp.ref : null;
  if (!ref) {
    return (
      <p className="text-muted">
        We couldn’t read an enquiry reference. If you’ve just sent an enquiry, you can still <Link className="underline" href="/contact">contact us</Link> directly.
      </p>
    );
  }
  const number = (site.contact.whatsapp || site.contact.phone).replace(/\D/g, "");
  return (
    <>
      <p className="eyebrow">Your reference</p>
      <p className="mt-3 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-semibold tracking-wide">{ref}</p>
      <p className="mt-3 text-sm text-muted">Quote this reference when you speak with us.</p>
      <TrackLead reference={ref} />
      <WhatsAppHandoff reference={ref} fallbackNumber={number} />
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/tours" className="btn btn-ghost">Keep exploring</Link>
        <Link href="/" className="btn btn-ghost">Back to home</Link>
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
          <div className="rounded-[1.75rem] bg-white p-8 shadow-[0_30px_80px_-40px_rgba(15,28,58,.45)] md:p-10">
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
              ["This is not yet a booking", "Nothing has been reserved or charged."],
              ["Send it on WhatsApp", "Tap the button so your details reach our team right away."],
              ["We reply with a quote", "We’ll check availability and send a clear price on WhatsApp or by phone."],
              ["You confirm", "Your trip is booked only once you reply to confirm and we confirm it back."],
            ].map(([t, b], i) => (
              <li key={t} className="flex gap-4">
                <span className="font-display text-3xl leading-none font-semibold text-accent-strong">{i + 1}</span>
                <span><span className="block font-semibold">{t}</span><span className="text-sm text-muted">{b}</span></span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
