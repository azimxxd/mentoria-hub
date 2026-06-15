#!/usr/bin/env node
/**
 * Creates the two demo auth users (student + admin) in Supabase and sets their
 * profile fields. The catalog (opportunities / courses / lessons) is seeded by
 * supabase/seed.sql — run that in the SQL editor first.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Run:  node scripts/seed-supabase.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// minimal .env.local loader
function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = join(ROOT, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("✖ Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const DEMO = [
  {
    email: "student@demo.com",
    password: "demo1234",
    full_name: "Aru Student",
    profile: {
      role: "student",
      onboarded: true,
      grade: 11,
      interests: ["Business", "Coding", "Finance"],
      subjects: ["Mathematics", "English", "Economics"],
      goals: ["Apply to university", "Win a competition", "Learn to code"],
    },
  },
  {
    email: "admin@demo.com",
    password: "admin1234",
    full_name: "Mentoria Admin",
    profile: { role: "admin", onboarded: true },
  },
];

async function findUserByEmail(email) {
  // listUsers is paginated; demo projects are tiny so one page is enough.
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  return data?.users?.find((u) => u.email === email) ?? null;
}

async function upsertUser(d) {
  let user = await findUserByEmail(d.email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: d.email,
      password: d.password,
      email_confirm: true,
      user_metadata: { full_name: d.full_name },
    });
    if (error) throw error;
    user = data.user;
    console.log(`+ created ${d.email}`);
  } else {
    console.log(`= ${d.email} already exists`);
  }

  // The on_auth_user_created trigger inserts the profile row; update its fields.
  const { error: pErr } = await admin
    .from("profiles")
    .update({ full_name: d.full_name, email: d.email, ...d.profile })
    .eq("id", user.id);
  if (pErr) throw pErr;
  console.log(`  profile updated (role: ${d.profile.role})`);
}

async function main() {
  for (const d of DEMO) await upsertUser(d);
  console.log("\n✅ Demo users ready:");
  console.log("   student@demo.com / demo1234");
  console.log("   admin@demo.com   / admin1234");
}

main().catch((err) => {
  console.error("✖ Seeding failed:", err.message ?? err);
  process.exit(1);
});
