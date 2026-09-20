import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/supabase";

/**
 * Bypasses RLS entirely using the service_role key. Reserved for trusted
 * server-to-server contexts that have no user session to check against RLS
 * policies -- e.g. the inbound WhatsApp webhook, where Meta's servers (not a
 * signed-in admin) are the caller, so is_admin() has nothing to authenticate
 * against. requireAdmin()-gated code must keep using getSupabaseServerClient()
 * instead, so RLS still enforces the admin check there.
 */
export function getSupabaseServiceRoleClient() {
  const { url } = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
