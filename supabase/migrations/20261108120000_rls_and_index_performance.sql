-- Performance pass driven by the Supabase performance advisor:
--
-- 1. Multiple permissive policies -- several tables had a separate
--    "Admins can read all X" policy alongside a "Public/Users can read ..."
--    policy for the same role+action. Postgres must evaluate every
--    permissive policy for a query and OR their results together, so two
--    policies cost more than one that already contains the OR. Each pair
--    (or trio, for reviews) below is merged into a single policy with
--    identical resulting visibility.
-- 2. Auth RLS initplan -- bare auth.uid()/is_admin() calls in a policy are
--    re-evaluated per row; wrapping them in `(select ...)` lets Postgres
--    evaluate them once per statement instead.
-- 3. Unindexed foreign keys -- adds a covering index for every FK the
--    advisor flagged, so joins/lookups through them don't fall back to a
--    sequential scan.

-- The merged policies below call is_admin() from policies that now apply
-- to the `public` role (anon included) rather than `authenticated` only,
-- so anon needs EXECUTE on it too, or every one of these reads errors with
-- "permission denied for function is_admin" instead of just evaluating to
-- false for a non-admin visitor.
grant execute on function public.is_admin() to anon;

-- ---------------------------------------------------------------------
-- 1 + 2: consolidated, optimized policies
-- ---------------------------------------------------------------------

drop policy if exists "Admins can read all categories" on public.categories;
drop policy if exists "Public can read active categories" on public.categories;
create policy "Can read categories" on public.categories
  for select to public
  using ((select public.is_admin()) or is_active = true);

drop policy if exists "Admins can read all hero images" on public.hero_images;
drop policy if exists "Public can read active hero images" on public.hero_images;
create policy "Can read hero images" on public.hero_images
  for select to public
  using ((select public.is_admin()) or is_active = true);

drop policy if exists "Admins can read all order items" on public.order_items;
drop policy if exists "Users can read own order items" on public.order_items;
create policy "Can read order items" on public.order_items
  for select to public
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = (select auth.uid())
    )
  );

drop policy if exists "Admins can read all orders" on public.orders;
drop policy if exists "Users can read own orders" on public.orders;
create policy "Can read orders" on public.orders
  for select to public
  using ((select public.is_admin()) or (select auth.uid()) = user_id);

drop policy if exists "Admins can read all product images" on public.product_images;
drop policy if exists "Public can read images of active products" on public.product_images;
create policy "Can read product images" on public.product_images
  for select to public
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.products
      where products.id = product_images.product_id
        and products.is_active = true
    )
  );

drop policy if exists "Admins can read all product variants" on public.product_variants;
drop policy if exists "Public can read active variants of active products" on public.product_variants;
create policy "Can read product variants" on public.product_variants
  for select to public
  using (
    (select public.is_admin())
    or (
      is_active = true
      and exists (
        select 1 from public.products
        where products.id = product_variants.product_id
          and products.is_active = true
      )
    )
  );

drop policy if exists "Admins can read all products" on public.products;
drop policy if exists "Public can read active products" on public.products;
create policy "Can read products" on public.products
  for select to public
  using ((select public.is_admin()) or is_active = true);

drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Can read profiles" on public.profiles
  for select to public
  using ((select public.is_admin()) or (select auth.uid()) = id);

drop policy if exists "Admins can read all promo codes" on public.promo_codes;
drop policy if exists "Public can read promo codes linked to active banners" on public.promo_codes;
create policy "Can read promo codes" on public.promo_codes
  for select to public
  using (
    (select public.is_admin())
    or (
      is_active = true
      and exists (
        select 1 from public.promotional_banners
        where promotional_banners.promo_code_id = promo_codes.id
          and promotional_banners.is_active = true
      )
    )
  );

drop policy if exists "Admins can read all banners" on public.promotional_banners;
drop policy if exists "Public can read active banners" on public.promotional_banners;
create policy "Can read banners" on public.promotional_banners
  for select to public
  using ((select public.is_admin()) or is_active = true);

drop policy if exists "Admins can insert reviews" on public.reviews;
drop policy if exists "Customers can insert their own review" on public.reviews;
create policy "Can insert reviews" on public.reviews
  for insert to authenticated
  with check ((select public.is_admin()) or user_id = (select auth.uid()));

drop policy if exists "Admins can read all reviews" on public.reviews;
drop policy if exists "Customers can read their own reviews" on public.reviews;
drop policy if exists "Public can read approved reviews of active products" on public.reviews;
create policy "Can read reviews" on public.reviews
  for select to public
  using (
    (select public.is_admin())
    or user_id = (select auth.uid())
    or (
      is_approved = true
      and exists (
        select 1 from public.products
        where products.id = reviews.product_id
          and products.is_active = true
      )
    )
  );

drop policy if exists "Admins can read all social posts" on public.social_posts;
drop policy if exists "Public can read active social posts" on public.social_posts;
create policy "Can read social posts" on public.social_posts
  for select to public
  using ((select public.is_admin()) or is_active = true);

-- Not duplicated with any other policy, so just optimized in place.
alter policy "Users can update own profile" on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---------------------------------------------------------------------
-- 3: covering indexes for previously-unindexed foreign keys
-- ---------------------------------------------------------------------

create index if not exists inventory_movements_created_by_idx
  on public.inventory_movements(created_by);
create index if not exists order_items_variant_id_idx
  on public.order_items(variant_id);
create index if not exists orders_promo_code_id_idx
  on public.orders(promo_code_id);
create index if not exists promo_code_usages_order_id_idx
  on public.promo_code_usages(order_id);
create index if not exists promo_code_usages_user_id_idx
  on public.promo_code_usages(user_id);
create index if not exists promotional_banners_promo_code_id_idx
  on public.promotional_banners(promo_code_id);
create index if not exists purchase_items_product_id_idx
  on public.purchase_items(product_id);
create index if not exists purchase_items_variant_id_idx
  on public.purchase_items(variant_id);
create index if not exists purchases_created_by_idx
  on public.purchases(created_by);
