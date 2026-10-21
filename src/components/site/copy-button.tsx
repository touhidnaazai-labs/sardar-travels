"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "./toast";

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-ghost !px-4 !py-2 text-sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          toast("Reference copied to clipboard");
          setTimeout(() => setDone(false), 2000);
        } catch {
          toast("Couldn’t copy — please select the reference manually", "error");
        }
      }}
    >
      {done ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span aria-live="polite">{done ? "Copied" : "Copy"}</span>
    </button>
  );
}
