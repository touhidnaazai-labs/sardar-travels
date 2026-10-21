"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { login } from "@/app/actions/admin/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { ok: false });
  const next = useSearchParams().get("next") ?? "";
  // Controlled so a failed attempt doesn't wipe the email (React resets uncontrolled fields after an action).
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state.message && <p role="alert" className="rounded-lg bg-[#8c321f]/10 px-3 py-2 text-sm text-[#8c321f]">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn btn-dark w-full">
        {pending && <Loader2 className="size-4 animate-spin" />} Sign in
      </button>
    </form>
  );
}
