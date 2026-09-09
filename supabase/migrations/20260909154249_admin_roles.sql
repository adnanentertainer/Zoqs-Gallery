-- ZOQ's Gallery — Phase 10: Admin Dashboard authorization
-- Adds a database-backed role to profiles, a SECURITY DEFINER helper RLS
-- policies can call to check it without recursion, and admin-only write
-- policies on the tables the admin dashboard manages. No table's RLS is
-- disabled and no policy uses `using (true)` for a sensitive table.

-- ============================================================================
-- profiles.role
-- ============================================================================
-- Every existing and new row defaults to 'customer' — nobody is granted
-- admin access by this migration. Promoting a user to admin is a deliberate,
-- separate, documented manual step (see README §13) — never something a
-- signup or profile update can trigger.
alter table profiles
  add column role text not null default 'customer'
  check (role in ('customer', 'admin'));

create index idx_profiles_role on profiles(role);

-- ----------------------------------------------------------------------------
-- Column-level lockdown: the existing "Users can update own profile" RLS
-- policy (Phase 8) is row-level only — it lets a user update their own row,
-- but says nothing about *which columns*. Without this, an authenticated
-- customer could call `supabase.from('profiles').update({ role: 'admin' })`
-- directly from the browser and pass RLS, because RLS never inspects column
-- names. Supabase's default privileges also grant UPDATE on every column to
-- `authenticated` the moment a table is created, so that broad grant must be
-- revoked and replaced with an explicit, narrower column list.
revoke update on profiles from authenticated;
grant update (full_name, first_name, last_name, phone, avatar_url) on profiles
  to authenticated;
-- role, email, id, created_at, updated_at are deliberately excluded — the
-- customer profile update flow from Phase 8 (ProfileForm → AuthContext →
-- supabase.from("profiles").update({ full_name, phone })) never touched
-- those columns anyway, so this changes no legitimate behavior.

-- ============================================================================
-- is_admin() — reusable role check for RLS policies
-- ============================================================================
-- SECURITY DEFINER is required here, not merely convenient: without it, a
-- policy on `profiles` itself that called a SECURITY INVOKER version of this
-- function would re-trigger `profiles`' own SELECT RLS policy while
-- evaluating that same policy — a recursive RLS evaluation. Running as the
-- function owner (which, as the table owner, bypasses RLS entirely) reads
-- `profiles.role` directly without ever invoking `profiles`' RLS policies,
-- avoiding that recursion. `set search_path = public` pins name resolution
-- against a search-path hijack. `stable` lets Postgres cache the result
-- within a single statement instead of re-querying per row.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

revoke execute on function is_admin() from public;
revoke execute on function is_admin() from anon;
grant execute on function is_admin() to authenticated;

-- Admins can see every profile (needed for /admin/customers); the existing
-- "Users can read own profile" policy is untouched and still applies to
-- everyone, including admins reading their own row. Postgres OR's multiple
-- permissive SELECT policies together, so this only ever widens access.
create policy "Admins can read all profiles"
  on profiles for select
  to authenticated
  using (is_admin());

-- ============================================================================
-- Products, categories, images, variants — admins can read everything
-- (including inactive rows the public policies exclude) and write.
-- ============================================================================
-- Public read policies from the Phase 7 schema are untouched — inactive
-- products/categories/variants stay invisible to the storefront. These add
-- an admin-only SELECT policy (OR'd together with the public one, so it
-- only ever widens what an admin session sees) plus the write side, which
-- previously had no policy at all (and was therefore fully blocked for both
-- anon and authenticated).
create policy "Admins can read all products"
  on products for select to authenticated using (is_admin());
create policy "Admins can insert products"
  on products for insert to authenticated with check (is_admin());
create policy "Admins can update products"
  on products for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admins can delete products"
  on products for delete to authenticated using (is_admin());

create policy "Admins can read all categories"
  on categories for select to authenticated using (is_admin());
create policy "Admins can insert categories"
  on categories for insert to authenticated with check (is_admin());
create policy "Admins can update categories"
  on categories for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admins can delete categories"
  on categories for delete to authenticated using (is_admin());

create policy "Admins can read all product images"
  on product_images for select to authenticated using (is_admin());
create policy "Admins can insert product images"
  on product_images for insert to authenticated with check (is_admin());
create policy "Admins can update product images"
  on product_images for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admins can delete product images"
  on product_images for delete to authenticated using (is_admin());

create policy "Admins can read all product variants"
  on product_variants for select to authenticated using (is_admin());
create policy "Admins can insert product variants"
  on product_variants for insert to authenticated with check (is_admin());
create policy "Admins can update product variants"
  on product_variants for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admins can delete product variants"
  on product_variants for delete to authenticated using (is_admin());

-- ============================================================================
-- Orders / order items — admins can read everything; status/payment_status
-- are the only columns an admin update is allowed to touch.
-- ============================================================================
create index idx_orders_payment_status on orders(payment_status);

create policy "Admins can read all orders"
  on orders for select
  to authenticated
  using (is_admin());

create policy "Admins can read all order items"
  on order_items for select
  to authenticated
  using (is_admin());

-- Customers still have no UPDATE policy on orders at all (Phase 9), so this
-- adds the only order-mutation path that exists, and only for admins.
create policy "Admins can update order status"
  on orders for update
  to authenticated
  using (is_admin())
  with check (is_admin());

-- Column-level backstop even for admins: order totals/shipping/customer
-- snapshot fields must stay exactly as create_order() computed them. The
-- app's own admin Server Action never sends those columns either, but this
-- makes it impossible at the database level regardless, matching STEP 43's
-- "totals, shipping cost, order items" restriction as a hard guarantee
-- rather than an application-level convention.
revoke update on orders from authenticated;
grant update (status, payment_status) on orders to authenticated;

-- ============================================================================
-- Site settings — admins can update; reads remain public (Phase 7)
-- ============================================================================
create policy "Admins can update site settings"
  on site_settings for update
  to authenticated
  using (is_admin())
  with check (is_admin());
