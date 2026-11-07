-- Homepage hero carousel images, admin-managed from /admin/hero-images.
-- Mirrors social_posts' shape/RLS pattern: public reads only active rows,
-- admins can read/write everything via is_admin() (see admin_roles.sql).
-- Rendered by the photo-bearing Hero layout variants (see HeroSection.tsx)
-- as an auto-advancing crossfade when 2+ active images exist; falls back to
-- the existing single default_hero_image setting when this table is empty.

create table hero_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_hero_images_updated_at
before update on hero_images
for each row execute function set_updated_at();

alter table hero_images enable row level security;

create policy "Public can read active hero images"
  on hero_images for select
  using (is_active = true);

create policy "Admins can read all hero images"
  on hero_images for select to authenticated using (is_admin());
create policy "Admins can insert hero images"
  on hero_images for insert to authenticated with check (is_admin());
create policy "Admins can update hero images"
  on hero_images for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admins can delete hero images"
  on hero_images for delete to authenticated using (is_admin());
