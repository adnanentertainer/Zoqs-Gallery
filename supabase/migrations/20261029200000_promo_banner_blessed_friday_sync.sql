-- ZOQ's Gallery — let a promotional banner auto-sync its subtitle with the
-- Blessed Friday Offer settings (discount % and minimum spend), instead of
-- free text an admin has to remember to update by hand. The existing
-- "Blessed Friday Offer" banner's subtitle ("10% off on orders above Rs.
-- 3,000.") had drifted out of sync with the live Blessed Friday Offer
-- settings (now 10% / Rs. 3,500) for exactly this reason — this flag closes
-- that gap the same way `promoCode` is already resolved live via a join
-- rather than stored as text (see promoBannerService.mapBannerRow).
alter table promotional_banners
  add column auto_sync_blessed_friday boolean not null default false;

-- Turn the flag on for the existing banner that represents the Blessed
-- Friday offer (identified by title, the only one with no linked promo
-- code) so it starts reflecting live settings immediately.
update promotional_banners
  set auto_sync_blessed_friday = true
  where title = 'Blessed Friday Offer' and promo_code_id is null;
