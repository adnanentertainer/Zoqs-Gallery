-- ZOQ's Gallery — Wedding Season collection
--
-- Adds an explicit, admin-controlled "Wedding Pick" selection on products
-- (never inferred from category/occasion) plus a display-order column so the
-- admin can control the sequence of the homepage "Wedding Season Favourites"
-- section and the /wedding-collection page, managed from the existing
-- Products admin (see ProductForm) the same way is_featured/is_new/
-- is_best_seller already are.
alter table products add column is_wedding_pick boolean not null default false;
alter table products add column wedding_display_order integer not null default 0;

create index idx_products_is_wedding_pick on products(is_wedding_pick);

-- Reuses the existing site_settings key/value architecture (same pattern as
-- festival_banner / blessed_friday_offer) to toggle the homepage banner and
-- favourites section on/off independently of the dedicated collection page
-- and nav link, which stay available regardless.
insert into site_settings (key, value, description)
values (
  'wedding_promotion',
  '{
    "enabled": true
  }'::jsonb,
  'Toggles the homepage "The Wedding Edit" banner and "Wedding Season Favourites" section. The /wedding-collection page and its nav link are unaffected.'
)
on conflict (key) do nothing;
