#!/usr/bin/env node
/**
 * Runs supabase/schema.sql and supabase/seed.sql directly against a Postgres
 * connection string. One-off setup helper.
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_DB_URL="postgresql://postgres:PASSWORD@db.<ref>.supabase.co:5432/postgres"
 *   node scripts/db-setup.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const conn = process.env.SUPABASE_DB_URL;
if (!conn) {
  console.error("✖ Set SUPABASE_DB_URL to your Postgres connection string.");
  process.exit(1);
}

async function run() {
  const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("✓ connected");

  for (const file of ["schema.sql", "seed.sql"]) {
    const sql = readFileSync(join(ROOT, "supabase", file), "utf8");
    process.stdout.write(`Running ${file} … `);
    await client.query(sql); // simple-query protocol runs all statements in the file
    console.log("done");
  }

  await client.end();
  console.log("✅ Database schema + seed applied.");
}

run().catch((err) => {
  console.error("✖ Failed:", err.message ?? err);
  process.exit(1);
});
