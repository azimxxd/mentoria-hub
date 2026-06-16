#!/usr/bin/env node
/**
 * Applies supabase/upgrade-2026.sql (mentor role, leaderboard, Telegram login,
 * lesson-video storage) against a Postgres connection string.
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_DB_URL="postgresql://postgres:PASSWORD@db.<ref>.supabase.co:5432/postgres"
 *   node scripts/upgrade-db.mjs
 *
 * Or just paste supabase/upgrade-2026.sql into the Supabase SQL editor.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const conn = process.env.SUPABASE_DB_URL;
if (!conn) {
  console.error("✖ Set SUPABASE_DB_URL to your Postgres connection string (Supabase → Settings → Database).");
  process.exit(1);
}

async function run() {
  const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("✓ connected");
  const sql = readFileSync(join(ROOT, "supabase", "upgrade-2026.sql"), "utf8");
  process.stdout.write("Running upgrade-2026.sql … ");
  await client.query(sql);
  console.log("done");
  await client.end();
  console.log("✅ Upgrade applied: roles, leaderboard, Telegram login, video storage.");
}

run().catch((err) => {
  console.error("✖ Failed:", err.message ?? err);
  process.exit(1);
});
