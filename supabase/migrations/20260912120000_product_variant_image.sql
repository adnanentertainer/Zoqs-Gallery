-- Per-variant image, per the Inventory Management spec's Product Variants
-- requirement (Variant ID/SKU/Price/Stock/Image). Nullable — a variant with
-- no image of its own falls back to the base product's images.
alter table product_variants
  add column if not exists image_url text;
