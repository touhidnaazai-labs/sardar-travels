import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { db, schema } from "@/db";

function secret() {
  const s = process.env.APP_SECRET;
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV === "production") throw new Error("APP_SECRET must be set (16+ chars) in production");
    return "dev-only-secret-change-me";
  }
  return s;
}

export async function clientIpHash() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim();
  return createHash("sha256").update(`${secret()}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Sliding-window rate limit stored in Postgres so it works across serverless
 * instances. Returns true when the action is allowed (and records it).
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const since = new Date(Date.now() - windowSeconds * 1000);
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.rateLimits)
    .where(and(eq(schema.rateLimits.key, key), gt(schema.rateLimits.createdAt, since)));
  if (n >= limit) return false;
  await db.insert(schema.rateLimits).values({ key });
  // Opportunistic cleanup of old rows.
  if (Math.random() < 0.05) {
    await db.delete(schema.rateLimits).where(lt(schema.rateLimits.createdAt, new Date(Date.now() - 86_400_000)));
  }
  return true;
}

export async function clearRateLimit(key: string) {
  await db.delete(schema.rateLimits).where(eq(schema.rateLimits.key, key));
}
