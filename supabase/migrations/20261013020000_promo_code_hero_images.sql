-- ZOQ's Gallery — admin-uploadable hero banner image per promo code
--
-- Lets an admin upload a festive banner photo for a scheduled promo code
-- (e.g. an Eid-themed banner for EIDFITR27) that replaces the homepage
-- hero's static model photo for as long as that code is actually live —
-- the same starts_at/expires_at window create_order()/validate_promo_code()
-- already enforce, so the banner can never show for an inactive/expired
-- code.
--
-- Storage is used here for the first time in this codebase (every other
-- image today is a pasted public URL — see next.config.ts's remotePatterns
-- comment anticipating this). The bucket is public so the uploaded photo
-- serves directly via its public URL (no signed-URL/RLS check on reads);
-- RLS on storage.objects only needs to gate writes.

insert into storage.buckets (id, name, public)
values ('promo-hero-images', 'promo-hero-images', true)
on conflict (id) do nothing;

create policy "Public read promo hero images"
on storage.objects for select
using (bucket_id = 'promo-hero-images');

create policy "Admins can upload promo hero images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'promo-hero-images' and is_admin());

create policy "Admins can update promo hero images"
on storage.objects for update
to authenticated
using (bucket_id = 'promo-hero-images' and is_admin())
with check (bucket_id = 'promo-hero-images' and is_admin());

create policy "Admins can delete promo hero images"
on storage.objects for delete
to authenticated
using (bucket_id = 'promo-hero-images' and is_admin());

alter table promo_codes add column hero_image_url text;
