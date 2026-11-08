-- Optional link from a "Follow Our Style" post to the product it shows, so
-- the post can be auto-hidden from the homepage once that product is out
-- of stock. Null means "no linked product" -- the post always shows, same
-- as before this migration.
alter table public.social_posts
  add column product_id uuid references public.products(id) on delete set null;

create index if not exists social_posts_product_id_idx on public.social_posts(product_id);
