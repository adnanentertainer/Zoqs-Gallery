-- The admin product form already offers "Artificial Silver" as a Material
-- option, but the check constraint never included it, so saving a product
-- with that material failed with a generic "Unable to create this product
-- right now." error (Postgres 23514).
alter table products drop constraint products_material_check;

alter table products add constraint products_material_check check (
  material is null or material in (
    'Artificial Gold', 'Artificial Silver', 'Kundan', 'Pearl', 'Crystal',
    'Stainless Steel', 'Alloy'
  )
);
