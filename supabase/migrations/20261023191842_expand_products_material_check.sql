-- Reconciliation: applied directly to production (2026-10-23), never
-- committed to this repo — see 20261023184150's header for context.
alter table products drop constraint products_material_check;
alter table products add constraint products_material_check
  check (
    material is null or material = any (array[
      'Artificial Gold', 'Artificial Silver', 'Kundan', 'Pearl',
      'Crystal', 'Stainless Steel', 'Alloy', 'Beaded', 'Brass', 'Copper',
      'Oxidized Silver', 'Antique Gold', 'Antique Silver', 'Meenakari',
      'Thread', 'Resin', 'Rhinestone', 'Cubic Zirconia', 'Enamel',
      'Wood', 'Fabric', 'Terracotta'
    ])
  );
