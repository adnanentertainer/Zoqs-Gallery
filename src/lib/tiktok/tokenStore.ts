import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { refreshTikTokToken } from "@/lib/tiktok/oauth";

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
 * Returns null when TikTok isn't connected at all, so callers can treat
 * that the same as "skipped" rather than a refresh failure.
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

  const refreshed = await refreshTikTokToken(data.tiktok_refresh_token);

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
