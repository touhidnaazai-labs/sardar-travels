import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-sm text-muted hover:text-ink">← {back.label}</Link>
        )}
        <h1 className="text-3xl font-light md:text-4xl">{title}</h1>
        {description && <div className="mt-2 max-w-2xl text-sm text-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, children, className, actions }: { title?: string; description?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white p-5 md:p-7", className)}>
      {(title || actions) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-sans text-base font-bold tracking-normal">{title}</h2>}
            {description && <div className="mt-1 text-sm text-muted">{description}</div>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const STATUS_TONE: Record<string, string> = {
  new: "bg-accent/15 text-accent-strong",
  reviewing: "bg-sky-100 text-sky-800",
  quote_sent: "bg-violet-100 text-violet-800",
  awaiting_confirmation: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-800",
  completed: "bg-slate-200 text-slate-700",
  cancelled: "bg-rose-100 text-rose-800",
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-slate-200 text-slate-700",
  verify: "bg-amber-100 text-amber-900",
};

export function Badge({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", STATUS_TONE[tone] ?? "bg-slate-100 text-slate-700")}>{children}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center text-sm text-muted">{children}</div>;
}

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-bold [&_th]:tracking-wider [&_th]:text-muted [&_th]:uppercase [&_tbody_tr]:border-t [&_tbody_tr]:border-line [&_tbody_tr:hover]:bg-paper/60">
        {children}
      </table>
    </div>
  );
}

export function Skeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-10 w-64" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-14 w-full" />
      ))}
    </div>
  );
}
