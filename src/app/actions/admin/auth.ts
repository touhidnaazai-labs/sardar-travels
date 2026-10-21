"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { createSession, destroySession, requireUser, revokeUserSessions } from "@/lib/auth";
import { clearRateLimit, clientIpHash, rateLimit } from "@/lib/security";
import { fail, s, type ActionResult } from "@/lib/admin-action";

// Pre-computed hash so unknown emails take as long as wrong passwords.
const DUMMY_HASH = "$2b$12$kyvULy6KluwEzKtAz06d6.4OABn2YuspISjEky2HtTWng1glsEJie";

export async function login(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const email = s(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return fail("Enter your email and password.");

  const ip = await clientIpHash();
  const key = `login:${ip}:${email}`;
  if (!(await rateLimit(key, 6, 900))) return fail("Too many attempts. Please wait 15 minutes and try again.");

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid || !user.active) return fail("Incorrect email or password.");

  await clearRateLimit(key);
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
  await createSession(user.id);
  const next = s(fd, "next");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePassword(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const me = await requireUser();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("password") ?? "");
  if (next.length < 10) return fail("New password must be at least 10 characters.", { password: "At least 10 characters" });
  if (next !== String(fd.get("confirm") ?? "")) return fail("Passwords don't match.", { confirm: "Doesn't match" });
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, me.id));
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return fail("Current password is incorrect.", { current: "Incorrect" });
  await db.update(schema.users).set({ passwordHash: await bcrypt.hash(next, 12) }).where(eq(schema.users.id, me.id));
  await revokeUserSessions(me.id);
  await createSession(me.id);
  return { ok: true, message: "Password updated. Other devices have been signed out." };
}
