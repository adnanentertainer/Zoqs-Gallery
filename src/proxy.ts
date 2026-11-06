import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, getSupabaseEnv } from "@/lib/supabase/env";
import { getProductBySlug } from "@/lib/services/productService";
import { getCategoryBySlug } from "@/lib/services/categoryService";

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
 * Only calls Supabase Auth (a network round trip) when the request actually
 * carries a session cookie — see the `hasAuthCookie` check below. The large
 * majority of storefront requests are anonymous visitors with no session to
 * refresh, so this skips that round trip for them entirely.
 *
 * Named `proxy` (not `middleware`) per this Next.js version — see
 * node_modules/next/dist/docs/.../proxy.md: the `middleware.ts` convention
 * was renamed in Next.js 16.
 */
export async function proxy(request: NextRequest) {
  const catalogNotFound = await checkCatalogResourceExists(request);
  if (catalogNotFound) return catalogNotFound;

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

  // @supabase/ssr always names its session cookie "sb-<project-ref>-auth-
  // token" (optionally chunked as "...-auth-token.0", "...-auth-token.1",
  // etc for large tokens). A visitor who has never signed in on this browser
  // has none of these cookies, which means there's no session to refresh and
  // (for protected routes) no need to ask Supabase Auth before redirecting —
  // both known for free without the network round trip getUser() costs.
  // This is most storefront traffic, so skipping it here matters broadly.
  const projectRef = new URL(url).hostname.split(".")[0];
  const authCookiePrefix = `sb-${projectRef}-auth-token`;
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith(authCookiePrefix));

  if (!hasAuthCookie) {
    if (isProtected) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

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

/**
 * /product/[slug] and /category/[slug] both have a loading.tsx, so Next.js
 * wraps them in an implicit Suspense boundary -- the fallback starts
 * streaming (as HTTP 200) the moment the page component suspends on its
 * first `await`, before the component's own `notFound()` check can run.
 * That locks the status in at 200 even though the page correctly renders
 * "not found" content (Next adds a noindex meta tag, but the status can
 * never change once streaming starts -- see node_modules/next/dist/docs/
 * 01-app/03-api-reference/03-file-conventions/loading.md's "Status Codes"
 * section, which names this exact proxy check as the fix). Checking
 * existence here, before the page renders at all, is the only way to still
 * return a real 404 for a bad product/category slug while keeping those
 * pages' loading skeletons for everyone else.
 */
async function checkCatalogResourceExists(
  request: NextRequest,
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  const productSlug = pathname.match(/^\/product\/([^/]+)$/)?.[1];
  if (productSlug) {
    const product = await getProductBySlug(decodeURIComponent(productSlug));
    if (!product) {
      return NextResponse.rewrite(
        new URL("/not-found-passthrough", request.url),
      );
    }
    return null;
  }

  const categorySlug = pathname.match(/^\/category\/([^/]+)$/)?.[1];
  if (categorySlug) {
    const category = await getCategoryBySlug(decodeURIComponent(categorySlug));
    if (!category) {
      return NextResponse.rewrite(
        new URL("/not-found-passthrough", request.url),
      );
    }
  }

  return null;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
