/**
 * Create or reset an administrator.
 *   npm run admin:create -- --email you@example.com --name "Your Name" [--role staff]
 * The password is read from ADMIN_PASSWORD or prompted for on stdin.
 */
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { scriptDb } from "./script-db";

const args = Object.fromEntries(
  process.argv.slice(2).reduce<string[][]>((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1] ?? ""]);
    return acc;
  }, []),
);
const email = (args.email || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const name = args.name || process.env.ADMIN_NAME || "Administrator";
const role = args.role === "staff" ? "staff" : "admin";
let password = process.env.ADMIN_PASSWORD_OVERRIDE || "";
if (!email) throw new Error("Provide --email or ADMIN_EMAIL");
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question("Password (min 10 chars): ");
  rl.close();
}
if (password.length < 10) throw new Error("Password must be at least 10 characters");

const { db, client, schema } = scriptDb();
const passwordHash = await bcrypt.hash(password, 12);
await db
  .insert(schema.users)
  .values({ email, name, role, passwordHash })
  .onConflictDoUpdate({ target: schema.users.email, set: { passwordHash, role, name, active: true } });
console.log(`✓ ${role} account ready for ${email}`);
await client.end();
