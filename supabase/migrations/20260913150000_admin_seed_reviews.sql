-- Lets an admin seed an initial review/rating while creating a product (so
-- it doesn't launch showing zero ratings). The existing insert policy only
-- allows a customer to insert their own review (user_id = auth.uid()); an
-- admin-seeded review has no user_id, so it needs its own permissive policy.
-- Postgres OR's multiple permissive INSERT policies together, so this only
-- ever widens who can insert, matching the pattern used for orders/products.
create policy "Admins can insert reviews"
  on reviews for insert
  to authenticated
  with check (is_admin());
