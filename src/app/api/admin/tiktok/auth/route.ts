import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { buildTikTokAuthorizeUrl } from "@/lib/tiktok/oauth";

const STATE_COOKIE = "tiktok_oauth_state";

/**
 * Starts the TikTok Login Kit flow from the Social Auto-Post settings page's
 * "Connect TikTok" button. The state value is round-tripped through TikTok
 * and checked against this same short-lived cookie in the callback route,
 * the standard OAuth CSRF guard -- without it, a crafted callback URL could
 * link an attacker's TikTok account to this store's auto-poster.
 */
export async function GET() {
  await requireAdmin("/admin/social-media");

  const state = randomUUID();
  const response = NextResponse.redirect(buildTikTokAuthorizeUrl(state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/api/admin/tiktok",
  });
  return response;
}
