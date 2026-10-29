-- Reconciliation: applied directly to production (2026-10-23), never
-- committed to this repo — see 20261023184150's header for context.
alter table products drop constraint products_color_check;
alter table products add constraint products_color_check
  check (
    color is null or color = any (array[
      'Gold', 'Silver', 'Rose Gold', 'Pearl', 'Multicolor', 'Black',
      'White', 'Red', 'Pink', 'Blue', 'Green', 'Purple', 'Maroon',
      'Beige', 'Bronze', 'Copper', 'Turquoise', 'Champagne'
    ])
  );
