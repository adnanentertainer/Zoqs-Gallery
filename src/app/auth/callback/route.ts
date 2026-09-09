import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/auth/redirect";

/**
 * Exchanges a Supabase PKCE `code` for a session — the shared landing point
 * for both email confirmation (signup) and password recovery links, since
 * both use the same code-exchange mechanism. `next` decides where to land on
 * success (see emailRedirectTo/redirectTo call sites); on failure (expired or
 * already-used link) we send the user to /login with an explanatory flag
 * rather than exposing the raw Supabase error.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirect(searchParams.get("next"), "/account");

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] exchangeCodeForSession failed:", error);
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_link`);
}
