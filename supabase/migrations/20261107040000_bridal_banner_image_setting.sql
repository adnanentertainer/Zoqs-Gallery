-- ZOQ's Gallery — admin-editable bridal collection banner image
--
-- A site_settings row an admin can set from /admin/settings to change the
-- bridal collection banner photo (used by the Bridal Collection Banner's
-- Classic Split, Editorial Full-Bleed and Side Accent layout variants --
-- see src/types/layoutTemplate.ts). Stored as a JSON string (never SQL/JSON
-- null — site_settings.value is NOT NULL) where an empty string means "no
-- override, keep the built-in placeholder photo".

insert into site_settings (key, value, description)
values (
  'bridal_banner_image',
  '""'::jsonb,
  'Bridal collection banner photo. Empty string keeps the built-in placeholder photo.'
)
on conflict (key) do nothing;
