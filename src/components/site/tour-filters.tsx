"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };

export function TourFilters({
  destinations,
  categories,
  durations,
  budgets,
  styles,
  showDate,
}: {
  destinations: FilterOption[];
  categories: FilterOption[];
  durations: FilterOption[];
  budgets: FilterOption[];
  styles: FilterOption[];
  showDate: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  const active = ["q", "destination", "category", "duration", "budget", "style", "date"].filter((k) => params.get(k));

  const select = (key: string, label: string, options: FilterOption[]) =>
    options.length > 1 && (
      <div className="min-w-0 flex-1 basis-40">
        <label htmlFor={`f-${key}`} className="field-label">{label}</label>
        <select id={`f-${key}`} name={key} className="field" value={params.get(key) ?? ""} onChange={(e) => update(key, e.target.value)}>
          <option value="">Any</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );

  return (
    <form
      role="search"
      aria-label="Filter tours"
      action={pathname}
      onSubmit={(e) => {
        e.preventDefault();
        update("q", String(new FormData(e.currentTarget).get("q") ?? "").trim());
      }}
      className={cn("rounded-[1.5rem] bg-white p-5 shadow-[0_20px_60px_-40px_rgba(15,27,45,.5)] transition-opacity md:p-6", pending && "opacity-70")}
      aria-busy={pending}
    >
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-[2] basis-60">
          <label htmlFor="f-q" className="field-label">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input id="f-q" name="q" type="search" defaultValue={params.get("q") ?? ""} key={params.get("q") ?? ""} placeholder="Palace, waterfalls, Ooty…" className="field pl-10" />
          </div>
        </div>
        {select("destination", "Destination", destinations)}
        {select("duration", "Duration", durations)}
        {select("category", "Tour type", categories)}
        {select("budget", "Budget", budgets)}
        {select("style", "Private / group", styles)}
        {showDate && (
          <div className="min-w-0 flex-1 basis-40">
            <label htmlFor="f-date" className="field-label">Travel date</label>
            <input id="f-date" type="date" className="field" value={params.get("date") ?? ""} onChange={(e) => update("date", e.target.value)} />
          </div>
        )}
        <button type="submit" className="btn btn-dark">Search</button>
      </div>
      {active.length > 0 && (
        <button type="button" onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong">
          <X className="size-4" aria-hidden /> Clear {active.length} filter{active.length > 1 ? "s" : ""}
        </button>
      )}
    </form>
  );
}
