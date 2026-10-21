"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import type { MediaMeta } from "@/lib/data";
import { phoneDigits, whatsappLink } from "@/lib/utils";
import { QuickQuote, type QuickOption } from "@/components/forms/quick-quote";

type Slide = { media: MediaMeta; caption: string };

/** Split "Your Journey. *Your Way.*" into words, flagging the starred accent words. */
function words(text: string) {
  return text.split(/\*([^*]+)\*/g).flatMap((part, i) =>
    part.split(/\s+/).filter(Boolean).map((w) => ({ w, accent: i % 2 === 1 })),
  );
}

export function Hero({
  eyebrow,
  headline,
  subhead,
  slides,
  phone,
  whatsapp,
  chips,
  options,
}: {
  eyebrow: string;
  headline: string;
  subhead: string;
  slides: Slide[];
  phone: string;
  whatsapp: string;
  chips: string[];
  options: QuickOption[];
}) {
  const [index, setIndex] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 120]);

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[index];
  const ws = words(headline);
  const wa = whatsapp ? whatsappLink(whatsapp, "Hello Sardar Travels, I'd like to plan a trip.") : "";

  return (
    <>
      <section className="grain relative isolate flex min-h-[min(46rem,calc(100svh-4rem))] flex-col justify-end overflow-hidden bg-ink pb-28 text-white md:pb-32">
        <motion.div style={{ y }} className="absolute inset-0 -z-10">
          <AnimatePresence initial={false}>
            {slide && (
              <motion.div key={slide.media.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.6, ease: "easeInOut" }}>
                <Image
                  src={slide.media.src}
                  alt={slide.media.alt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  placeholder={slide.media.blurDataUrl ? "blur" : "empty"}
                  blurDataURL={slide.media.blurDataUrl ?? undefined}
                  className="animate-kenburns object-cover"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,17,38,.45)_0%,rgba(9,17,38,.1)_35%,rgba(9,17,38,.82)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,17,38,.7)_0%,transparent_65%)]" />
        </motion.div>

        <div className="container-x pt-24">
          <motion.p
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase backdrop-blur"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className="size-1.5 rounded-full bg-accent" aria-hidden /> {eyebrow}
          </motion.p>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.9rem,8vw,6.6rem)] leading-[0.98] font-semibold">
            {ws.map(({ w, accent }, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.14em] -mb-[0.06em] align-bottom">
                <motion.span
                  className={accent ? "inline-block text-accent" : "inline-block"}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.25 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                >
                  {w}
                </motion.span>
                {i < ws.length - 1 && " "}
              </span>
            ))}
          </h1>
          <motion.p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}>
            {subhead}
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap items-center gap-3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.95 }}>
            <Link href="/tours" className="btn btn-primary">
              Explore tours <ArrowRight className="size-4" aria-hidden />
            </Link>
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">
                <MessageCircle className="size-4" aria-hidden /> WhatsApp us
              </a>
            ) : (
              <Link href="/plan" className="btn btn-ghost-light">Plan your journey</Link>
            )}
            {phone && (
              <a href={`tel:${phoneDigits(phone)}`} className="btn btn-ghost-light">
                <Phone className="size-4" aria-hidden /> {phone}
              </a>
            )}
          </motion.div>
          <motion.ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/80" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            {chips.map((c) => (
              <li key={c} className="flex items-center gap-2"><span aria-hidden className="size-1.5 rounded-full bg-accent" /> {c}</li>
            ))}
          </motion.ul>
        </div>

        {slides.length > 1 && (
          <div className="container-x absolute inset-x-0 bottom-20 hidden justify-end gap-1.5 md:flex" role="group" aria-label="Background photos">
            <span className="mr-3 self-center text-xs text-white/60">{slide?.caption}</span>
            {slides.map((s, i) => (
              <button key={s.media.id} type="button" onClick={() => setIndex(i)} aria-label={`Show ${s.caption}`} aria-pressed={i === index} className="grid h-6 place-items-center">
                <span className={`block h-0.5 rounded-full transition-all duration-700 ${i === index ? "w-10 bg-accent" : "w-5 bg-white/40"}`} />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Trip bar docked over the hero's bottom edge */}
      <div id="quote" className="container-x relative z-10 -mt-20 scroll-mt-24 md:-mt-24">
        <QuickQuote layout="bar" options={options} title="Get a free quote in 30 seconds" subtitle="Just a name and number to start." />
      </div>
    </>
  );
}
