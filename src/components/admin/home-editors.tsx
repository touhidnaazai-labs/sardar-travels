"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { HOME_SECTION_LABELS, type HomeSectionKey } from "@/lib/settings";
import { cn } from "@/lib/utils";

export function SectionOrderEditor({ initial }: { initial: { key: HomeSectionKey; enabled: boolean }[] }) {
  const [items, setItems] = useState(initial);
  const move = (i: number, d: number) =>
    setItems((x) => {
      const j = i + d;
      if (j < 0 || j >= x.length) return x;
      const c = [...x];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  return (
    <div>
      <input type="hidden" name="sectionOrder" value={JSON.stringify(items.map((i) => i.key))} />
      <ol className="divide-y divide-line rounded-xl border border-line">
        {items.map((s, i) => (
          <li key={s.key} className={cn("flex items-center gap-3 px-4 py-2.5", !s.enabled && "bg-paper text-muted")}>
            <span className="w-6 text-xs text-muted">{i + 1}</span>
            <label className="flex flex-1 cursor-pointer items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                name="sectionEnabled"
                value={s.key}
                checked={s.enabled}
                onChange={(e) => setItems((x) => x.map((y, k) => (k === i ? { ...y, enabled: e.target.checked } : y)))}
                className="size-4 accent-[var(--accent)]"
              />
              {HOME_SECTION_LABELS[s.key]}
            </label>
            <button type="button" aria-label="Move up" className="grid size-8 place-items-center rounded-full hover:bg-paper" onClick={() => move(i, -1)}><ArrowUp className="size-4" /></button>
            <button type="button" aria-label="Move down" className="grid size-8 place-items-center rounded-full hover:bg-paper" onClick={() => move(i, 1)}><ArrowDown className="size-4" /></button>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-muted">Unticked sections are hidden. Testimonials only appear when at least one verified testimonial is published.</p>
    </div>
  );
}

export function PointsEditor({ name, initial }: { name: string; initial: { title: string; body: string }[] }) {
  const [items, setItems] = useState(initial);
  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <ul className="space-y-3">
        {items.map((p, i) => (
          <li key={i} className="grid gap-2 rounded-xl border border-line p-3 md:grid-cols-[1fr_2fr_auto]">
            <input className="field" aria-label="Title" placeholder="Title" value={p.title} onChange={(e) => setItems((x) => x.map((y, k) => (k === i ? { ...y, title: e.target.value } : y)))} />
            <textarea className="field" rows={2} aria-label="Text" placeholder="Text" value={p.body} onChange={(e) => setItems((x) => x.map((y, k) => (k === i ? { ...y, body: e.target.value } : y)))} />
            <button type="button" aria-label="Remove" className="grid size-8 place-items-center rounded-full text-muted hover:text-[#8c321f]" onClick={() => setItems((x) => x.filter((_, k) => k !== i))}><Trash2 className="size-4" /></button>
          </li>
        ))}
      </ul>
      {items.length < 8 && (
        <button type="button" className="btn btn-ghost mt-3 !py-2" onClick={() => setItems((x) => [...x, { title: "", body: "" }])}><Plus className="size-4" /> Add point</button>
      )}
    </div>
  );
}
