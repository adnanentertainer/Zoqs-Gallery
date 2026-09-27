-- ============================================================================
-- has_active_promo_code() — lets the checkout page decide whether to show
-- the "Have a promo code?" field at all. promo_codes has no public SELECT
-- policy (see 20260921000000_promo_codes_and_banners.sql: every
-- customer-facing read goes through a SECURITY DEFINER RPC), so this mirrors
-- validate_promo_code()'s pattern — it exposes nothing about any individual
-- code, only a yes/no on whether at least one is currently redeemable
-- (active, within its start/expiry window, and under its usage limit).
-- Hides the promo input entirely when no campaign is running, instead of
-- showing an "Apply" box that could only ever say "invalid code".
-- ============================================================================
create or replace function has_active_promo_code()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from promo_codes
    where is_active = true
      and (starts_at is null or starts_at <= now())
      and (expires_at is null or expires_at >= now())
      and (usage_limit is null or usage_count < usage_limit)
  );
$$;

grant execute on function has_active_promo_code() to authenticated, anon;
revoke execute on function has_active_promo_code() from public;
