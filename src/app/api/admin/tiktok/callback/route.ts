import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  exchangeTikTokCodeForToken,
  fetchTikTokDisplayName,
  TikTokOAuthError,
} from "@/lib/tiktok/oauth";
import { connectTikTokAccount } from "@/lib/services/admin/socialPostingService";

const STATE_COOKIE = "tiktok_oauth_state";
const SETTINGS_PATH = "/admin/social-media";

/**
 * Landing point for the Login Kit redirect started by
 * src/app/api/admin/tiktok/auth/route.ts. TikTok sends either `code`+`state`
 * on success or `error`+`error_description` if the admin declined the
 * TikTok consent screen -- both are handled here rather than letting either
 * one surface as an unhandled exception.
 */
export async function GET(request: Request) {
  await requireAdmin(SETTINGS_PATH);

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const expectedState = (await cookies()).get(STATE_COOKIE)?.value;

  function redirectWithStatus(status: "connected" | "error"): NextResponse {
    const response = NextResponse.redirect(
      `${origin}${SETTINGS_PATH}?tiktok=${status}`,
    );
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  if (oauthError || !code || !state || state !== expectedState) {
    if (oauthError) {
      console.error("[tiktok/callback] TikTok returned an OAuth error:", oauthError);
    } else if (state !== expectedState) {
      console.error("[tiktok/callback] state mismatch -- possible CSRF or expired cookie.");
    }
    return redirectWithStatus("error");
  }

  try {
    const tokens = await exchangeTikTokCodeForToken(code);
    const displayName = await fetchTikTokDisplayName(tokens.accessToken);
    await connectTikTokAccount(tokens, displayName);
  } catch (error) {
    const detail =
      error instanceof TikTokOAuthError ? error.message : String(error);
    console.error("[tiktok/callback] failed to complete connection:", detail);
    return redirectWithStatus("error");
  }

  return redirectWithStatus("connected");
}
