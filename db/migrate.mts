import { migrate } from "drizzle-orm/postgres-js/migrator";
import { scriptDb } from "./script-db";

const { db, client } = scriptDb();
await migrate(db, { migrationsFolder: "./db/migrations" });
console.log("✓ Migrations applied");
await client.end();
