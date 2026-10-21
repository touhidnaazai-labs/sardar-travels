"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { MediaMeta } from "@/lib/data";
import { cn } from "@/lib/utils";

export type GalleryImage = { media: MediaMeta; caption?: string };

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(null);
    lastTrigger.current?.focus();
  }, []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (open === null) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  if (!images.length) return null;
  const current = open !== null ? images[open] : null;

  return (
    <>
      <ul className="grid auto-rows-[11rem] grid-cols-2 gap-3 md:auto-rows-[14rem] md:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.media.id + i} className={cn(i === 0 && "col-span-2 row-span-2", i === 3 && "md:col-span-2")}>
            <button
              type="button"
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setOpen(i);
              }}
              className="group relative block h-full w-full overflow-hidden rounded-2xl bg-sand"
              aria-label={`View photo: ${img.caption || img.media.alt}`}
            >
              <Image
                src={img.media.src}
                alt={img.media.alt}
                fill
                sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                placeholder={img.media.blurDataUrl ? "blur" : "empty"}
                blurDataURL={img.media.blurDataUrl ?? undefined}
                className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {img.caption}
                <Expand className="size-4" aria-hidden />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {current && (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-ink-deep/96 text-white outline-none backdrop-blur"
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-white/60">{(open ?? 0) + 1} / {images.length}</span>
              <button type="button" onClick={close} className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close photo viewer">
                <X className="size-5" />
              </button>
            </div>
            <div className="relative flex-1" onClick={(e) => e.target === e.currentTarget && close()}>
              <AnimatePresence mode="wait">
                <motion.div key={open} className="absolute inset-4 md:inset-x-24" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <Image src={current.media.src} alt={current.media.alt} fill sizes="100vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} className="absolute top-1/2 left-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Previous photo">
                    <ChevronLeft className="size-6" />
                  </button>
                  <button type="button" onClick={() => step(1)} className="absolute top-1/2 right-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Next photo">
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}
            </div>
            <div className="p-5 text-center text-sm">
              {current.caption && <p className="font-medium">{current.caption}</p>}
              {current.media.credit && (
                <p className="mt-1 text-xs text-white/50">
                  Photo: {current.media.creditUrl ? <a className="underline" href={current.media.creditUrl} target="_blank" rel="noopener noreferrer">{current.media.credit}</a> : current.media.credit}
                  {current.media.license && ` · ${current.media.license}`}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
