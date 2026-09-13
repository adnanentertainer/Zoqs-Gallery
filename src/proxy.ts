import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, getSupabaseEnv } from "@/lib/supabase/env";

// /checkout and /order-confirmation are deliberately NOT here — guest
// checkout is allowed (see /checkout/start), and a guest's own order
// confirmation is reached via its unguessable guest_token in the URL
// instead of a login requirement (see get_guest_order() in the database).
const PROTECTED_PREFIXES = ["/account"];

/**
 * Runs on every non-static request (see `config.matcher` below). Refreshes
 * the Supabase auth cookie so session state stays in sync between the
 * browser and server, and redirects unauthenticated visitors away from
 * protected routes before any page code runs — this is the one place that
 * actually enforces `/account` protection; the pages themselves also check
 * (defense in depth) but must not be the only gate.
 *
 * Named `proxy` (not `middleware`) per this Next.js version — see
 * node_modules/next/dist/docs/.../proxy.md: the `middleware.ts` convention
 * was renamed in Next.js 16.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) =>
      request.nextUrl.pathname === prefix ||
      request.nextUrl.pathname.startsWith(`${prefix}/`),
  );

  // Without Supabase configured there is no auth to enforce — let mock-data
  // mode through untouched rather than locking everyone out of /account.
  if (!isSupabaseConfigured()) {
    return response;
  }

  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request: { headers: request.headers } });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() (not getSession()) revalidates the token against Supabase Auth
  // on every call, so a revoked/expired session is caught here reliably.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
