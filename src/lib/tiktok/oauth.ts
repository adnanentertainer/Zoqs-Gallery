import { getTikTokAppCredentials } from "@/lib/tiktok/config";

const AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";

// video.upload (draft-to-inbox) is a byproduct of adding the Content
// Posting API product in the portal and can't be individually removed
// there, so it's requested alongside video.publish even though the
// auto-poster only ever uses Direct Post.
const SCOPES = ["user.info.basic", "video.publish", "video.upload"];

export class TikTokOAuthError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
  ) {
    super(`TikTok OAuth request failed (${status}): ${body}`);
    this.name = "TikTokOAuthError";
  }
}

export function buildTikTokAuthorizeUrl(state: string): string {
  const { clientKey, redirectUri } = getTikTokAppCredentials();
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: SCOPES.join(","),
    redirect_uri: redirectUri,
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

interface TikTokTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  open_id: string;
  scope: string;
  token_type: string;
}

async function postToken(
  body: Record<string, string>,
): Promise<TikTokTokenResponse> {
  const { clientKey, clientSecret } = getTikTokAppCredentials();
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      ...body,
    }),
  });

  const text = await response.text();
  const parsed = JSON.parse(text) as Partial<TikTokTokenResponse> & {
    error?: string;
  };
  // TikTok's token endpoint can return HTTP 200 with an OAuth error body
  // instead of a non-2xx status -- e.g. refreshing a token that was issued
  // by a different client_key/secret pair than the one now configured
  // (Sandbox vs Production), which TikTok rejects as an invalid grant.
  // Normalize that case to the same 400 status a "real" rejection would
  // carry, so callers (see tokenStore.ts) can tell a genuine rejection from
  // a transient 5xx/network failure without depending on response.ok alone.
  if (!response.ok || parsed.error || !parsed.access_token) {
    throw new TikTokOAuthError(response.ok ? 400 : response.status, text);
  }
  return parsed as TikTokTokenResponse;
}

export interface TikTokTokenSet {
  accessToken: string;
  refreshToken: string;
  openId: string;
  /** ISO timestamp -- 1 minute of slack subtracted so a near-expiry token
   * doesn't get used for a request that then takes a moment to land. */
  expiresAt: string;
}

function toTokenSet(response: TikTokTokenResponse): TikTokTokenSet {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    openId: response.open_id,
    expiresAt: new Date(
      Date.now() + (response.expires_in - 60) * 1000,
    ).toISOString(),
  };
}

export async function exchangeTikTokCodeForToken(
  code: string,
): Promise<TikTokTokenSet> {
  const { redirectUri } = getTikTokAppCredentials();
  const response = await postToken({
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });
  return toTokenSet(response);
}

export async function refreshTikTokToken(
  refreshToken: string,
): Promise<TikTokTokenSet> {
  const response = await postToken({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  return toTokenSet(response);
}

export async function fetchTikTokDisplayName(
  accessToken: string,
): Promise<string | null> {
  const response = await fetch(`${USER_INFO_URL}?fields=display_name`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  const body = (await response.json()) as {
    data?: { user?: { display_name?: string } };
  };
  return body.data?.user?.display_name ?? null;
}
