-- ZOQ's Gallery — festival countdown banner
-- Adds a single site_settings row admins can edit from /admin/settings to
-- show a site-wide "Eid Sale starts in ..." style countdown banner. Reuses
-- the existing site_settings key/value architecture (Phase 7) rather than a
-- new table, since only one banner is ever shown at a time.
insert into site_settings (key, value, description)
values (
  'festival_banner',
  '{
    "name": "",
    "message": "Sale starts in",
    "targetAt": null,
    "ctaLabel": "",
    "ctaHref": "",
    "isActive": false
  }'::jsonb,
  'Site-wide festival countdown banner (e.g. Eid, Basant sale) shown above the header when active.'
)
on conflict (key) do nothing;
