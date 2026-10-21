"use client";

import { startTransition, useActionState, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { submitEnquiry, type FormState } from "@/app/actions/enquiry";
import { optLabel, optValue, type FieldDef } from "@/lib/form-fields";
import { cn } from "@/lib/utils";

const CONTACT_FIELDS: FieldDef[] = [
  { name: "name", label: "Full name", kind: "text", required: true, autoComplete: "name", width: "full" },
  { name: "email", label: "Email", kind: "text", required: true, autoComplete: "email", width: "half", placeholder: "you@example.com" },
  { name: "phone", label: "Phone / WhatsApp", kind: "text", required: true, autoComplete: "tel", width: "half", placeholder: "+91 98765 43210" },
  {
    name: "preferredContact",
    label: "Best way to reach you",
    kind: "choice",
    options: [
      { value: "phone", label: "Phone call" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "email", label: "Email" },
    ],
    width: "full",
  },
  { name: "message", label: "Anything else we should know?", kind: "textarea", width: "full", placeholder: "Special requests, pickup preferences, travellers' ages…" },
];

const todayIso = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

function clientError(f: FieldDef, value: string, values: Record<string, string>): string | undefined {
  const v = value.trim();
  if (f.required && !v) return `${f.label} is required`;
  if (!v) return;
  if (f.name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
  if (f.name === "phone" && !/^\+?[\d\s\-()]{7,20}$/.test(v)) return "Enter a valid phone number";
  if (f.kind === "number") {
    const n = Number(v);
    if (!Number.isInteger(n)) return "Enter a whole number";
    if (f.min !== undefined && n < f.min) return `Minimum ${f.min}`;
    if (f.max !== undefined && n > f.max) return `Maximum ${f.max}`;
  }
  if (f.kind === "date") {
    if (v < todayIso()) return "Date can't be in the past";
    if (f.after && values[f.after] && v < values[f.after]) return "Must be on or after the start date";
  }
}

const fieldKey = (f: FieldDef) => (f.detail ? `d_${f.name}` : f.name);

export function EnquiryWizard({
  type,
  tourId,
  subject,
  tripFields,
  defaults = {},
  tripStepTitle = "Trip details",
  submitLabel = "Send enquiry",
  tone = "light",
  note,
}: {
  type: "tour" | "planner" | "vehicle" | "hotel" | "intercity" | "general";
  tourId?: string;
  subject?: string;
  tripFields: FieldDef[];
  defaults?: Record<string, string>;
  tripStepTitle?: string;
  submitLabel?: string;
  tone?: "light" | "card";
  note?: string;
}) {
  const contactFields = useMemo(
    () =>
      type === "general"
        ? CONTACT_FIELDS.map((f) => (f.name === "message" ? { ...f, label: "How can we help?", required: true, placeholder: "" } : f))
        : CONTACT_FIELDS,
    [type],
  );
  const steps = useMemo(
    () =>
      tripFields.length
        ? [
            { title: tripStepTitle, fields: tripFields },
            { title: "Your details", fields: contactFields },
            { title: "Review & send", fields: [] as FieldDef[] },
          ]
        : [
            { title: "Your details", fields: contactFields },
            { title: "Review & send", fields: [] as FieldDef[] },
          ],
    [tripFields, tripStepTitle, contactFields],
  );
  const allFields = useMemo(() => steps.flatMap((s) => s.fields), [steps]);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = { preferredContact: "phone", adults: "2", children: "0", d_rooms: "1" };
    for (const f of allFields) if (f.kind === "select" && f.required && f.options?.length === 1) init[fieldKey(f)] = optValue(f.options[0]);
    return { ...init, ...defaults };
  });
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [touchedErrors, setTouchedErrors] = useState<Record<string, string>>({});
  const [ack, setAck] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(submitEnquiry, { ok: false });
  const startedAt = useRef(0);
  const topRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const uid = useId();

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // When the server rejects fields, jump back to the first step that has an error.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.errors) {
      const idx = steps.findIndex((s) => s.fields.some((f) => state.errors?.[fieldKey(f)]));
      if (idx >= 0) setStep(idx);
      setTouchedErrors(state.errors);
    }
  }

  const set = (key: string, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (touchedErrors[key])
      setTouchedErrors((prev) => {
        const rest = { ...prev };
        delete rest[key];
        return rest;
      });
  };

  const validateStep = (i: number) => {
    const errs: Record<string, string> = {};
    for (const f of steps[i].fields) {
      const e = clientError(f, values[fieldKey(f)] ?? "", values);
      if (e) errs[fieldKey(f)] = e;
    }
    setTouchedErrors(errs);
    if (Object.keys(errs).length) {
      const first = document.getElementById(`${uid}-${Object.keys(errs)[0]}`);
      first?.focus();
      return false;
    }
    return true;
  };

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    requestAnimationFrame(() => {
      const top = topRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 80) topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  };

  const next = () => {
    if (validateStep(step)) go(step + 1);
  };

  const submit = () => {
    for (let i = 0; i < steps.length - 1; i++) {
      if (!validateStep(i)) {
        go(i);
        return;
      }
    }
    if (!ack) return;
    const fd = new FormData();
    fd.set("type", type);
    if (tourId) fd.set("tourId", tourId);
    if (subject) fd.set("subject", subject);
    fd.set("startedAt", String(startedAt.current));
    fd.set("companyWebsite", (document.getElementById(`${uid}-hp`) as HTMLInputElement | null)?.value ?? "");
    for (const [k, v] of Object.entries(values)) if (v !== "") fd.set(k, v);
    startTransition(() => action(fd));
  };

  const isLast = step === steps.length - 1;
  const current = steps[step];

  return (
    <div ref={topRef} className={cn("scroll-mt-28", tone === "card" && "rounded-[1.75rem] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(15,27,45,.45)] md:p-9")}>
      {/* Stepper */}
      <ol className="mb-8 flex items-center gap-2" aria-label="Enquiry steps">
        {steps.map((s, i) => (
          <li key={s.title} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold transition-colors duration-500",
                i < step && "border-forest bg-forest text-white",
                i === step && "border-accent bg-accent text-white",
                i > step && "border-line text-muted",
              )}
              aria-current={i === step ? "step" : undefined}
            >
              {i < step ? <Check className="size-4" aria-hidden /> : i + 1}
            </span>
            <span className={cn("hidden text-xs font-semibold tracking-wide sm:block", i === step ? "text-ink" : "text-muted")}>{s.title}</span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-line" aria-hidden />}
          </li>
        ))}
      </ol>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (isLast) submit();
          else next();
        }}
      >
        {/* Honeypot: hidden from people, tempting for bots. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${uid}-hp`}>Company website</label>
          <input id={`${uid}-hp`} name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </div>

        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.fieldset
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: 24 * dir }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 * dir }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="min-w-0"
          >
            <legend className="sr-only">{current.title}</legend>
            {isLast ? (
              <Review steps={steps} values={values} ack={ack} setAck={setAck} note={note} />
            ) : (
              <div className="grid grid-cols-6 gap-x-4 gap-y-5">
                {current.fields.map((f) => (
                  <FieldControl
                    key={f.name}
                    id={`${uid}-${fieldKey(f)}`}
                    field={f}
                    value={values[fieldKey(f)] ?? ""}
                    error={touchedErrors[fieldKey(f)]}
                    onChange={(v) => set(fieldKey(f), v)}
                    minDate={f.after && values[f.after] ? values[f.after] : undefined}
                  />
                ))}
              </div>
            )}
          </motion.fieldset>
        </AnimatePresence>

        {state.message && !state.ok && (
          <p role="alert" className="mt-6 rounded-xl bg-[#b4472f]/8 px-4 py-3 text-sm text-[#8c321f]">
            {state.message}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} className="btn btn-ghost" disabled={pending}>
              <ArrowLeft className="size-4" aria-hidden /> Back
            </button>
          ) : (
            <span />
          )}
          {isLast ? (
            <button type="submit" className="btn btn-primary" disabled={pending || !ack} aria-disabled={pending || !ack}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {pending ? "Sending…" : submitLabel}
            </button>
          ) : (
            <button type="submit" className="btn btn-dark">
              Continue <ArrowRight className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function FieldControl({
  id,
  field: f,
  value,
  error,
  onChange,
  minDate,
}: {
  id: string;
  field: FieldDef;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  minDate?: string;
}) {
  const span = f.width === "half" ? "col-span-6 sm:col-span-3" : f.width === "third" ? "col-span-6 sm:col-span-2" : "col-span-6";
  const describedBy = [error ? `${id}-err` : "", f.help ? `${id}-help` : ""].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    "aria-required": f.required || undefined,
  };

  return (
    <div className={span}>
      {f.kind === "choice" ? (
        <div role="radiogroup" aria-labelledby={`${id}-label`} {...(error ? { "aria-describedby": `${id}-err` } : {})}>
          <span id={`${id}-label`} className="field-label">
            {f.label}
            {f.required && <span className="text-accent"> *</span>}
          </span>
          <div className="flex flex-wrap gap-2">
            {f.options?.map((o) => {
              const checked = value === optValue(o);
              return (
                <label
                  key={optValue(o)}
                  className={cn(
                    "cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent",
                    checked ? "border-ink bg-ink text-ivory" : "border-line bg-white hover:border-ink/40",
                  )}
                >
                  <input type="radio" className="sr-only" name={id} value={optValue(o)} checked={checked} onChange={() => onChange(optValue(o))} />
                  {optLabel(o)}
                </label>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <label htmlFor={id} className="field-label">
            {f.label}
            {f.required && <span className="text-accent"> *</span>}
          </label>
          {f.kind === "select" ? (
            <select {...common} className="field" value={value} onChange={(e) => onChange(e.target.value)}>
              <option value="">{f.placeholder ?? "Select…"}</option>
              {f.options?.map((o) => (
                <option key={optValue(o)} value={optValue(o)}>
                  {optLabel(o)}
                </option>
              ))}
            </select>
          ) : f.kind === "textarea" ? (
            <textarea {...common} className="field min-h-28 resize-y" value={value} placeholder={f.placeholder} maxLength={3000} onChange={(e) => onChange(e.target.value)} />
          ) : (
            <input
              {...common}
              className="field"
              type={f.kind === "text" ? (f.name === "email" ? "email" : f.name === "phone" ? "tel" : "text") : f.kind}
              inputMode={f.kind === "number" ? "numeric" : f.name === "phone" ? "tel" : undefined}
              autoComplete={f.autoComplete}
              value={value}
              min={f.kind === "number" ? f.min : f.kind === "date" ? minDate : undefined}
              max={f.kind === "number" ? f.max : undefined}
              placeholder={f.placeholder}
              maxLength={f.kind === "text" ? 200 : undefined}
              onFocus={(e) => {
                if (f.kind === "date" && !minDate) e.currentTarget.min = todayIso();
              }}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        </>
      )}
      {f.help && !error && (
        <p id={`${id}-help`} className="mt-1.5 text-xs text-muted">
          {f.help}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-xs font-medium text-[#a63d26]">
          {error}
        </p>
      )}
    </div>
  );
}

function Review({
  steps,
  values,
  ack,
  setAck,
  note,
}: {
  steps: { title: string; fields: FieldDef[] }[];
  values: Record<string, string>;
  ack: boolean;
  setAck: (v: boolean) => void;
  note?: string;
}) {
  const display = (f: FieldDef) => {
    const v = values[fieldKey(f)];
    if (!v) return null;
    const opt = f.options?.find((o) => optValue(o) === v);
    if (opt) return optLabel(opt);
    if (f.kind === "date") return new Date(`${v}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    return v;
  };
  return (
    <div>
      <dl className="divide-y divide-line rounded-2xl border border-line bg-paper/70">
        {steps.slice(0, -1).flatMap((s) =>
          s.fields
            .filter((f) => display(f))
            .map((f) => (
              <div key={f.name} className="grid gap-1 px-5 py-3 sm:grid-cols-3">
                <dt className="text-xs font-bold tracking-wider text-muted uppercase">{f.label}</dt>
                <dd className="text-sm break-words whitespace-pre-line sm:col-span-2">{display(f)}</dd>
              </div>
            )),
        )}
      </dl>
      {note && <p className="mt-5 text-sm text-muted">{note}</p>}
      <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-1 size-4 accent-[var(--accent)]" />
        <span>
          I understand this is an <strong>enquiry, not a confirmed booking</strong>. Sardar Travels will contact me with availability and a quote, and may use these details to respond.
        </span>
      </label>
    </div>
  );
}
