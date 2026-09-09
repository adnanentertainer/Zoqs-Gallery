import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/supabase";

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let browserClient: BrowserClient | undefined;

/**
 * Singleton Supabase client for Client Components. Session state lives in
 * cookies (not localStorage), so it's readable by the server too (Server
 * Components, src/proxy.ts) — required for auth to work without hydration
 * flicker. Uses the public anon key only; RLS enforces access.
 * Throws if Supabase isn't configured; callers should check
 * isSupabaseConfigured() first if a mock-data fallback is acceptable.
 */
export function getSupabaseBrowserClient(): BrowserClient {
  if (!browserClient) {
    const { url, anonKey } = getSupabaseEnv();
    browserClient = createBrowserClient<Database>(url, anonKey);
  }
  return browserClient;
}
