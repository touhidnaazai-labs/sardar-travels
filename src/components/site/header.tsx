"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Menu, MessageCircle, Phone, X } from "lucide-react";
import type { MediaMeta } from "@/lib/data";
import { cn, phoneDigits, whatsappLink } from "@/lib/utils";
import { HomeLink } from "./home-link";
import { Logo } from "./logo";

export type NavChild = { href: string; label: string; hint?: string };
export type NavItem = { href: string; label: string; children?: NavChild[] };

type HeaderProps = {
  siteName: string;
  logo?: MediaMeta;
  nav: NavItem[];
  phone: string;
  whatsapp: string;
  landmark: string;
  announcement?: string;
};

/**
 * The pathname is URL data, so it's read inside a Suspense boundary; the
 * fallback renders the identical header without active-link state. This keeps
 * every route prerenderable (including ISR regeneration after admin edits).
 */
export function Header(props: HeaderProps) {
  return (
    <Suspense fallback={<HeaderView {...props} pathname={null} />}>
      <HeaderWithPath {...props} />
    </Suspense>
  );
}

function HeaderWithPath(props: HeaderProps) {
  return <HeaderView {...props} pathname={usePathname()} />;
}

function HeaderView({ siteName, logo, nav, phone, whatsapp, announcement, pathname }: HeaderProps & { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [menuTop, setMenuTop] = useState(64);

  // Close the mobile menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => !!pathname && (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const tel = phone ? `tel:${phoneDigits(phone)}` : "";

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      {announcement && <div className="bg-accent px-4 py-2 text-center text-sm font-semibold text-ink">{announcement}</div>}

      <header ref={headerRef} className="sticky top-0 z-50 border-b border-line bg-white/92 text-ink backdrop-blur-md">
        <div className="container-x flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
          <HomeLink className="group flex shrink-0 items-center gap-2.5" label={`${siteName} — home`}>
            {logo ? (
              <Image src={logo.src} alt="" width={logo.width} height={logo.height} className="h-10 w-auto" priority />
            ) : (
              <Logo priority className="h-10 md:h-12" />
            )}
          </HomeLink>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {nav.map((item) =>
              item.children ? (
                <NavDropdown key={item.label} item={item} isActive={isActive} />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-[0.92rem] font-semibold transition-colors",
                    isActive(item.href) ? "bg-sand text-ink" : "text-ink/70 hover:bg-sand hover:text-ink",
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            {phone && (
              <a href={tel} className="hidden items-center gap-2 px-2 text-sm font-semibold text-ink/80 hover:text-forest xl:flex" aria-label={`Call ${phone}`}>
                <Phone className="size-4" aria-hidden /> {phone}
              </a>
            )}
            <Link href="/plan" className="btn btn-primary !py-2 max-sm:!px-3 max-sm:text-[0.82rem]">
              Get a quote
            </Link>
            <button
              ref={menuButton}
              type="button"
              className="grid size-11 place-items-center rounded-full hover:bg-sand lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => {
                if (!open && headerRef.current) setMenuTop(Math.round(headerRef.current.getBoundingClientRect().bottom));
                setOpen((o) => !o);
              }}
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

      </header>

      {/* Outside <header>: its backdrop-blur would otherwise become the containing block for this fixed panel and collapse it. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ top: menuTop }}
            className="fixed inset-x-0 bottom-0 z-[45] overflow-y-auto border-t border-line bg-white text-ink lg:hidden"
          >
            <nav aria-label="Mobile" className="container-x flex flex-col py-4">
              <Link href="/" className={cn("border-b border-line py-4 font-display text-2xl font-semibold", isActive("/") && "text-forest")}>Home</Link>
              {nav.map((item) =>
                item.children ? (
                  <div key={item.label} className="border-b border-line py-4">
                    <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">{item.label}</p>
                    <ul className="mt-2 grid gap-0.5">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className={cn("block py-2 font-display text-xl font-semibold", isActive(c.href) && "text-forest")}>{c.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn("border-b border-line py-4 font-display text-2xl font-semibold", isActive(item.href) && "text-forest")}
                  >
                    {item.label}
                  </Link>
                ),
              )}
              <div className="mt-6 grid gap-3">
                <Link href="/plan" className="btn btn-primary w-full">Get a free quote</Link>
                {phone && (
                  <a href={tel} className="btn btn-dark w-full">
                    <Phone className="size-4" aria-hidden /> Call {phone}
                  </a>
                )}
                {whatsapp && (
                  <a href={whatsappLink(whatsapp, "Hello Sardar Travels, I'd like to plan a trip.")} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp w-full">
                    <MessageCircle className="size-4" aria-hidden /> Chat on WhatsApp
                  </a>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Persistent contact bar on phones (Call · WhatsApp · Quote) plus a floating
 * WhatsApp button on larger screens. Keeps the next step one tap away.
 */
export function ActionBar({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  const wa = whatsapp ? whatsappLink(whatsapp, "Hello Sardar Travels, I'd like to plan a trip.") : "";
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/15 bg-ivory/97 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className={cn("grid gap-2 p-2", phone && wa ? "grid-cols-3" : phone || wa ? "grid-cols-2" : "grid-cols-1")}>
          {phone && (
            <a href={`tel:${phoneDigits(phone)}`} className="btn btn-dark !px-2 !py-3 text-sm">
              <Phone className="size-4" aria-hidden /> Call
            </a>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp !px-2 !py-3 text-sm">
              <MessageCircle className="size-4" aria-hidden /> WhatsApp
            </a>
          )}
          <Link href="/plan" className="btn btn-primary !px-2 !py-3 text-sm">
            Free quote
          </Link>
        </div>
      </div>
      <div className="fixed right-6 bottom-6 z-40 hidden flex-col items-end gap-3 md:flex">
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp !rounded-full !px-5 !py-3">
            <MessageCircle className="size-5" aria-hidden /> Chat on WhatsApp
          </a>
        )}
        {phone && (
          <a href={`tel:${phoneDigits(phone)}`} aria-label={`Call ${phone}`} className="btn btn-primary !size-12 !p-0">
            <Phone className="size-5" aria-hidden />
          </a>
        )}
      </div>
    </>
  );
}


/** Desktop dropdown: opens on hover, focus or click; closes on Escape or when focus leaves. */
function NavDropdown({ item, isActive }: { item: NavItem; isActive: (href: string) => boolean }) {
  const [open, setOpen] = useState(false);
  const active = item.children!.some((c) => isActive(c.href));
  const wrap = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={wrap}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!wrap.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1 rounded-lg px-3.5 py-2 text-[0.92rem] font-semibold transition-colors",
          active || open ? "bg-sand text-ink" : "text-ink/70 hover:bg-sand hover:text-ink",
        )}
      >
        {item.label} <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 pt-2">
          <ul className="min-w-64 rounded-2xl border border-line bg-white p-2 shadow-[0_24px_60px_-20px_rgba(15,28,58,.35)]">
            {item.children!.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  onClick={() => setOpen(false)}
                  className={cn("block rounded-xl px-3.5 py-2.5 hover:bg-sand", isActive(c.href) && "bg-sand")}
                  aria-current={isActive(c.href) ? "page" : undefined}
                >
                  <span className="block text-[0.93rem] font-semibold">{c.label}</span>
                  {c.hint && <span className="block text-xs text-muted">{c.hint}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
