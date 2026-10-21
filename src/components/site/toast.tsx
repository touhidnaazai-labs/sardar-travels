"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

type Item = { id: number; message: string; kind: "success" | "error" };
const EVENT = "sardar:toast";

/** Show a short notification from anywhere on the client. */
export function toast(message: string, kind: Item["kind"] = "success") {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, kind } }));
}

export function ToastHost() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    let n = 0;
    const onToast = (e: Event) => {
      const { message, kind } = (e as CustomEvent<Omit<Item, "id">>).detail;
      const id = ++n;
      setItems((p) => [...p.slice(-2), { id, message, kind }]);
      setTimeout(() => setItems((p) => p.filter((i) => i.id !== id)), 4500);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[90] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
      {items.map((i) => (
        <div key={i.id} className="pointer-events-auto flex max-w-md items-center gap-3 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-xl animate-fade-up">
          {i.kind === "success" ? <CheckCircle2 className="size-5 shrink-0 text-accent" aria-hidden /> : <XCircle className="size-5 shrink-0 text-[#ff8a7a]" aria-hidden />}
          <span>{i.message}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setItems((p) => p.filter((x) => x.id !== i.id))} className="ml-1 opacity-70 hover:opacity-100"><X className="size-4" /></button>
        </div>
      ))}
    </div>
  );
}
