-- Reconciliation: this migration was applied directly to production
-- (2026-10-23) and was never committed to this repo. Recreated here from the
-- production migration history (supabase_migrations.schema_migrations) for
-- an accurate local migration history — see also
-- 20261023190244_expand_products_color_check.sql,
-- 20261023191842_expand_products_material_check.sql, and
-- 20261023192235_expand_products_occasion_check.sql, applied the same day.
-- Superseded immediately by 20261023191842_expand_products_material_check.sql
-- below, which replaces this same constraint with a longer allowed list
-- (including 'Beaded').
alter table products drop constraint products_material_check;
alter table products add constraint products_material_check
  check (
    material is null or material = any (array[
      'Artificial Gold', 'Artificial Silver', 'Kundan', 'Pearl',
      'Crystal', 'Stainless Steel', 'Alloy', 'Beaded'
    ])
  );
