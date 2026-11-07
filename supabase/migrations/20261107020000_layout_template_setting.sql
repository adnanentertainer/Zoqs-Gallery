-- ZOQ's Gallery — admin-selectable homepage layout variants
-- Adds a single site_settings row admins can edit from /admin/layout-template
-- to switch the storefront's Hero and Shop By Category section layouts
-- without a code change. The value only stores which variant id is active
-- per section -- the actual markup for each variant lives in
-- src/components/home/HeroSection.tsx / CategorySection.tsx, not the
-- database, so a bad/old id here always falls back safely to the default
-- (see src/types/layoutTemplate.ts).
insert into site_settings (key, value, description)
values (
  'layout_template',
  '{"hero":"classic","categories":"grid"}'::jsonb,
  'Active homepage section layout variants (see src/types/layoutTemplate.ts for the available options).'
)
on conflict (key) do nothing;
