import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Markdown } from "@/components/site/markdown";
import { PageHero } from "@/components/site/page-hero";
import { getPublishedPage, getFooterPages } from "@/lib/data";

export async function generateStaticParams() {
  const pages = await getFooterPages();
  return pages.length ? pages.map((p) => ({ slug: p.slug })) : [{ slug: "about" }];
}

export async function generateMetadata(props: PageProps<"/info/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getPublishedPage(slug);
  if (!p) return { title: "Page not found", robots: { index: false } };
  return { title: p.seoTitle || p.title, description: p.seoDescription || p.intro, alternates: { canonical: `/info/${p.slug}` } };
}

export default function InfoPage(props: PageProps<"/info/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[22rem] bg-ink" />}>
      <Content params={props.params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPublishedPage(slug);
  if (!p) notFound();
  return (
    <>
      <PageHero size="sm" title={p.title} intro={p.intro} crumbs={[{ href: `/info/${p.slug}`, label: p.title }]} />
      <article className="container-x max-w-3xl py-16 md:py-24">
        <Markdown source={p.body} />
      </article>
    </>
  );
}
