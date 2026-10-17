-- ZOQ's Gallery — Instagram Stories auto-post + WhatsApp Status helper
--
-- Two additive features, bundled in one migration since neither touches the
-- other's tables:
--
-- 1. Instagram Stories: product_social_posts (see
--    20260919000000_social_media_auto_posting.sql) gets three new columns
--    so a Story publish attempt is tracked alongside the existing Facebook
--    Page post and Instagram feed post, on the same row, using the same
--    unique(product_id) row per product. Posted via the same Instagram
--    Graph API access token already configured for feed posts — no new
--    settings toggle, since Meta's Content Publishing API doesn't charge
--    per call and there's no reason to post the feed version without the
--    Story version.
--
-- 2. WhatsApp Status helper: there is no official API for posting to
--    WhatsApp Status (unlike Facebook/Instagram), so this never posts
--    anything itself. It only queues "this product needs a Status post"
--    for the admin to action manually (see /admin/whatsapp-status) — same
--    queue shape as product_social_repost_queue, with its own table since
--    the two reasons (new product vs. price change) can both legitimately
--    be pending for the same product at once, and resolution here means
--    "admin marked it posted/dismissed", not "a cron job published it".

alter table product_social_posts
  add column instagram_story_media_id text,
  add column instagram_story_status text not null default 'pending'
    check (instagram_story_status in ('pending', 'success', 'failed', 'skipped')),
  add column instagram_story_error text;

create table product_whatsapp_status_queue (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  reason text not null check (reason in ('new_product', 'price_change')),
  -- Only set for reason = 'price_change', so the admin panel can render
  -- "was Rs. X, now Rs. Y" — the product's current price is read fresh at
  -- render time (not snapshotted here), so this is the one value that
  -- would otherwise be lost once a later price change overwrites it.
  previous_price integer,
  status text not null default 'pending'
    check (status in ('pending', 'posted', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- Mirrors product_social_repost_queue's reasoning: a product with an
-- already-pending item for a given reason doesn't need a second one if,
-- say, its price changes twice before the admin gets to posting a Status
-- for the first change — the insert just no-ops rather than piling up.
-- new_product and price_change are allowed to coexist (a brand-new
-- product's own launch item plus, separately, a later price-change item).
create unique index idx_product_whatsapp_status_queue_one_pending_per_reason
  on product_whatsapp_status_queue(product_id, reason) where status = 'pending';

create index idx_product_whatsapp_status_queue_pending_created
  on product_whatsapp_status_queue(created_at) where status = 'pending';

alter table product_whatsapp_status_queue enable row level security;

-- Same shape as product_social_repost_queue: admin-only, no public access
-- (this is an internal to-do list, not customer-facing content).
create policy "Admins can read whatsapp status queue"
  on product_whatsapp_status_queue for select to authenticated using (is_admin());
create policy "Admins can insert whatsapp status queue"
  on product_whatsapp_status_queue for insert to authenticated with check (is_admin());
create policy "Admins can update whatsapp status queue"
  on product_whatsapp_status_queue for update to authenticated using (is_admin()) with check (is_admin());
