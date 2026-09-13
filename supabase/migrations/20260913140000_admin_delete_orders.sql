-- The admin_roles migration gave admins DELETE policies on products,
-- categories, images, and variants, but never on orders. With RLS enabled
-- and no DELETE policy, an admin's delete matched zero rows silently (no
-- error, nothing removed), which is why the order list's Delete button
-- appeared to do nothing.
create policy "Admins can delete orders"
  on orders for delete
  to authenticated
  using (is_admin());
