"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { submitEnquiry, type FormState } from "@/app/actions/enquiry";
import { cn } from "@/lib/utils";
import { toast } from "@/components/site/toast";

export type QuickOption = { value: string; label: string; tourId?: string };

/**
 * Two-required-field enquiry (name + phone). Asking for less up front is the
 * biggest lever on completion; everything else is gathered on the callback.
 * `bar` lays the fields out in one row (hero); `card` stacks them (CTA band).
 */
export function QuickQuote({
  options,
  layout = "card",
  title = "Get a free quote",
  subtitle,
}: {
  options: QuickOption[];
  layout?: "bar" | "card";
  title?: string;
  subtitle?: string;
}) {
  const uid = useId();
  const [state, action, pending] = useActionState<FormState, FormData>(submitEnquiry, { ok: false });
  const [v, setV] = useState({ name: "", phone: "", need: "", travelDate: "", adults: "2" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.errors) setErrors(state.errors);
    if (state.message && !state.ok) toast(state.message, "error");
  }

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (v.name.trim().length < 2) errs.name = "Please enter your name";
    if (!/^\+?[\d\s\-()]{7,20}$/.test(v.phone.trim())) errs.phone = "Enter a valid phone number";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const opt = options.find((o) => o.value === v.need);
    const fd = new FormData();
    fd.set("type", "planner");
    fd.set("startedAt", String(startedAt.current));
    fd.set("companyWebsite", (e.currentTarget.elements.namedItem("companyWebsite") as HTMLInputElement).value);
    fd.set("name", v.name);
    fd.set("phone", v.phone);
    fd.set("adults", v.adults || "1");
    if (v.travelDate) fd.set("travelDate", v.travelDate);
    if (opt?.tourId) fd.set("tourId", opt.tourId);
    fd.set("subject", opt ? opt.label : "Quick quote request");
    fd.set("d_interestedIn", opt?.label ?? "Not specified");
    fd.set("d_source", layout === "bar" ? "Hero trip bar" : "Quick quote card");
    startTransition(() => action(fd));
  };

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} className="mt-1 text-xs font-semibold text-[#a63d26]">
        {errors[k]}
      </p>
    ) : null;
  const bar = layout === "bar";

  return (
    <form
      onSubmit={submit}
      noValidate
      className={cn(
        "relative rounded-2xl bg-white text-ink shadow-[0_30px_80px_-30px_rgba(15,28,58,.45)]",
        bar ? "p-5 md:p-6" : "p-6 md:p-8",
      )}
    >
      <div className={cn("flex flex-wrap items-baseline justify-between gap-x-4", bar ? "mb-4" : "mb-5")}>
        <p className="font-display text-xl font-semibold">{title}</p>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={cn("grid gap-4", bar ? "sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr_0.9fr_5.5rem_auto] lg:items-end" : "grid-cols-2")}>
        <div className={bar ? "" : "col-span-2"}>
          <label htmlFor={`${uid}-name`} className="field-label">Your name</label>
          <input id={`${uid}-name`} className="field" autoComplete="name" value={v.name} onChange={set("name")} aria-invalid={!!errors.name || undefined} aria-describedby={errors.name ? `${uid}-name-err` : undefined} />
          {err("name")}
        </div>
        <div className={bar ? "" : "col-span-2"}>
          <label htmlFor={`${uid}-phone`} className="field-label">Phone / WhatsApp</label>
          <input id={`${uid}-phone`} className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" value={v.phone} onChange={set("phone")} aria-invalid={!!errors.phone || undefined} aria-describedby={errors.phone ? `${uid}-phone-err` : undefined} />
          {err("phone")}
        </div>
        <div className={bar ? "" : "col-span-2"}>
          <label htmlFor={`${uid}-need`} className="field-label">Interested in</label>
          <select id={`${uid}-need`} className="field" value={v.need} onChange={set("need")}>
            <option value="">Not sure — help me choose</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-date`} className="field-label">Travel date</label>
          <input
            id={`${uid}-date`}
            type="date"
            className="field"
            value={v.travelDate}
            onChange={set("travelDate")}
            onFocus={(e) => {
              const d = new Date();
              d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
              e.currentTarget.min = d.toISOString().slice(0, 10);
            }}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-pax`} className="field-label">People</label>
          <input id={`${uid}-pax`} type="number" min={1} max={99} inputMode="numeric" className="field" value={v.adults} onChange={set("adults")} />
        </div>
        <button type="submit" disabled={pending} className={cn("btn btn-primary !py-3.5", bar ? "sm:col-span-2 lg:col-span-1" : "col-span-2 w-full text-base")}>
          {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
          {pending ? "Sending…" : "Get my quote"}
          {!pending && <ArrowRight className="size-5" aria-hidden />}
        </button>
      </div>
      {state.message && !state.ok && (
        <p role="alert" className="mt-4 rounded-lg bg-[#b4472f]/8 px-3 py-2 text-sm text-[#8c321f]">{state.message}</p>
      )}
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
        <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Free to ask — no payment. We’ll call you with a price, and nothing is booked until you accept it.
      </p>
    </form>
  );
}
