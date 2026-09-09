-- ZOQ's Gallery — Phase 7 initial schema
-- Products, categories, product images, product variants, reviews and site settings,
-- with RLS locked down to public reads only. Run this in the Supabase SQL editor,
-- or via `supabase db push` / `supabase migration up` if you use the Supabase CLI.

create extension if not exists "pgcrypto";

-- ============================================================================
-- updated_at trigger helper (reused by every table below that has updated_at)
-- ============================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- categories
-- ============================================================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  -- Maintained automatically by refresh_category_product_count() below —
  -- never written to directly by application code, so it can't drift out of sync.
  product_count integer not null default 0,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- slug already has an implicit index via the UNIQUE constraint above.

create trigger trg_categories_updated_at
before update on categories
for each row execute function set_updated_at();

-- ============================================================================
-- products
-- ============================================================================
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  short_description text,
  category_id uuid not null references categories(id) on delete restrict,
  price integer not null check (price >= 0),
  original_price integer check (original_price is null or original_price >= 0),
  badge text check (
    badge is null or badge in ('New', 'Best Seller', 'Sale', 'Limited Stock', 'Out of Stock')
  ),
  is_new boolean not null default false,
  is_best_seller boolean not null default false,
  is_featured boolean not null default false,
  is_sale boolean not null default false,
  stock integer not null default 0 check (stock >= 0),
  material text check (
    material is null or material in (
      'Artificial Gold', 'Kundan', 'Pearl', 'Crystal', 'Stainless Steel', 'Alloy'
    )
  ),
  color text check (
    color is null or color in (
      'Gold', 'Silver', 'Rose Gold', 'Pearl', 'Multicolor', 'Black'
    )
  ),
  occasion text check (
    occasion is null or occasion in (
      'Everyday', 'Party', 'Wedding', 'Bridal', 'Festive', 'Gift'
    )
  ),
  weight text,
  dimensions text,
  care_instructions text[],
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- slug already has an implicit index via the UNIQUE constraint above.
create index idx_products_category_id on products(category_id);
create index idx_products_is_active on products(is_active);
create index idx_products_is_featured on products(is_featured);
create index idx_products_is_new on products(is_new);
create index idx_products_is_best_seller on products(is_best_seller);
create index idx_products_is_sale on products(is_sale);

create trigger trg_products_updated_at
before update on products
for each row execute function set_updated_at();

-- Keep categories.product_count in sync automatically whenever products
-- are inserted, deleted, reassigned to a different category, or toggled active.
create or replace function refresh_category_product_count()
returns trigger as $$
declare
  target_category_id uuid;
begin
  if (tg_op = 'DELETE') then
    target_category_id := old.category_id;
  else
    target_category_id := new.category_id;
  end if;

  update categories
  set product_count = (
    select count(*) from products
    where category_id = target_category_id and is_active = true
  )
  where id = target_category_id;

  if (tg_op = 'UPDATE' and old.category_id is distinct from new.category_id) then
    update categories
    set product_count = (
      select count(*) from products
      where category_id = old.category_id and is_active = true
    )
    where id = old.category_id;
  end if;

  return null;
end;
$$ language plpgsql;

create trigger trg_products_refresh_category_count
after insert or update of category_id, is_active or delete on products
for each row execute function refresh_category_product_count();

-- ============================================================================
-- product_images
-- ============================================================================
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_product_images_product_id on product_images(product_id);

-- ============================================================================
-- product_variants
-- ============================================================================
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  -- e.g. name="Color", option_type="color", option_value="Gold" — mirrors the
  -- app's ProductVariantGroup (name/type) + ProductVariantOption (value) shape.
  name text not null,
  option_type text not null check (option_type in ('color', 'size', 'style')),
  option_value text not null,
  -- Signed delta from the product's base price (NULL = same as base price).
  -- The mapping layer computes the final unit price as price + price_adjustment.
  price_adjustment integer,
  stock integer check (stock is null or stock >= 0),
  sku text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_product_variants_product_id on product_variants(product_id);

create trigger trg_product_variants_updated_at
before update on product_variants
for each row execute function set_updated_at();

-- ============================================================================
-- reviews
-- ============================================================================
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  customer_name text not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  review text not null,
  review_date date not null default current_date,
  is_verified_purchase boolean not null default false,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_reviews_product_id on reviews(product_id);

create trigger trg_reviews_updated_at
before update on reviews
for each row execute function set_updated_at();

-- ============================================================================
-- site_settings
-- ============================================================================
create table site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);

-- key already has an implicit index via the UNIQUE constraint above.

create trigger trg_site_settings_updated_at
before update on site_settings
for each row execute function set_updated_at();

-- ============================================================================
-- Row Level Security — public (anon) reads only, no public writes
-- ============================================================================
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table reviews enable row level security;
alter table site_settings enable row level security;

create policy "Public can read active categories"
  on categories for select
  using (is_active = true);

create policy "Public can read active products"
  on products for select
  using (is_active = true);

create policy "Public can read images of active products"
  on product_images for select
  using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
        and products.is_active = true
    )
  );

create policy "Public can read active variants of active products"
  on product_variants for select
  using (
    is_active = true
    and exists (
      select 1 from products
      where products.id = product_variants.product_id
        and products.is_active = true
    )
  );

create policy "Public can read approved reviews of active products"
  on reviews for select
  using (
    is_approved = true
    and exists (
      select 1 from products
      where products.id = reviews.product_id
        and products.is_active = true
    )
  );

create policy "Public can read site settings"
  on site_settings for select
  using (true);

-- No insert/update/delete policies are defined for any table above. With RLS
-- enabled and no matching policy, PostgREST denies those operations for the
-- anon/authenticated roles by default — only the service_role key (used
-- exclusively by scripts/seed.ts, never in app/browser code) can write.
