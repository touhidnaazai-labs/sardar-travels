"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import type { ActionResult } from "@/lib/admin-action";
import { cn } from "@/lib/utils";

type Action = (prev: ActionResult, fd: FormData) => Promise<ActionResult>;

const FormCtx = createContext<{ pending: boolean; errors?: Record<string, string> }>({ pending: false });
export const useAdminForm = () => useContext(FormCtx);

/**
 * Submits via a transition (so React doesn't reset uncontrolled fields) and
 * shows the server's result inline. Warns before leaving with unsaved edits.
 */
export function AdminForm({
  action,
  children,
  className,
  resetOnSuccess,
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, run, pending] = useActionState<ActionResult, FormData>(action, { ok: false });
  const [dirty, setDirty] = useState(false);
  const [shown, setShown] = useState<ActionResult | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    setShown(state);
    if (state.ok) setDirty(false);
  }

  useEffect(() => {
    if (state.ok && resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  useEffect(() => {
    if (!shown?.ok) return;
    const t = setTimeout(() => setShown(null), 4000);
    return () => clearTimeout(t);
  }, [shown]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  return (
    <FormCtx.Provider value={{ pending, errors: state.ok ? undefined : state.errors }}>
      <form
        ref={formRef}
        className={className}
        onChange={() => setDirty(true)}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
          startTransition(() => run(fd));
        }}
      >
        {children}
        {shown?.message && (
          <div
            role={shown.ok ? "status" : "alert"}
            className={cn(
              "fixed right-6 bottom-6 z-50 flex max-w-sm items-start gap-2 rounded-xl px-4 py-3 text-sm shadow-xl",
              shown.ok ? "bg-forest text-white" : "bg-[#8c321f] text-white",
            )}
          >
            {shown.ok ? <Check className="mt-0.5 size-4 shrink-0" /> : <AlertCircle className="mt-0.5 size-4 shrink-0" />}
            {shown.message}
          </div>
        )}
      </form>
    </FormCtx.Provider>
  );
}

export function SubmitButton({ children = "Save changes", className, name, value, variant = "primary" }: { children?: ReactNode; className?: string; name?: string; value?: string; variant?: "primary" | "dark" | "ghost" }) {
  const { pending } = useAdminForm();
  return (
    <button type="submit" name={name} value={value} disabled={pending} className={cn("btn !py-2.5", variant === "primary" ? "btn-primary" : variant === "dark" ? "btn-dark" : "btn-ghost", className)}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

type Base = { name: string; label: string; help?: string; className?: string; required?: boolean };

function Wrap({ name, label, help, className, children, required }: Base & { children: ReactNode }) {
  const { errors } = useAdminForm();
  const err = errors?.[name];
  return (
    <div className={className}>
      <label htmlFor={`f-${name}`} className="field-label">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {children}
      {err ? <p className="mt-1 text-xs font-medium text-[#a63d26]">{err}</p> : help ? <p className="mt-1 text-xs text-muted">{help}</p> : null}
    </div>
  );
}

export function TextField({ defaultValue, type = "text", placeholder, maxLength, ...p }: Base & { defaultValue?: string | number | null; type?: string; placeholder?: string; maxLength?: number }) {
  const { errors } = useAdminForm();
  return (
    <Wrap {...p}>
      <input id={`f-${p.name}`} name={p.name} type={type} required={p.required} defaultValue={defaultValue ?? ""} placeholder={placeholder} maxLength={maxLength} aria-invalid={errors?.[p.name] ? true : undefined} className="field" step={type === "number" ? "any" : undefined} />
    </Wrap>
  );
}

export function TextArea({ defaultValue, rows = 4, placeholder, ...p }: Base & { defaultValue?: string | null; rows?: number; placeholder?: string }) {
  return (
    <Wrap {...p}>
      <textarea id={`f-${p.name}`} name={p.name} required={p.required} rows={rows} defaultValue={defaultValue ?? ""} placeholder={placeholder} className="field resize-y" />
    </Wrap>
  );
}

export function SelectField({ defaultValue, options, ...p }: Base & { defaultValue?: string | null; options: { value: string; label: string }[] }) {
  return (
    <Wrap {...p}>
      <select id={`f-${p.name}`} name={p.name} defaultValue={defaultValue ?? ""} className="field">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Wrap>
  );
}

export function Toggle({ name, label, defaultChecked, help }: { name: string; label: string; defaultChecked?: boolean; help?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white px-4 py-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-[var(--accent)]" />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {help && <span className="block text-xs text-muted">{help}</span>}
      </span>
    </label>
  );
}

export function ColorField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  const [v, setV] = useState(defaultValue);
  return (
    <div>
      <label htmlFor={`f-${name}`} className="field-label">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={v} onChange={(e) => setV(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-white p-1" aria-label={`${label} picker`} />
        <input id={`f-${name}`} name={name} value={v} onChange={(e) => setV(e.target.value)} pattern="#[0-9a-fA-F]{6}" className="field font-mono" />
      </div>
    </div>
  );
}
