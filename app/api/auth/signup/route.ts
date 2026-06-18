import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Public student signup. We create the auth user server-side with the service
// role and email_confirm: true, so the account is usable immediately WITHOUT
// turning off email confirmation in Supabase. That keeps "Log in with Telegram"
// (which also relies on admin.createUser + email_confirm) working unchanged.
interface Body {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
}

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Signup is not configured." }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const firstName = body.firstName?.trim() ?? "";
  const lastName = body.lastName?.trim() ?? "";
  const nickname = body.nickname?.trim() ?? "";

  if (!email || password.length < 6 || !firstName || !lastName) {
    return NextResponse.json(
      { ok: false, error: "Email, first name, last name and a 6+ character password are required." },
      { status: 400 },
    );
  }

  const displayName = nickname || `${firstName} ${lastName}`.trim();

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: displayName,
      first_name: firstName,
      last_name: lastName,
      nickname,
      role: "student",
    },
  });

  if (error) {
    // Surface a friendly message for the common "already exists" case.
    if (/already|registered|exists/i.test(error.message)) {
      return NextResponse.json(
        { ok: false, error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
