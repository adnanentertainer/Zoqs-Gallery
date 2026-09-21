-- Fix: the homepage banner carousel joins promotional_banners to
-- promo_codes (to show "Use code: X" on the banner) using the public anon
-- client, but promo_codes has no public SELECT policy at all — by design,
-- so customers can never browse the promo_codes table directly. PostgREST
-- silently returns null for an embedded relation the caller's role can't
-- read, so the join always came back empty and the code chip never showed,
-- even for a correctly-linked active banner.
--
-- This adds one narrow, scoped public read policy — mirroring the existing
-- "Public can read images of active products" pattern (an EXISTS check
-- against another table's is_active flag) — so a promo code becomes
-- publicly visible ONLY when it is itself active AND the site owner has
-- deliberately featured it on a live homepage banner. This exposes nothing
-- customers don't already see advertised on the banner itself; codes not
-- linked to any active banner remain completely invisible to anon/public
-- reads, exactly as before.
create policy "Public can read promo codes linked to active banners"
  on promo_codes for select
  using (
    is_active = true
    and exists (
      select 1 from promotional_banners
      where promotional_banners.promo_code_id = promo_codes.id
        and promotional_banners.is_active = true
    )
  );
