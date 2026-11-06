-- ZOQ's Gallery — admin-selectable site color theme
-- Adds a single site_settings row admins can edit from /admin/theme to
-- switch the storefront's color palette (ink/background/accent/surface
-- tint/muted text) without a code change. The value is just the chosen
-- theme's id (a plain jsonb string) -- the actual token hex values live in
-- src/types/colorTheme.ts, not the database, so a bad/old id here always
-- falls back safely to "default" (see getColorThemeById()).
insert into site_settings (key, value, description)
values (
  'color_theme',
  '"default"'::jsonb,
  'Active storefront color theme id (see src/types/colorTheme.ts for the available palettes).'
)
on conflict (key) do nothing;
