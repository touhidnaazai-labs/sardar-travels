"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Car, FileText, Gauge, Home, Image as ImageIcon, Inbox, LogOut, Map, MapPin, Menu, MessageSquareQuote, Settings, UserCog, Users, X, ExternalLink, HelpCircle,
} from "lucide-react";
import { logout } from "@/app/actions/admin/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: Gauge, exact: true },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { section: "Catalogue" },
  { href: "/admin/tours", label: "Tours", icon: Map, admin: true },
  { href: "/admin/destinations", label: "Destinations", icon: MapPin, admin: true },
  { href: "/admin/services", label: "Services & vehicles", icon: Car, admin: true },
  { href: "/admin/media", label: "Media library", icon: ImageIcon, admin: true },
  { section: "Website" },
  { href: "/admin/homepage", label: "Homepage", icon: Home, admin: true },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle, admin: true },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, admin: true },
  { href: "/admin/pages", label: "Pages", icon: FileText, admin: true },
  { href: "/admin/settings", label: "Site settings", icon: Settings, admin: true },
  { section: "Account" },
  { href: "/admin/users", label: "Team", icon: Users, admin: true },
  { href: "/admin/account", label: "My account", icon: UserCog },
] as const;

export function Sidebar({ user }: { user: { name: string; email: string; role: string } | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const items = NAV.filter((n) => !("admin" in n && n.admin) || isAdmin);

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-ink px-4 text-ivory lg:hidden">
        <span className="font-display text-lg">Sardar · Dashboard</span>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation" className="grid size-10 place-items-center">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-ink text-ivory/80 transition-transform lg:translate-x-0",
          open ? "translate-x-0 pt-14 lg:pt-0" : "-translate-x-full",
        )}
      >
        <div className="hidden h-20 items-center gap-3 px-6 lg:flex">
          <span className="grid size-9 place-items-center rounded-full border border-ivory/30 font-display italic">S</span>
          <span className="font-display text-lg text-ivory">Dashboard</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
          {items.map((n, i) =>
            "section" in n ? (
              <p key={i} className="mt-5 mb-2 px-3 text-[0.65rem] font-bold tracking-[0.2em] text-ivory/40 uppercase">{n.section}</p>
            ) : (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                aria-current={(("exact" in n && n.exact) ? pathname === n.href : pathname.startsWith(n.href)) ? "page" : undefined}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5 hover:text-ivory aria-[current=page]:bg-white/10 aria-[current=page]:text-ivory"
              >
                <n.icon className="size-4" aria-hidden /> {n.label}
              </Link>
            ),
          )}
        </nav>
        <div className="border-t border-white/10 p-4 text-sm">
          <Link href="/" target="_blank" className="mb-3 flex items-center gap-2 text-ivory/60 hover:text-ivory">
            <ExternalLink className="size-4" /> View website
          </Link>
          {user && (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-ivory">{user.name}</p>
                <p className="truncate text-xs text-ivory/50 capitalize">{user.role}</p>
              </div>
              <form action={logout}>
                <button type="submit" className="grid size-9 place-items-center rounded-full hover:bg-white/10" aria-label="Sign out" title="Sign out">
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>
      {open && <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-20 bg-black/40 lg:hidden" />}
    </>
  );
}

