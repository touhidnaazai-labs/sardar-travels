import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackForm } from "@/components/forms/track-form";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Track your enquiry",
  description: "Check the status of your Sardar Travels enquiry and view your quote.",
  alternates: { canonical: "/enquiry/track" },
};

async function Form({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref.slice(0, 20) : "";
  return <TrackForm initialRef={ref} />;
}

export default function TrackPage(props: PageProps<"/enquiry/track">) {
  return (
    <>
      <PageHero size="sm" eyebrow="Your enquiry" title="Track your enquiry" intro="Enter your reference and the email or phone number you used to see its status and any quote we’ve sent." />
      <div className="container-x max-w-4xl py-16 md:py-24">
        <Suspense fallback={<div className="skeleton h-40" />}>
          <Form searchParams={props.searchParams} />
        </Suspense>
      </div>
    </>
  );
}
