-- ZOQ's Gallery — day-of-week color theme schedule
-- Adds a second site_settings row layered on top of 'color_theme': an
-- optional per-day-of-week theme rotation. Disabled by default and every
-- day starts unassigned (null), so this changes nothing on its own --
-- 'color_theme' keeps being the only thing that matters until an admin
-- turns the schedule on from /admin/theme.
insert into site_settings (key, value, description)
values (
  'color_theme_schedule',
  '{
    "enabled": false,
    "days": {
      "sunday": null,
      "monday": null,
      "tuesday": null,
      "wednesday": null,
      "thursday": null,
      "friday": null,
      "saturday": null
    }
  }'::jsonb,
  'Optional day-of-week color theme rotation (see src/types/colorTheme.ts). Falls back to color_theme on any day with no override.'
)
on conflict (key) do nothing;
