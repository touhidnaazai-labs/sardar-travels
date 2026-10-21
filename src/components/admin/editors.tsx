"use client";

import Image from "next/image";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, ImagePlus, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import type { FaqItem, GalleryItem, ItineraryDay, PricingRule } from "@/db/schema";
import { uploadMedia, type UploadedMedia } from "@/app/actions/admin/media";
import { useAdminForm } from "./form";
import { cn } from "@/lib/utils";

export type MediaOption = UploadedMedia;

function move<T>(arr: T[], i: number, d: number) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

function IconBtn({ label, onClick, children, danger }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cn("grid size-8 place-items-center rounded-full text-muted hover:bg-paper", danger ? "hover:text-[#8c321f]" : "hover:text-ink")}>
      {children}
    </button>
  );
}

function FieldError({ name }: { name: string }) {
  const { errors } = useAdminForm();
  return errors?.[name] ? <p className="mt-2 text-xs font-medium text-[#a63d26]">{errors[name]}</p> : null;
}

/* ------------------------------------------------------------------ */

export function ItineraryEditor({ name, initial }: { name: string; initial: ItineraryDay[] }) {
  const [days, setDays] = useState<ItineraryDay[]>(initial);
  const update = (i: number, patch: Partial<ItineraryDay>) => setDays((d) => d.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const updateStop = (i: number, j: number, patch: Partial<ItineraryDay["stops"][number]>) =>
    update(i, { stops: days[i].stops.map((s, k) => (k === j ? { ...s, ...patch } : s)) });

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(days)} />
      <p className="mb-4 text-xs text-muted">Add one block per day. Use several blocks with the same day number to split a day into parts (for example morning and afternoon).</p>
      <ol className="space-y-4">
        {days.map((day, i) => (
          <li key={i} className="rounded-xl border border-line bg-paper/60 p-4">
            <div className="flex flex-wrap items-end gap-3">
              <label className="w-20">
                <span className="field-label">Day</span>
                <input type="number" min={1} max={60} className="field" value={day.day} onChange={(e) => update(i, { day: Number(e.target.value) || 1 })} />
              </label>
              <label className="min-w-48 flex-1">
                <span className="field-label">Title</span>
                <input className="field" value={day.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="e.g. Mysuru to Ooty" />
              </label>
              <label className="w-48">
                <span className="field-label">Overnight at</span>
                <input className="field" value={day.overnight ?? ""} onChange={(e) => update(i, { overnight: e.target.value })} placeholder="optional" />
              </label>
              <div className="flex">
                <IconBtn label="Move up" onClick={() => setDays((d) => move(d, i, -1))}><ArrowUp className="size-4" /></IconBtn>
                <IconBtn label="Move down" onClick={() => setDays((d) => move(d, i, 1))}><ArrowDown className="size-4" /></IconBtn>
                <IconBtn label="Remove day" danger onClick={() => setDays((d) => d.filter((_, k) => k !== i))}><Trash2 className="size-4" /></IconBtn>
              </div>
            </div>
            <label className="mt-3 block">
              <span className="field-label">Summary (optional)</span>
              <textarea className="field" rows={2} value={day.summary ?? ""} onChange={(e) => update(i, { summary: e.target.value })} />
            </label>
            <p className="field-label mt-4">Stops & attractions</p>
            <ul className="space-y-2">
              {day.stops.map((stop, j) => (
                <li key={j} className="grid grid-cols-[6rem_1fr_auto] gap-2 md:grid-cols-[7rem_1fr_1fr_auto]">
                  <input className="field !py-2" aria-label="Time" placeholder="Time" value={stop.time ?? ""} onChange={(e) => updateStop(i, j, { time: e.target.value })} />
                  <input className="field !py-2" aria-label="Attraction" placeholder="Attraction / activity" value={stop.name} onChange={(e) => updateStop(i, j, { name: e.target.value })} />
                  <input className="field col-span-2 !py-2 md:col-span-1" aria-label="Note" placeholder="Note (optional)" value={stop.note ?? ""} onChange={(e) => updateStop(i, j, { note: e.target.value })} />
                  <div className="col-start-3 row-start-1 flex md:col-start-auto">
                    <IconBtn label="Move up" onClick={() => update(i, { stops: move(day.stops, j, -1) })}><ArrowUp className="size-4" /></IconBtn>
                    <IconBtn label="Remove stop" danger onClick={() => update(i, { stops: day.stops.filter((_, k) => k !== j) })}><X className="size-4" /></IconBtn>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-strong" onClick={() => update(i, { stops: [...day.stops, { name: "" }] })}>
              <Plus className="size-4" /> Add stop
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="btn btn-ghost mt-4 !py-2"
        onClick={() => setDays((d) => [...d, { day: (d.at(-1)?.day ?? 0) + 1, title: "", stops: [{ name: "" }] }])}
      >
        <Plus className="size-4" /> Add day
      </button>
      <FieldError name={name} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function FaqEditor({ name, initial }: { name: string; initial: FaqItem[] }) {
  const [items, setItems] = useState(initial);
  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <ul className="space-y-3">
        {items.map((f, i) => (
          <li key={i} className="rounded-xl border border-line p-3">
            <div className="flex gap-2">
              <input className="field" placeholder="Question" aria-label="Question" value={f.q} onChange={(e) => setItems((x) => x.map((y, k) => (k === i ? { ...y, q: e.target.value } : y)))} />
              <IconBtn label="Remove" danger onClick={() => setItems((x) => x.filter((_, k) => k !== i))}><Trash2 className="size-4" /></IconBtn>
            </div>
            <textarea className="field mt-2" rows={2} placeholder="Answer" aria-label="Answer" value={f.a} onChange={(e) => setItems((x) => x.map((y, k) => (k === i ? { ...y, a: e.target.value } : y)))} />
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-ghost mt-3 !py-2" onClick={() => setItems((x) => [...x, { q: "", a: "" }])}>
        <Plus className="size-4" /> Add question
      </button>
      <FieldError name={name} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function PricingRulesEditor({ name, initial }: { name: string; initial: PricingRule[] }) {
  const [rules, setRules] = useState(initial);
  const set = (i: number, patch: Partial<PricingRule>) => setRules((r) => r.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(rules)} />
      {rules.length > 0 && (
        <ul className="space-y-2">
          {rules.map((r, i) => (
            <li key={i} className="grid grid-cols-[1fr_7rem_auto] gap-2 md:grid-cols-[1fr_8rem_10rem_auto]">
              <input className="field !py-2" aria-label="Label" placeholder="e.g. Sedan (up to 4)" value={r.label} onChange={(e) => set(i, { label: e.target.value })} />
              <input className="field !py-2" aria-label="Amount" type="number" min={0} placeholder="Amount" value={Number.isFinite(r.amount) ? r.amount : ""} onChange={(e) => set(i, { amount: Number(e.target.value) })} />
              <input className="field col-span-2 !py-2 md:col-span-1" aria-label="Basis" placeholder="per vehicle" value={r.basis ?? ""} onChange={(e) => set(i, { basis: e.target.value })} />
              <div className="col-start-3 row-start-1 md:col-start-auto">
                <IconBtn label="Remove" danger onClick={() => setRules((x) => x.filter((_, k) => k !== i))}><Trash2 className="size-4" /></IconBtn>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="btn btn-ghost mt-3 !py-2" onClick={() => setRules((x) => [...x, { label: "", amount: 0, basis: "" }])}>
        <Plus className="size-4" /> Add price option
      </button>
      <FieldError name={name} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function UploadButton({ onUploaded, multiple }: { onUploaded: (items: MediaOption[]) => void; multiple?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (!files.length) return;
          const fd = new FormData();
          files.forEach((f) => fd.append("files", f));
          setError("");
          start(async () => {
            const res = await uploadMedia(fd);
            if (res.items.length) onUploaded(res.items);
            if (!res.ok) setError(res.message ?? "Upload failed");
            if (input.current) input.current.value = "";
          });
        }}
      />
      <button type="button" className="btn btn-ghost !py-2" disabled={pending} onClick={() => input.current?.click()}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload {multiple ? "images" : "image"}
      </button>
      {error && <p className="text-xs text-[#a63d26]">{error}</p>}
    </>
  );
}

function PickerModal({
  media,
  selected,
  multiple,
  onClose,
  onDone,
  onUploaded,
}: {
  media: MediaOption[];
  selected: string[];
  multiple?: boolean;
  onClose: () => void;
  onDone: (ids: string[]) => void;
  onUploaded: (items: MediaOption[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>(selected);
  const [q, setQ] = useState("");
  const shown = media.filter((m) => !q || m.alt.toLowerCase().includes(q.toLowerCase()));
  return (
    <div role="dialog" aria-modal="true" aria-label="Choose image" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <h2 className="mr-auto font-sans text-base font-bold">{multiple ? "Choose images" : "Choose an image"}</h2>
          <input className="field !w-56 !py-2" placeholder="Search by description" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search images" />
          <UploadButton multiple={multiple} onUploaded={(items) => { onUploaded(items); setPicked((p) => (multiple ? [...p, ...items.map((i) => i.id)] : [items[0].id])); }} />
          <IconBtn label="Close" onClick={onClose}><X className="size-5" /></IconBtn>
        </div>
        <ul className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-3 md:grid-cols-4">
          {shown.map((m) => {
            const on = picked.includes(m.id);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setPicked((p) => (multiple ? (on ? p.filter((x) => x !== m.id) : [...p, m.id]) : [m.id]))}
                  className={cn("relative block aspect-[4/3] w-full overflow-hidden rounded-xl ring-offset-2", on ? "ring-3 ring-accent" : "hover:opacity-90")}
                  aria-pressed={on}
                >
                  <Image src={m.src} alt={m.alt} fill sizes="200px" className="object-cover" />
                  {on && <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-accent text-white"><Check className="size-4" /></span>}
                </button>
                <p className="mt-1 truncate text-xs text-muted">{m.alt || "No description"}</p>
              </li>
            );
          })}
        </ul>
        <div className="flex justify-end gap-2 border-t border-line p-4">
          <button type="button" className="btn btn-ghost !py-2" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary !py-2" onClick={() => onDone(picked)}>Use {multiple ? `${picked.length} image${picked.length === 1 ? "" : "s"}` : "image"}</button>
        </div>
      </div>
    </div>
  );
}

/** Single-image picker writing the selected media id into a hidden input. */
export function ImagePicker({ name, label, media: initialMedia, value, help }: { name: string; label: string; media: MediaOption[]; value: string | null; help?: string }) {
  const [media, setMedia] = useState(initialMedia);
  const [id, setId] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const current = media.find((m) => m.id === id);
  return (
    <div>
      <span className="field-label">{label}</span>
      <input type="hidden" name={name} value={id} />
      <div className="flex items-center gap-4">
        <div className="relative aspect-[4/3] w-40 shrink-0 overflow-hidden rounded-xl border border-line bg-paper">
          {current ? <Image src={current.src} alt={current.alt} fill sizes="160px" className="object-cover" /> : <span className="grid h-full place-items-center text-xs text-muted">No image</span>}
        </div>
        <div className="flex flex-col items-start gap-2">
          <button type="button" className="btn btn-ghost !py-2" onClick={() => setOpen(true)}><ImagePlus className="size-4" /> {current ? "Change" : "Choose"}</button>
          {current && <button type="button" className="text-xs text-muted hover:text-[#8c321f]" onClick={() => setId("")}>Remove</button>}
        </div>
      </div>
      {help && <p className="mt-1 text-xs text-muted">{help}</p>}
      {open && (
        <PickerModal
          media={media}
          selected={id ? [id] : []}
          onClose={() => setOpen(false)}
          onUploaded={(items) => setMedia((m) => [...items, ...m])}
          onDone={(ids) => { setId(ids[0] ?? ""); setOpen(false); }}
        />
      )}
    </div>
  );
}

/** Ordered multi-image picker with captions (tour galleries, hero slideshows). */
export function GalleryPicker({ name, media: initialMedia, value, captions = true, idsOnly }: { name: string; media: MediaOption[]; value: GalleryItem[]; captions?: boolean; idsOnly?: boolean }) {
  const [media, setMedia] = useState(initialMedia);
  const [items, setItems] = useState<GalleryItem[]>(value.filter((g) => initialMedia.some((m) => m.id === g.mediaId)));
  const [open, setOpen] = useState(false);
  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(idsOnly ? items.map((i) => i.mediaId) : items)} />
      {items.length === 0 && <p className="mb-3 text-sm text-muted">No images selected.</p>}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((g, i) => {
          const m = media.find((x) => x.id === g.mediaId);
          return (
            <li key={`${g.mediaId}-${i}`} className="rounded-xl border border-line p-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-paper">
                {m && <Image src={m.src} alt={m.alt} fill sizes="240px" className="object-cover" />}
                <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 text-xs text-white">{i + 1}</span>
              </div>
              {captions && (
                <input className="field mt-2 !py-1.5 text-sm" placeholder="Caption" aria-label="Caption" value={g.caption ?? ""} onChange={(e) => setItems((x) => x.map((y, k) => (k === i ? { ...y, caption: e.target.value } : y)))} />
              )}
              <div className="mt-1 flex justify-end">
                <IconBtn label="Move earlier" onClick={() => setItems((x) => move(x, i, -1))}><ArrowUp className="size-4 -rotate-90" /></IconBtn>
                <IconBtn label="Move later" onClick={() => setItems((x) => move(x, i, 1))}><ArrowDown className="size-4 -rotate-90" /></IconBtn>
                <IconBtn label="Remove" danger onClick={() => setItems((x) => x.filter((_, k) => k !== i))}><Trash2 className="size-4" /></IconBtn>
              </div>
            </li>
          );
        })}
      </ul>
      <button type="button" className="btn btn-ghost mt-3 !py-2" onClick={() => setOpen(true)}><ImagePlus className="size-4" /> Add or remove images</button>
      {open && (
        <PickerModal
          multiple
          media={media}
          selected={items.map((i) => i.mediaId)}
          onClose={() => setOpen(false)}
          onUploaded={(up) => setMedia((m) => [...up, ...m])}
          onDone={(ids) => {
            setItems((cur) => ids.map((id) => cur.find((c) => c.mediaId === id) ?? { mediaId: id, caption: media.find((m) => m.id === id)?.alt ?? "" }));
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
