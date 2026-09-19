-- ZOQ's Gallery — Social Media Auto-Posting
-- Lets the store automatically publish a Facebook Page post and an
-- Instagram post whenever a product becomes active. Reuses set_updated_at()
-- (Phase 7) and is_admin() (Phase 10) rather than duplicating either.

-- ============================================================================
-- social_media_settings — singleton config row (one Page, one IG account)
-- ============================================================================
-- Meta only issues one access token per Page; that same Page token also
-- authorizes Graph API calls against the Page's linked Instagram Business
-- Account, so there is deliberately no separate instagram_access_token
-- column here. This table holds a live secret, so unlike most admin tables
-- it has NO public select policy at all -- only is_admin() can read it.
create table social_media_settings (
  id uuid primary key default gen_random_uuid(),
  facebook_page_id text,
  facebook_access_token text,
  facebook_enabled boolean not null default false,
  instagram_business_account_id text,
  instagram_enabled boolean not null default false,
  auto_post_enabled boolean not null default false,
  facebook_connected_at timestamptz,
  instagram_connected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enforces "only ever one row" at the database level rather than trusting
-- application code to never insert a second one.
create unique index idx_social_media_settings_singleton
  on social_media_settings((true));

create trigger trg_social_media_settings_updated_at
before update on social_media_settings
for each row execute function set_updated_at();

alter table social_media_settings enable row level security;

create policy "Admins can read social media settings"
  on social_media_settings for select to authenticated using (is_admin());
create policy "Admins can insert social media settings"
  on social_media_settings for insert to authenticated with check (is_admin());
create policy "Admins can update social media settings"
  on social_media_settings for update to authenticated using (is_admin()) with check (is_admin());

-- ============================================================================
-- product_social_posts — one row per product, tracks the auto-post outcome
-- ============================================================================
-- unique(product_id) is what makes "never auto-post the same product twice"
-- a database guarantee rather than just application logic -- the posting
-- service looks up this row before posting and skips if one already exists,
-- unless the admin explicitly retries ("Post Again").
--
-- retry_count is a single shared counter, not split per platform: the
-- "Post Again" action retries the whole row, and per-platform status/error
-- already gives full failure visibility on their own.
create table product_social_posts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  facebook_post_id text,
  instagram_media_id text,
  facebook_status text not null default 'pending'
    check (facebook_status in ('pending', 'success', 'failed', 'skipped')),
  instagram_status text not null default 'pending'
    check (instagram_status in ('pending', 'success', 'failed', 'skipped')),
  facebook_error text,
  instagram_error text,
  posted_at timestamptz,
  retry_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id)
);

create index idx_product_social_posts_product_id on product_social_posts(product_id);

create trigger trg_product_social_posts_updated_at
before update on product_social_posts
for each row execute function set_updated_at();

alter table product_social_posts enable row level security;

create policy "Admins can read product social posts"
  on product_social_posts for select to authenticated using (is_admin());
create policy "Admins can insert product social posts"
  on product_social_posts for insert to authenticated with check (is_admin());
create policy "Admins can update product social posts"
  on product_social_posts for update to authenticated using (is_admin()) with check (is_admin());
