import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";

/** Database handle for CLI scripts (the app's client is server-only). */
export function scriptDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const client = postgres(url, {
    max: 1,
    prepare: process.env.DATABASE_PREPARE !== "false",
    ssl: process.env.DATABASE_SSL === "true" ? "require" : undefined,
    onnotice: () => {},
  });
  return { db: drizzle(client, { schema }), client, schema };
}
