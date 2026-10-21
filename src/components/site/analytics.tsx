"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import { track } from "@/lib/track";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const KEY = "sardar:analytics-consent";
const CHANGE = "sardar:consent-change";
type Choice = "accepted" | "declined" | "unset";

function readChoice(): Choice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "declined" ? v : "unset";
  } catch {
    return "unset";
  }
}
const subscribe = (cb: () => void) => {
  window.addEventListener(CHANGE, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE, cb);
    window.removeEventListener("storage", cb);
  };
};

/**
 * Consent-gated analytics (Google Analytics 4). Renders nothing unless
 * NEXT_PUBLIC_GA_ID is set. No script loads and no cookies are set until the
 * visitor accepts. Also tracks call / WhatsApp taps once consented.
 */
export function Analytics() {
  // null on the server, so the banner never flashes before we know the saved choice.
  const choice = useSyncExternalStore<Choice | null>(subscribe, readChoice, () => null);

  useEffect(() => {
    if (choice !== "accepted") return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      const href = a?.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) track("call_click", { location: window.location.pathname });
      else if (href.includes("wa.me")) track("whatsapp_click", { location: window.location.pathname });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [choice]);

  if (!GA_ID || choice === null) return null;
  const decide = (v: Exclude<Choice, "unset">) => {
    try { localStorage.setItem(KEY, v); } catch { /* storage unavailable */ }
    window.dispatchEvent(new Event(CHANGE));
  };

  return (
    <>
      {choice === "accepted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}</Script>
        </>
      )}
      {choice === "unset" && (
        <div role="dialog" aria-label="Cookie preferences" className="fixed inset-x-3 bottom-20 z-[80] mx-auto max-w-xl rounded-2xl bg-white p-5 shadow-[0_20px_60px_-15px_rgba(15,28,58,.5)] md:bottom-6 md:left-6 md:mx-0">
          <p className="text-sm leading-relaxed">We use cookies for anonymous visit statistics so we can improve the site. They stay off unless you accept. <Link href="/info/privacy" className="font-semibold text-forest underline">Privacy policy</Link></p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => decide("accepted")} className="btn btn-dark !px-5 !py-2.5">Accept</button>
            <button type="button" onClick={() => decide("declined")} className="btn btn-ghost !px-5 !py-2.5">Decline</button>
          </div>
        </div>
      )}
    </>
  );
}

/** Fires a lead conversion on the enquiry confirmation page. */
export function TrackLead({ reference }: { reference: string }) {
  useEffect(() => { track("generate_lead", { reference }); }, [reference]);
  return null;
}
