import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function FaqList({ items, light }: { items: { q: string; a: string }[]; light?: boolean }) {
  return (
    <div className={cn("divide-y border-y", light ? "divide-line-light border-line-light" : "divide-line border-line")}>
      {items.map((f, i) => (
        <details key={i} className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
            <span className="font-display text-xl leading-snug font-medium md:text-2xl">{f.q}</span>
            <span className={cn("mt-1 grid size-8 shrink-0 place-items-center rounded-full border transition-transform duration-500 group-open:rotate-45", light ? "border-line-light" : "border-line")}>
              <Plus className="size-4" aria-hidden />
            </span>
          </summary>
          <p className={cn("max-w-3xl pb-7 leading-relaxed whitespace-pre-line", light ? "text-ivory/70" : "text-muted")}>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
