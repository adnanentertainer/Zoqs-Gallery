-- Lets a signed-in customer submit their own product review from the
-- storefront. Previously reviews had no insert policy at all -- the only
-- way a row could exist was via the service-role key (seed data). New
-- customer-submitted reviews are inserted with is_approved = false by the
-- application (not a column default change, so existing seed/service-role
-- inserts keep their current behavior) and stay hidden from the public
-- until an admin approves them.

alter table reviews add column user_id uuid references auth.users(id) on delete set null;
create index idx_reviews_user_id on reviews(user_id);

-- One review per customer per product -- re-submitting isn't a supported
-- flow (there's no edit UI), so this just blocks accidental duplicates at
-- the database level as well as the application-level check.
create unique index idx_reviews_one_per_customer_per_product
  on reviews(user_id, product_id)
  where user_id is not null;

create policy "Customers can insert their own review"
  on reviews for insert
  to authenticated
  with check (user_id = auth.uid());

-- So a customer can see their own pending review (e.g. "awaiting approval")
-- even though the public policy only shows is_approved = true rows.
create policy "Customers can read their own reviews"
  on reviews for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins can read all reviews"
  on reviews for select
  to authenticated
  using (is_admin());

create policy "Admins can update reviews"
  on reviews for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "Admins can delete reviews"
  on reviews for delete
  to authenticated
  using (is_admin());
