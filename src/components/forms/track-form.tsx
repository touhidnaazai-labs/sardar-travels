"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { acceptQuote, trackEnquiry, type TrackState } from "@/app/actions/enquiry";
import { cn } from "@/lib/utils";

const ORDER = ["new", "reviewing", "quote_sent", "awaiting_confirmation", "confirmed", "completed"] as const;
const SHORT: Record<string, string> = {
  new: "Received",
  reviewing: "Reviewing",
  quote_sent: "Quote sent",
  awaiting_confirmation: "Accepted",
  confirmed: "Confirmed",
  completed: "Completed",
};

export function TrackForm({ initialRef }: { initialRef: string }) {
  const [state, track, pending] = useActionState<TrackState, FormData>(trackEnquiry, { ok: false, ref: initialRef });
  const [acceptState, accept, accepting] = useActionState<TrackState, FormData>(acceptQuote, { ok: false });
  const view = acceptState.enquiry ? acceptState : state;
  const e = view.enquiry;

  return (
    <div className="space-y-10">
      <form action={track} className="grid gap-4 rounded-[1.75rem] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(15,27,45,.45)] sm:grid-cols-[1fr_1fr_auto] sm:items-end md:p-8">
        <div>
          <label htmlFor="ref" className="field-label">Reference</label>
          <input id="ref" name="ref" required defaultValue={state.ref ?? initialRef} placeholder="ST-261016-AB12" className="field uppercase" autoComplete="off" />
        </div>
        <div>
          <label htmlFor="contact" className="field-label">Email or phone used</label>
          <input id="contact" name="contact" required defaultValue={state.contact} className="field" autoComplete="email" />
        </div>
        <button type="submit" className="btn btn-dark" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />} Check status
        </button>
        {state.message && !state.ok && <p role="alert" className="text-sm text-[#a63d26] sm:col-span-3">{state.message}</p>}
      </form>

      {e && (
        <section aria-live="polite" className="rounded-[1.75rem] border border-line p-6 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{e.typeLabel} · {e.reference}</p>
              <h2 className="mt-2 text-3xl font-medium">{e.subject}</h2>
              <p className="mt-1 text-sm text-muted">Submitted {e.submittedOn}{e.travelDate && ` · Travel date ${new Date(`${e.travelDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`}</p>
            </div>
            <span className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", e.status === "cancelled" ? "bg-line text-muted" : "bg-accent-soft text-accent-strong")}>{e.statusLabel}</span>
          </div>

          {e.status !== "cancelled" && (
            <ol className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Progress">
              {ORDER.map((s, i) => {
                const reached = ORDER.indexOf(e.status as (typeof ORDER)[number]) >= i;
                return (
                  <li key={s} className="text-center">
                    <span className={cn("mx-auto block h-1.5 rounded-full", reached ? "bg-accent" : "bg-line")} />
                    <span className={cn("mt-2 block text-[0.7rem] font-semibold", reached ? "text-ink" : "text-muted")}>{SHORT[s]}</span>
                  </li>
                );
              })}
            </ol>
          )}
          <p className="mt-8 leading-relaxed">{e.explainer}</p>

          {e.quote && (
            <div className="mt-8 rounded-2xl bg-ivory p-6 md:p-8">
              <p className="eyebrow">Your quote · sent {e.quote.sentOn}</p>
              <p className="mt-3 font-display text-4xl font-medium">{e.quote.amountText}</p>
              <p className="mt-4 leading-relaxed whitespace-pre-line">{e.quote.summary}</p>
              {e.quote.validUntil && <p className="mt-3 text-sm text-muted">Valid until {new Date(`${e.quote.validUntil}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>}
              {e.canAccept && (
                <form action={accept} className="mt-6">
                  <input type="hidden" name="ref" value={view.ref ?? ""} />
                  <input type="hidden" name="contact" value={view.contact ?? ""} />
                  <button type="submit" className="btn btn-primary" disabled={accepting}>
                    {accepting && <Loader2 className="size-4 animate-spin" aria-hidden />} Accept this quote
                  </button>
                  <p className="mt-3 text-xs text-muted">Accepting tells our team you’d like to go ahead. We’ll then confirm the booking and payment details with you.</p>
                </form>
              )}
            </div>
          )}
          {acceptState.message && acceptState.ok && (
            <p className="mt-6 flex items-center gap-2 font-medium text-forest"><CheckCircle2 className="size-5" aria-hidden /> {acceptState.message}</p>
          )}
          {acceptState.message && !acceptState.ok && <p role="alert" className="mt-6 text-sm text-[#a63d26]">{acceptState.message}</p>}
        </section>
      )}
    </div>
  );
}
