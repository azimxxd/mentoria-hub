import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when the service-role key is present, so server routes can use the admin client. */
export const isAdminConfigured = Boolean(url && serviceKey);

let admin: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the service-role key. Bypasses RLS — never
 * import this from client components. Used by the Telegram-login routes.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isAdminConfigured) return null;
  if (!admin) {
    admin = createClient(url!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}
