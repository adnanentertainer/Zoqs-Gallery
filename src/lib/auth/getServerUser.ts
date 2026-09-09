import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Authoritative server-side auth check (revalidates the token with Supabase
 * Auth, unlike reading the session cookie directly). Used both to seed
 * AuthProvider's initial state (no hydration flicker) and by protected pages
 * as a defense-in-depth check alongside src/proxy.ts.
 */
export async function getServerUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
