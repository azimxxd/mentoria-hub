import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Deterministic, stable per-Telegram-user credentials. The password is derived
// from a server secret + the Telegram user id, so it is the same on every login
// and never has to be stored anywhere.
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "mentoria-telegram-secret";

function credentialsFor(tgUserId: number | string) {
  const id = String(tgUserId);
  const password = "tg_" + createHmac("sha256", SECRET).update(id).digest("hex");
  return { email: `tg${id}@telegram.mentoria`, password };
}

/**
 * Polls a Telegram-login token. While the user hasn't opened the bot yet the
 * row is "pending". Once the bot fills it in ("ready"), we ensure a Supabase
 * auth user exists for that Telegram identity and return its credentials so the
 * browser can sign in. The token is single-use.
 */
export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Telegram login is not configured." }, { status: 503 });
  }

  let token = "";
  try {
    ({ token } = await req.json());
  } catch {
    /* ignore */
  }
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  const { data: row } = await admin
    .from("telegram_logins")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!row) return NextResponse.json({ status: "expired" });
  if (row.status === "pending") return NextResponse.json({ status: "pending" });

  // status === "ready" (or already consumed → re-issue the same credentials).
  const tgId = row.tg_user_id;
  if (!tgId) return NextResponse.json({ status: "pending" });

  const name = String(row.tg_name || row.tg_username || "Telegram User");
  const { email, password } = credentialsFor(tgId);

  // Create the account on first login (idempotent: ignore "already registered").
  const { error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, role: "student", telegram_id: String(tgId) },
  });
  if (createErr && !/already|registered|exists/i.test(createErr.message)) {
    return NextResponse.json({ error: createErr.message }, { status: 500 });
  }

  // Single-use: mark consumed so the token can't be replayed.
  await admin.from("telegram_logins").update({ status: "consumed" }).eq("token", token);

  return NextResponse.json({ status: "ok", email, password, name });
}
