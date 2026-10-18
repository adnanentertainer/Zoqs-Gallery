-- ZOQ's Gallery — TikTok auto-posting
--
-- Unlike Facebook/Instagram, TikTok's Content Posting API uses OAuth 2.0
-- access tokens that expire in 24h (refresh tokens last 365 days), not a
-- long-lived token an admin pastes in once. social_media_settings grows a
-- TikTok column group to hold that token pair plus the connected account's
-- open_id, refreshed lazily by the publisher right before each post attempt
-- rather than on a schedule.
--
-- TikTok also has no photo-post scope available to this app (video.publish
-- only) -- each product photo is rendered into a short video at post time
-- (see src/lib/tiktok/videoGenerator.ts), so product_social_posts tracks a
-- TikTok outcome the same way it already tracks the Instagram Story one.

alter table social_media_settings
  add column tiktok_enabled boolean not null default false,
  add column tiktok_open_id text,
  add column tiktok_display_name text,
  add column tiktok_access_token text,
  add column tiktok_refresh_token text,
  add column tiktok_token_expires_at timestamptz,
  add column tiktok_connected_at timestamptz;

alter table product_social_posts
  add column tiktok_video_id text,
  add column tiktok_status text not null default 'pending'
    check (tiktok_status in ('pending', 'success', 'failed', 'skipped')),
  add column tiktok_error text;
