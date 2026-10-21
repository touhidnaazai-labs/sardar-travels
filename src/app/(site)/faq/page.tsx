import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/site/faq-list";
import { JsonLd } from "@/components/site/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { getPublishedFaqs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Answers to common questions about booking tours, quotes, inclusions, hotels and vehicle hire with Sardar Travels.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const faqs = await getPublishedFaqs();
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }} />
      <PageHero size="sm" eyebrow="Good to know" title="Frequently asked questions" crumbs={[{ href: "/faq", label: "FAQs" }]} />
      <div className="container-x max-w-4xl py-16 md:py-24">
        <FaqList items={faqs.map((f) => ({ q: f.question, a: f.answer }))} />
        <div className="mt-14 rounded-[1.5rem] bg-ivory p-8 text-center">
          <p className="font-display text-2xl font-medium">Still have a question?</p>
          <Link href="/contact" className="btn btn-primary mt-6">Contact us</Link>
        </div>
      </div>
    </>
  );
}
