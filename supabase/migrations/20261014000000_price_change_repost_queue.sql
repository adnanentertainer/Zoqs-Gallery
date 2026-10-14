-- ZOQ's Gallery — Price-Change Social Repost Queue
--
-- Today, a product only ever auto-posts to Facebook/Instagram once, the
-- first time it becomes active (see 20260919000000_social_media_auto_posting.sql).
-- A later price change intentionally does NOT trigger anything — that
-- behavior is left exactly as-is.
--
-- This adds a separate, additive path: when an admin changes an active
-- product's price, it is queued here instead. A scheduled worker (an
-- external cron hitting /api/cron/social-repost, since Vercel's free Hobby
-- plan cron only fires once a day) picks ONE random pending row per run and
-- publishes it via the same Graph API publishers, capped at a handful of
-- runs a day -- so price-drop posts go out gradually instead of all at
-- once, without ever touching the existing immediate-post flow.
create table product_social_repost_queue (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  reason text not null default 'price_change'
    check (reason in ('price_change')),
  status text not null default 'pending'
    check (status in ('pending', 'posted', 'skipped')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

-- A product with an already-pending repost doesn't need a second entry if
-- its price changes again before the first one is processed -- the insert
-- just no-ops (ON CONFLICT DO NOTHING) rather than piling up duplicates.
create unique index idx_product_social_repost_queue_one_pending_per_product
  on product_social_repost_queue(product_id) where status = 'pending';

create index idx_product_social_repost_queue_pending_created
  on product_social_repost_queue(created_at) where status = 'pending';

-- Lets the worker cheaply count how many it has already posted "today"
-- without scanning the whole table.
create index idx_product_social_repost_queue_processed_at
  on product_social_repost_queue(processed_at) where status = 'posted';

alter table product_social_repost_queue enable row level security;

-- Same shape as product_social_posts/social_media_settings: admin-only.
-- The scheduled worker itself runs with the service_role key (no admin
-- session exists for a cron request to authenticate), which bypasses RLS
-- entirely rather than needing a policy of its own here.
create policy "Admins can read repost queue"
  on product_social_repost_queue for select to authenticated using (is_admin());
create policy "Admins can insert repost queue"
  on product_social_repost_queue for insert to authenticated with check (is_admin());
create policy "Admins can update repost queue"
  on product_social_repost_queue for update to authenticated using (is_admin()) with check (is_admin());
