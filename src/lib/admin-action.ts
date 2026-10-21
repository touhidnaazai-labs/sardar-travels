import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/data";

export type ActionResult = { ok: boolean; message?: string; errors?: Record<string, string>; id?: string };

export const s = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};
export const b = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
export const n = (fd: FormData, k: string): number | null => {
  const v = s(fd, k);
  if (v === "") return null;
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
};
export const lines = (fd: FormData, k: string) =>
  s(fd, k)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
export function json<T>(fd: FormData, k: string, fallback: T): T {
  try {
    const v = s(fd, k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
export const nullable = (v: string) => (v ? v : null);
export const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

/** Refresh the public cache and the dashboard after a content change. */
export function contentChanged() {
  updateTag(CONTENT_TAG);
  revalidatePath("/admin", "layout");
}

export function fail(message: string, errors?: Record<string, string>): ActionResult {
  return { ok: false, message, errors };
}

export function pgErrorCode(err: unknown) {
  const e = err as { code?: string; cause?: { code?: string } };
  return e.code ?? e.cause?.code;
}
