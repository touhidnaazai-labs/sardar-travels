import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-4 py-16">
      <div className="w-full max-w-sm rounded-[1.75rem] bg-white p-8 shadow-2xl">
        <p className="eyebrow">Sardar Travels</p>
        <h1 className="mt-2 mb-8 text-3xl font-light">Staff sign in</h1>
        <Suspense fallback={<div className="skeleton h-56" />}>
          <LoginForm />
        </Suspense>
        <Link href="/" className="mt-6 block text-center text-sm text-muted hover:text-ink">← Back to website</Link>
      </div>
    </div>
  );
}
