-- ZOQ's Gallery — Product Reels
-- Lets an admin upload a finished Reel video (made elsewhere, e.g. CapCut,
-- with real trending audio -- Meta's API has no way to attach licensed
-- music, so this app never generates the video itself) and publish it as a
-- Facebook Page Reel and an Instagram Reel, tagged to a product via the
-- same Meta catalog used by the existing photo auto-poster. Reuses
-- set_updated_at() (Phase 7) and is_admin() (Phase 10).
--
-- Deliberately its own table rather than reusing product_social_posts:
-- that table enforces unique(product_id) because a product gets auto-posted
-- at most once, but a product can reasonably get several different reels
-- over time, each uploaded and published as its own action.

create table product_reels (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  video_url text not null,
  caption text not null,
  facebook_video_id text,
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
  updated_at timestamptz not null default now()
);

create index idx_product_reels_product_id on product_reels(product_id);

create trigger trg_product_reels_updated_at
before update on product_reels
for each row execute function set_updated_at();

alter table product_reels enable row level security;

create policy "Admins can read product reels"
  on product_reels for select to authenticated using (is_admin());
create policy "Admins can insert product reels"
  on product_reels for insert to authenticated with check (is_admin());
create policy "Admins can update product reels"
  on product_reels for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admins can delete product reels"
  on product_reels for delete to authenticated using (is_admin());
