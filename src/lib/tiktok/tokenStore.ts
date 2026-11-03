import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { refreshTikTokToken, TikTokOAuthError } from "@/lib/tiktok/oauth";

type SocialDbClient = SupabaseClient<Database>;

export interface TikTokConnection {
  accessToken: string;
  openId: string;
}

/**
 * Returns a usable TikTok access token for the singleton
 * social_media_settings row, refreshing it first if it's expired (or about
 * to be -- oauth.ts already subtracts a minute of slack when it stores
 * expires_at). Takes the Supabase client as a parameter for the same reason
 * publishProductToSocialMediaCore does: the scheduled-repost cron path runs
 * with the service-role client instead of an admin session.
 *
 * Returns null when TikTok isn't connected at all, or when the refresh
 * token has been rejected and the stored connection was cleared as a
 * result, so callers can treat both the same as "skipped" rather than a
 * refresh failure.
 */
export async function getValidTikTokAccessToken(
  supabase: SocialDbClient,
): Promise<TikTokConnection | null> {
  const { data } = await supabase
    .from("social_media_settings")
    .select(
      "id, tiktok_access_token, tiktok_refresh_token, tiktok_token_expires_at, tiktok_open_id",
    )
    .limit(1)
    .maybeSingle();

  if (!data?.tiktok_access_token || !data.tiktok_refresh_token || !data.tiktok_open_id) {
    return null;
  }

  const stillValid =
    data.tiktok_token_expires_at &&
    new Date(data.tiktok_token_expires_at).getTime() > Date.now();

  if (stillValid) {
    return { accessToken: data.tiktok_access_token, openId: data.tiktok_open_id };
  }

  let refreshed;
  try {
    refreshed = await refreshTikTokToken(data.tiktok_refresh_token);
  } catch (error) {
    // A 400 here means TikTok rejected the refresh token itself (expired,
    // revoked, or already rotated away by an earlier refresh) -- no retry
    // will fix that, so clear the stored connection rather than leaving a
    // dead token set that the settings page would keep showing as
    // "Connected" forever. Any other error (5xx, network) is treated as
    // transient and left alone so a temporary TikTok outage doesn't wipe a
    // still-valid connection.
    if (error instanceof TikTokOAuthError && error.status === 400) {
      await supabase
        .from("social_media_settings")
        .update({
          tiktok_open_id: null,
          tiktok_display_name: null,
          tiktok_access_token: null,
          tiktok_refresh_token: null,
          tiktok_token_expires_at: null,
          tiktok_connected_at: null,
        })
        .eq("id", data.id);
      return null;
    }
    throw error;
  }

  await supabase
    .from("social_media_settings")
    .update({
      tiktok_access_token: refreshed.accessToken,
      tiktok_refresh_token: refreshed.refreshToken,
      tiktok_token_expires_at: refreshed.expiresAt,
      tiktok_open_id: refreshed.openId,
    })
    .eq("id", data.id);

  return { accessToken: refreshed.accessToken, openId: refreshed.openId };
}
