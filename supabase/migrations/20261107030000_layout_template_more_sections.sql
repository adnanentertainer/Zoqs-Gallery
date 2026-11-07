-- ZOQ's Gallery — extends the admin-selectable homepage layout setting to
-- cover more sections (products, bridal, benefits, reviews, social gallery)
-- beyond the original hero/categories pair. Merges the new section keys
-- into the existing layout_template row's jsonb value rather than
-- overwriting it, so an admin's already-saved hero/category choice is
-- preserved. See src/types/layoutTemplate.ts for the available options.
update site_settings
set value = value || '{"products":"grid","bridal":"classic","benefits":"inline","reviews":"grid","socialGallery":"grid"}'::jsonb
where key = 'layout_template';
