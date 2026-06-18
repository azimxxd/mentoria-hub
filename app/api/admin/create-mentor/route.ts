import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Admin-only endpoint to provision a mentor account. Public signup can only
// create students (see app/signup/page.tsx + lib/store.ts); mentors are made
// here by an admin who then shares the credentials personally.
interface Body {
  accessToken?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: "Server is not configured for mentor creation." },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const accessToken = body.accessToken ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const firstName = body.firstName?.trim() ?? "";
  const lastName = body.lastName?.trim() ?? "";

  if (!accessToken) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }
  if (!email || password.length < 6 || !firstName || !lastName) {
    return NextResponse.json(
      { ok: false, error: "Email, first name, last name and a 6+ character password are required." },
      { status: 400 },
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Verify the caller is an admin (the access token belongs to an admin profile).
  const { data: caller, error: callerErr } = await admin.auth.getUser(accessToken);
  if (callerErr || !caller?.user) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }
  const { data: callerProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", caller.user.id)
    .single();
  if (callerProfile?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const fullName = `${firstName} ${lastName}`.trim();

  // 2. Create the auth user with the mentor role in metadata.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, first_name: firstName, last_name: lastName, role: "mentor" },
  });
  if (createErr || !created?.user) {
    return NextResponse.json(
      { ok: false, error: createErr?.message ?? "Could not create the mentor account." },
      { status: 400 },
    );
  }

  // 3. The handle_new_user trigger inserts the profile row; ensure role/fields are set.
  const { error: profErr } = await admin
    .from("profiles")
    .update({ role: "mentor", full_name: fullName, email })
    .eq("id", created.user.id);
  if (profErr) {
    return NextResponse.json({ ok: false, error: profErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email });
}
