import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/supabase";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Reads/writes the same auth cookies the browser client and src/proxy.ts use,
 * so a signed-in user's session is visible here too (needed for RLS policies
 * that check auth.uid(), e.g. the profiles table).
 *
 * Async because Next.js's cookies() is async. A new client is created per
 * call, matching Next.js's per-request model. Uses the public anon key
 * only — never the service_role key, which is reserved for scripts/seed.ts.
 *
 * Setting cookies from a Server Component render is a no-op by design (Next.js
 * doesn't allow it there); src/proxy.ts refreshes the session cookie on every
 * request, so this only matters for Route Handlers/Server Actions, which can
 * set cookies and where this same function works unchanged.
 *
 * generateStaticParams runs at build time with no request context, so
 * Next.js's cookies() throws there. Product/category/review/settings queries
 * never need a signed-in session (their RLS policies allow public reads), so
 * falling back to a cookie-less client in that case is safe.
 */
export async function getSupabaseServerClient() {
  const { url, anonKey } = getSupabaseEnv();

  let cookieStore: Awaited<ReturnType<typeof cookies>>;
  try {
    cookieStore = await cookies();
  } catch {
    return createClient<Database>(url, anonKey);
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called during a Server Component render, where cookies can't be
          // set. Harmless: src/proxy.ts already refreshes the session cookie
          // on every request.
        }
      },
    },
  });
}
