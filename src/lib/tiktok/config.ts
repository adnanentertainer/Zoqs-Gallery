/**
 * TikTok issues a separate client key/secret per environment (Production vs
 * Sandbox) on the same app -- TIKTOK_ENV picks which pair the OAuth routes
 * and token refresh use. Both environments share the same API host; only
 * the review status of the app and (for Sandbox) the Target Users allowlist
 * differ. Keep this at "sandbox" until the app passes TikTok's review.
 */
function getTikTokEnv(): "sandbox" | "production" {
  return process.env.TIKTOK_ENV === "production" ? "production" : "sandbox";
}

export interface TikTokAppCredentials {
  env: "sandbox" | "production";
  clientKey: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * TikTok's Content Sharing Guidelines restrict every unaudited app to
 * SELF_ONLY-visibility posts, enforced server-side regardless of what the
 * connected account's own privacy settings would otherwise allow (see
 * contentPostingPublisher.ts's pickPrivacyLevel) -- requesting anything
 * else (e.g. PUBLIC_TO_EVERYONE) fails with
 * unaudited_client_can_only_post_to_private_accounts even if the account
 * is private. Flip this to true only once TikTok has actually approved
 * the Production app for review.
 */
export function isTikTokAppAudited(): boolean {
  return process.env.TIKTOK_APP_AUDITED === "true";
}

export function getTikTokAppCredentials(): TikTokAppCredentials {
  const env = getTikTokEnv();
  const clientKey =
    env === "production"
      ? process.env.TIKTOK_PRODUCTION_CLIENT_KEY
      : process.env.TIKTOK_SANDBOX_CLIENT_KEY;
  const clientSecret =
    env === "production"
      ? process.env.TIKTOK_PRODUCTION_CLIENT_SECRET
      : process.env.TIKTOK_SANDBOX_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !clientSecret || !redirectUri) {
    throw new Error(
      `TikTok ${env} credentials are not configured (TIKTOK_${env.toUpperCase()}_CLIENT_KEY/SECRET, TIKTOK_REDIRECT_URI).`,
    );
  }

  return { env, clientKey, clientSecret, redirectUri };
}
