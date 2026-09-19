-- ZOQ's Gallery — Facebook/Instagram Shop product tagging
-- Adds the settings needed to tag auto-posted products against a synced
-- Meta product catalog, so posts show a tappable "Shop now" product tag
-- (Meta only supports CTA buttons on organic posts through this
-- catalog-tagging mechanism, or paid ads).
alter table social_media_settings
  add column facebook_catalog_id text,
  add column facebook_product_feed_id text,
  add column product_tagging_enabled boolean not null default false;
