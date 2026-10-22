"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { MessageCircle } from "lucide-react";
import { HANDOFF_KEY, type Handoff } from "@/lib/handoff";
import { CopyButton } from "./copy-button";

const subscribe = () => () => {};
const readHandoff = (): string | null => {
  try {
    return sessionStorage.getItem(HANDOFF_KEY);
  } catch {
    return null;
  }
};

/**
 * Shows the "send on WhatsApp" step. On phones it opens WhatsApp by itself
 * after a moment; on desktop the visitor taps the button.
 */
export function WhatsAppHandoff({ reference, fallbackNumber }: { reference: string; fallbackNumber: string }) {
  const raw = useSyncExternalStore(subscribe, readHandoff, () => null);
  const data = useMemo<Handoff | null>(() => {
    try {
      const h = raw ? (JSON.parse(raw) as Handoff) : null;
      return h && h.ref === reference ? h : null;
    } catch {
      return null;
    }
  }, [raw, reference]);

  const number = data?.number || fallbackNumber;
  const text = data?.text || `Hello Sardar Travels, I sent an enquiry on your website (ref ${reference}).`;
  const url = number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : "";

  useEffect(() => {
    if (!url || !data) return;
    const key = `sardar:wa-opened:${reference}`;
    let opened = false;
    try {
      opened = sessionStorage.getItem(key) === "1";
    } catch {}
    if (opened || !window.matchMedia("(pointer: coarse)").matches) return;
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem(key, "1");
      } catch {}
      window.location.href = url;
    }, 1800);
    return () => window.clearTimeout(t);
  }, [url, data, reference]);

  if (!url) return null;
  return (
    <div className="mt-8 rounded-2xl bg-ivory p-6">
      <p className="font-display text-xl font-semibold">One last step — send it on WhatsApp</p>
      <p className="mt-1 text-sm text-muted">Your details are ready in a WhatsApp message. Tap send so our team sees it straight away.</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp !py-3.5 text-base">
          <MessageCircle className="size-5" aria-hidden /> Send on WhatsApp
        </a>
        <CopyButton text={reference} />
      </div>
    </div>
  );
}
