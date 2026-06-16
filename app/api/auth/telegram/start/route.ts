import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT || "MentoriaHub_bot";

/**
 * Starts a "Log in with Telegram" flow: creates a one-time pending token and
 * returns the bot deep link. The user opens it, presses Start, and the bot
 * (service role) marks the token "ready" with their Telegram identity.
 */
export async function POST() {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Telegram login is not configured." }, { status: 503 });
  }

  const token = randomUUID();
  const { error } = await admin.from("telegram_logins").insert({ token, status: "pending" });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    token,
    url: `https://t.me/${BOT}?start=login_${token}`,
  });
}
