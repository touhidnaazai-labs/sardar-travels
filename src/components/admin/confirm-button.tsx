"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Two-click destructive action that calls a bound server action. */
export function ConfirmButton({ action, label = "Delete", confirmLabel = "Click again to confirm", className }: { action: () => Promise<unknown>; label?: string; confirmLabel?: string; className?: string }) {
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onBlur={() => setArmed(false)}
      onClick={() => {
        if (!armed) return setArmed(true);
        start(async () => {
          await action();
          setArmed(false);
        });
      }}
      className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors", armed ? "bg-[#8c321f] text-white" : "text-[#8c321f] hover:bg-[#8c321f]/10", className)}
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
      {armed ? confirmLabel : label}
    </button>
  );
}
