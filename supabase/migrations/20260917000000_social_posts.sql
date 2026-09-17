-- "Follow Our Style" gallery posts, admin-managed from /admin/social-posts.
-- Mirrors the categories table's shape/RLS pattern: public reads only active
-- rows, admins can read/write everything via is_admin() (see admin_roles.sql).

create table social_posts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt text not null,
  -- Falls back to the site's Instagram profile (siteConfig.socialLinks) when
  -- null, but an admin can point an individual post at a specific Instagram
  -- or Facebook post/page instead.
  href text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_social_posts_updated_at
before update on social_posts
for each row execute function set_updated_at();

alter table social_posts enable row level security;

create policy "Public can read active social posts"
  on social_posts for select
  using (is_active = true);

create policy "Admins can read all social posts"
  on social_posts for select to authenticated using (is_admin());
create policy "Admins can insert social posts"
  on social_posts for insert to authenticated with check (is_admin());
create policy "Admins can update social posts"
  on social_posts for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admins can delete social posts"
  on social_posts for delete to authenticated using (is_admin());
