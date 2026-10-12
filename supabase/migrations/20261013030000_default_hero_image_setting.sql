-- ZOQ's Gallery — admin-editable default homepage hero image
--
-- A site_settings row an admin can set from /admin/settings to change the
-- homepage hero photo outside of any scheduled promo code (see
-- 20261013020000_promo_code_hero_images.sql for the per-event version).
-- Stored as a JSON string (never SQL/JSON null — site_settings.value is
-- NOT NULL) where an empty string means "no override, keep the built-in
-- default photo".

insert into site_settings (key, value, description)
values (
  'default_hero_image',
  '""'::jsonb,
  'Homepage hero photo shown whenever no scheduled promo code currently has its own hero banner live. Empty string keeps the built-in default photo.'
)
on conflict (key) do nothing;
