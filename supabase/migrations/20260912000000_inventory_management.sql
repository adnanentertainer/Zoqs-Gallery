-- ZOQ's Gallery — Inventory Management System
-- Adds supplier/purchase/stock-movement tracking on top of the existing
-- products/orders schema. Reuses set_updated_at() (Phase 7) and is_admin()
-- (Phase 10) rather than duplicating either.

-- ============================================================================
-- suppliers (created first — products.primary_supplier_id references it)
-- ============================================================================
create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_suppliers_updated_at
before update on suppliers
for each row execute function set_updated_at();

alter table suppliers enable row level security;

create policy "Admins can read suppliers"
  on suppliers for select to authenticated using (is_admin());
create policy "Admins can insert suppliers"
  on suppliers for insert to authenticated with check (is_admin());
create policy "Admins can update suppliers"
  on suppliers for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admins can delete suppliers"
  on suppliers for delete to authenticated using (is_admin());

-- ============================================================================
-- categories — sku_prefix, for category-coded product IDs (e.g. NEC-0001)
-- ============================================================================
-- Every category gets a short, unique, uppercase prefix. If an admin doesn't
-- supply one when creating a category, generate_category_sku_prefix() below
-- derives one from the name automatically (colliding derivations get a
-- numeric suffix, e.g. NEC, NEC2), so this never blocks category creation.
alter table categories
  add column sku_prefix text,
  add column next_sku_seq integer not null default 1;

-- Backfill: this project already has real categories in production, so
-- every existing row needs a prefix assigned before the column can become
-- NOT NULL + UNIQUE below. Same derive-with-numeric-suffix rule as the
-- trigger, applied once here in creation order.
do $$
declare
  v_cat record;
  v_base text;
  v_candidate text;
  v_suffix integer;
begin
  for v_cat in select id, name from categories where sku_prefix is null order by created_at loop
    v_base := upper(left(regexp_replace(v_cat.name, '[^a-zA-Z]', '', 'g'), 3));
    if v_base = '' then
      v_base := 'CAT';
    end if;
    v_candidate := v_base;
    v_suffix := 1;
    while exists (select 1 from categories where sku_prefix = v_candidate) loop
      v_suffix := v_suffix + 1;
      v_candidate := v_base || v_suffix::text;
    end loop;
    update categories set sku_prefix = v_candidate where id = v_cat.id;
  end loop;
end $$;

alter table categories
  alter column sku_prefix set not null,
  add constraint categories_sku_prefix_unique unique (sku_prefix);

create or replace function generate_category_sku_prefix()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base text;
  v_candidate text;
  v_suffix integer := 1;
begin
  if new.sku_prefix is not null and trim(new.sku_prefix) <> '' then
    new.sku_prefix := upper(trim(new.sku_prefix));
    return new;
  end if;

  v_base := upper(left(regexp_replace(new.name, '[^a-zA-Z]', '', 'g'), 3));
  if v_base = '' then
    v_base := 'CAT';
  end if;
  v_candidate := v_base;
  while exists (select 1 from categories where sku_prefix = v_candidate) loop
    v_suffix := v_suffix + 1;
    v_candidate := v_base || v_suffix::text;
  end loop;

  new.sku_prefix := v_candidate;
  return new;
end;
$$;

create trigger trg_categories_generate_sku_prefix
before insert on categories
for each row execute function generate_category_sku_prefix();

-- ============================================================================
-- products — new inventory-management columns
-- ============================================================================
-- sku: nullable + a partial unique index (not a plain UNIQUE column) so a
-- product mid-insert can briefly have sku = NULL without violating
-- uniqueness — generate_product_sku() below fills it in automatically
-- before the row is ever visible (category prefix + sequence, e.g.
-- NEC-0001), unless an admin explicitly supplies their own.
-- cost_price: separate from the existing selling `price`, needed for
-- inventory-value reporting and purchase records.
-- min_stock_level / max_stock_level: per-product override of the previous
-- global LOW_STOCK_THRESHOLD constant (src/lib/products.ts); the constant
-- becomes the default new products are created with, not a hard rule.
-- force_unavailable: manual "pause selling" override, deliberately separate
-- from `is_active` — is_active fully removes a product from the site
-- (404s the page), whereas this keeps it visible/browsable but shows
-- "Out of Stock" and blocks purchase, without touching the real stock count.
alter table products
  add column sku text,
  add column cost_price integer check (cost_price is null or cost_price >= 0),
  add column min_stock_level integer not null default 5,
  add column max_stock_level integer check (max_stock_level is null or max_stock_level >= 0),
  add column force_unavailable boolean not null default false,
  add column primary_supplier_id uuid references suppliers(id) on delete set null,
  add constraint products_max_stock_gte_min
    check (max_stock_level is null or max_stock_level >= min_stock_level);

create unique index idx_products_sku on products(sku) where sku is not null;
create index idx_products_primary_supplier_id on products(primary_supplier_id);

-- Backfill: assign a category-coded ID to every product that already exists
-- in production, ordered by category then creation date, so long-standing
-- products get the lowest sequence numbers within their category.
do $$
declare
  v_prod record;
  v_seq integer;
  v_prefix text;
begin
  for v_prod in
    select id, category_id from products where sku is null order by category_id, created_at
  loop
    update categories
      set next_sku_seq = next_sku_seq + 1
      where id = v_prod.category_id
      returning sku_prefix, next_sku_seq - 1 into v_prefix, v_seq;

    update products
      set sku = v_prefix || '-' || lpad(v_seq::text, 4, '0')
      where id = v_prod.id;
  end loop;
end $$;

-- New products: auto-generate the same category-coded ID on insert unless
-- the admin explicitly supplies their own sku. Atomic
-- `UPDATE categories SET next_sku_seq = next_sku_seq + 1 ... RETURNING`
-- means two products created in the same category at the same instant
-- still get distinct sequence numbers — no race condition.
create or replace function generate_product_sku()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text;
  v_seq integer;
begin
  if new.sku is not null and trim(new.sku) <> '' then
    return new;
  end if;

  update categories
    set next_sku_seq = next_sku_seq + 1
    where id = new.category_id
    returning sku_prefix, next_sku_seq - 1
    into v_prefix, v_seq;

  new.sku := v_prefix || '-' || lpad(v_seq::text, 4, '0');
  return new;
end;
$$;

create trigger trg_products_generate_sku
before insert on products
for each row execute function generate_product_sku();

-- ============================================================================
-- inventory_movements
-- ============================================================================
-- Nullable product_id/variant_id + ON DELETE SET NULL mirrors the
-- order_items convention (Phase 9): movement history must stay readable
-- even if the product/variant it referenced is later deleted, so the FK is
-- for referential convenience only — sku is snapshotted at write time.
-- No INSERT/UPDATE/DELETE policy is defined at all (same convention as
-- orders/order_items): the only way a row is ever written is through the
-- record_stock_movement(), complete_purchase(), and create_order()
-- SECURITY DEFINER functions below, never directly by client code.
create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  sku text,
  movement_type text not null check (movement_type in (
    'stock_in', 'stock_out', 'sale', 'return', 'adjustment', 'damaged', 'purchase'
  )),
  -- Signed delta: negative for stock_out/sale/damaged, positive for
  -- stock_in/return/purchase/positive adjustment. previous_quantity +
  -- quantity_change = new_quantity always holds, by construction.
  quantity_change integer not null check (quantity_change <> 0),
  previous_quantity integer not null check (previous_quantity >= 0),
  new_quantity integer not null check (new_quantity >= 0),
  reason text,
  reference_number text,
  -- Null for system-driven rows (a customer's own order), set for
  -- admin-driven ones (stock in/out/adjust, purchase received).
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_inventory_movements_product_id on inventory_movements(product_id);
create index idx_inventory_movements_variant_id on inventory_movements(variant_id);
create index idx_inventory_movements_created_at on inventory_movements(created_at);
create index idx_inventory_movements_movement_type on inventory_movements(movement_type);

alter table inventory_movements enable row level security;

create policy "Admins can read inventory movements"
  on inventory_movements for select to authenticated using (is_admin());

-- ============================================================================
-- purchases + purchase_items
-- ============================================================================
-- Unlike inventory_movements, purchases/purchase_items get normal
-- admin-scoped RLS write policies — an admin can freely draft/edit a
-- purchase (add/remove line items, change supplier) before it's received.
-- Only the "mark as completed" transition (which bumps stock and writes
-- movement rows) goes through the complete_purchase() SECURITY DEFINER
-- function below, so that specific step stays atomic and idempotent.
create table purchases (
  id uuid primary key default gen_random_uuid(),
  purchase_number text not null unique,
  supplier_id uuid not null references suppliers(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid')),
  total_amount integer not null default 0 check (total_amount >= 0),
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_purchases_supplier_id on purchases(supplier_id);
create index idx_purchases_status on purchases(status);

create trigger trg_purchases_updated_at
before update on purchases
for each row execute function set_updated_at();

alter table purchases enable row level security;

create policy "Admins can read purchases"
  on purchases for select to authenticated using (is_admin());
create policy "Admins can insert purchases"
  on purchases for insert to authenticated with check (is_admin());
create policy "Admins can update purchases"
  on purchases for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admins can delete purchases"
  on purchases for delete to authenticated using (is_admin());

create table purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchases(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name text not null,
  sku text,
  quantity integer not null check (quantity > 0),
  cost_price integer not null check (cost_price >= 0),
  line_total integer not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index idx_purchase_items_purchase_id on purchase_items(purchase_id);

alter table purchase_items enable row level security;

create policy "Admins can read purchase items"
  on purchase_items for select to authenticated using (is_admin());
create policy "Admins can insert purchase items"
  on purchase_items for insert to authenticated with check (is_admin());
create policy "Admins can update purchase items"
  on purchase_items for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admins can delete purchase items"
  on purchase_items for delete to authenticated using (is_admin());

-- ============================================================================
-- record_stock_movement() — Stock In / Stock Out / Adjust, atomic + logged
-- ============================================================================
-- Same concurrency-safe pattern as create_order(): an atomic
-- `UPDATE ... WHERE stock + delta >= 0 RETURNING stock` closes the
-- read-then-write race, so stock can never go negative even under
-- concurrent calls, and previous_quantity is derived from the *actual*
-- returned new value (new - delta), never from a separately-read snapshot
-- that could already be stale.
create or replace function record_stock_movement(
  p_product_id uuid,
  p_variant_id uuid,
  p_movement_type text,
  p_quantity_change integer,
  p_reason text default null,
  p_reference_number text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sku text;
  v_new_quantity integer;
  v_previous_quantity integer;
begin
  if not is_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  if p_movement_type not in (
    'stock_in', 'stock_out', 'sale', 'return', 'adjustment', 'damaged', 'purchase'
  ) then
    raise exception 'Invalid movement type.' using errcode = '22023';
  end if;

  if p_quantity_change is null or p_quantity_change = 0 then
    raise exception 'Quantity change cannot be zero.' using errcode = '22023';
  end if;

  if p_variant_id is not null then
    select sku into v_sku from product_variants
      where id = p_variant_id and product_id = p_product_id;
    if not found then
      raise exception 'Variant not found.' using errcode = 'P0002';
    end if;

    update product_variants
      set stock = coalesce(stock, 0) + p_quantity_change
      where id = p_variant_id and coalesce(stock, 0) + p_quantity_change >= 0
      returning stock into v_new_quantity;

    if not found then
      raise exception 'Insufficient stock — this change would make stock negative.'
        using errcode = 'P0001';
    end if;
  else
    select sku into v_sku from products where id = p_product_id;
    if not found then
      raise exception 'Product not found.' using errcode = 'P0002';
    end if;

    update products
      set stock = stock + p_quantity_change
      where id = p_product_id and stock + p_quantity_change >= 0
      returning stock into v_new_quantity;

    if not found then
      raise exception 'Insufficient stock — this change would make stock negative.'
        using errcode = 'P0001';
    end if;
  end if;

  v_previous_quantity := v_new_quantity - p_quantity_change;

  insert into inventory_movements (
    product_id, variant_id, sku, movement_type, quantity_change,
    previous_quantity, new_quantity, reason, reference_number, created_by
  ) values (
    p_product_id, p_variant_id, v_sku, p_movement_type, p_quantity_change,
    v_previous_quantity, v_new_quantity, p_reason, p_reference_number, auth.uid()
  );

  return jsonb_build_object(
    'previous_quantity', v_previous_quantity,
    'new_quantity', v_new_quantity
  );
end;
$$;

revoke execute on function record_stock_movement(uuid, uuid, text, integer, text, text) from public;
revoke execute on function record_stock_movement(uuid, uuid, text, integer, text, text) from anon;
grant execute on function record_stock_movement(uuid, uuid, text, integer, text, text) to authenticated;

-- ============================================================================
-- complete_purchase() — marks a purchase received: bumps stock for every
-- line item and writes one inventory_movements row each, atomically.
-- ============================================================================
create or replace function complete_purchase(p_purchase_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase_number text;
  v_status text;
  v_item record;
  v_new_quantity integer;
  v_previous_quantity integer;
begin
  if not is_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  -- Row lock guards against two concurrent "complete" clicks double-applying
  -- the same purchase's stock — a different race than the per-item stock
  -- quantity race (which the atomic UPDATEs below already close).
  select purchase_number, status into v_purchase_number, v_status
    from purchases where id = p_purchase_id for update;

  if not found then
    raise exception 'Purchase not found.' using errcode = 'P0002';
  end if;

  if v_status = 'completed' then
    raise exception 'This purchase has already been completed.' using errcode = 'P0001';
  end if;

  for v_item in select * from purchase_items where purchase_id = p_purchase_id loop
    if v_item.variant_id is not null then
      update product_variants
        set stock = coalesce(stock, 0) + v_item.quantity
        where id = v_item.variant_id
        returning stock into v_new_quantity;
    elsif v_item.product_id is not null then
      update products
        set stock = stock + v_item.quantity
        where id = v_item.product_id
        returning stock into v_new_quantity;
    else
      continue;
    end if;

    v_previous_quantity := v_new_quantity - v_item.quantity;

    insert into inventory_movements (
      product_id, variant_id, sku, movement_type, quantity_change,
      previous_quantity, new_quantity, reason, reference_number, created_by
    ) values (
      v_item.product_id, v_item.variant_id, v_item.sku, 'purchase', v_item.quantity,
      v_previous_quantity, v_new_quantity, 'Purchase received', v_purchase_number, auth.uid()
    );
  end loop;

  update purchases set status = 'completed' where id = p_purchase_id;

  return jsonb_build_object('purchase_number', v_purchase_number);
end;
$$;

revoke execute on function complete_purchase(uuid) from public;
revoke execute on function complete_purchase(uuid) from anon;
grant execute on function complete_purchase(uuid) to authenticated;

-- ============================================================================
-- create_order() — extended to also write an inventory_movements row (type
-- 'sale') per line item, inside the same transaction as the existing stock
-- decrement. Everything above the "-- NEW:" markers is unchanged from the
-- Phase 9 migration; only the movement-logging additions are new.
-- ============================================================================
create or replace function create_order(
  p_items jsonb,
  p_payment_method text,
  p_shipping jsonb,
  p_customer_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_quantity integer;
  v_product_id uuid;
  v_product_name text;
  v_product_price integer;
  v_product_stock integer;
  v_product_is_active boolean;
  v_product_image_url text;
  v_product_sku text;
  v_selected_variants jsonb;
  v_variant_key text;
  v_variant_value text;
  v_variant_id uuid;
  v_variant_name text;
  v_variant_price_adjustment integer;
  v_variant_stock integer;
  v_variant_is_active boolean;
  v_variant_sku text;
  v_unit_price integer;
  v_line_total integer;
  v_subtotal integer := 0;
  v_shipping_cost integer;
  v_total integer;
  v_free_shipping_threshold integer;
  v_flat_shipping_cost integer;
  v_order_id uuid;
  v_order_number text;
  v_attempt integer := 0;
  v_order_items jsonb := '[]'::jsonb;
  -- NEW: the stock a line item's atomic decrement actually returned, stashed
  -- per-line so the inventory_movements insert (after v_order_number exists)
  -- can derive previous_quantity from it.
  v_movement_new_stock integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '28000';
  end if;

  if p_payment_method not in ('cod', 'bank_transfer', 'easypaisa', 'jazzcash') then
    raise exception 'Invalid payment method.' using errcode = '22023';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty.' using errcode = '22023';
  end if;

  if coalesce(trim(p_shipping->>'full_name'), '') = ''
    or coalesce(trim(p_shipping->>'email'), '') = ''
    or coalesce(trim(p_shipping->>'phone'), '') = ''
    or coalesce(trim(p_shipping->>'address_line_1'), '') = ''
    or coalesce(trim(p_shipping->>'city'), '') = ''
    or coalesce(trim(p_shipping->>'province'), '') = ''
    or coalesce(trim(p_shipping->>'postal_code'), '') = ''
  then
    raise exception 'Shipping information is incomplete.' using errcode = '22023';
  end if;

  if length(coalesce(p_customer_notes, '')) > 500 then
    raise exception 'Customer notes are too long.' using errcode = '22023';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity is null or v_quantity < 1 then
      raise exception 'Invalid quantity.' using errcode = '22023';
    end if;

    select p.id, p.name, p.price, p.stock, p.is_active, p.sku,
           (select pi.image_url from product_images pi
             where pi.product_id = p.id
             order by pi.display_order limit 1)
      into v_product_id, v_product_name, v_product_price, v_product_stock,
           v_product_is_active, v_product_sku, v_product_image_url
      from products p
      where p.slug = v_item->>'product_slug';

    if not found or v_product_is_active is not true then
      raise exception 'One or more products in your cart are no longer available.'
        using errcode = 'P0001';
    end if;

    v_unit_price := v_product_price;
    v_variant_id := null;
    v_variant_name := null;
    v_variant_sku := null;
    v_selected_variants := v_item->'selected_variants';

    if v_selected_variants is not null and jsonb_typeof(v_selected_variants) = 'object' then
      for v_variant_key, v_variant_value in select * from jsonb_each_text(v_selected_variants)
      loop
        select pv.id, pv.option_value, pv.price_adjustment, pv.stock, pv.is_active, pv.sku
          into v_variant_id, v_variant_name, v_variant_price_adjustment,
               v_variant_stock, v_variant_is_active, v_variant_sku
          from product_variants pv
          where pv.product_id = v_product_id
            and pv.option_type = v_variant_key
            and pv.option_value = v_variant_value;

        if not found or v_variant_is_active is not true then
          raise exception 'A selected product option is no longer available.'
            using errcode = 'P0001';
        end if;

        if v_variant_price_adjustment is not null then
          v_unit_price := v_product_price + v_variant_price_adjustment;
        end if;

        if v_variant_stock is not null and v_variant_stock < v_quantity then
          raise exception 'Insufficient stock for %.', v_product_name using errcode = 'P0001';
        end if;
      end loop;
    end if;

    if v_variant_id is null and v_product_stock < v_quantity then
      raise exception 'Insufficient stock for %.', v_product_name using errcode = 'P0001';
    end if;

    v_line_total := v_unit_price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;

    if v_variant_id is not null and v_variant_stock is not null then
      update product_variants set stock = stock - v_quantity
        where id = v_variant_id and stock >= v_quantity
        returning stock into v_movement_new_stock;
      if not found then
        raise exception 'Insufficient stock for %.', v_product_name using errcode = 'P0001';
      end if;
    elsif v_variant_id is null then
      update products set stock = stock - v_quantity
        where id = v_product_id and stock >= v_quantity
        returning stock into v_movement_new_stock;
      if not found then
        raise exception 'Insufficient stock for %.', v_product_name using errcode = 'P0001';
      end if;
    end if;

    -- NEW: stash everything record_order_movements (below) needs per line —
    -- the movement rows themselves are inserted after v_order_number exists,
    -- so reference_number can point at the real order number.
    v_order_items := v_order_items || jsonb_build_object(
      'product_id', v_product_id,
      'variant_id', v_variant_id,
      'product_name', v_product_name,
      'variant_name', v_variant_name,
      'product_price', v_unit_price,
      'quantity', v_quantity,
      'line_total', v_line_total,
      'product_image_url', v_product_image_url,
      'sku', coalesce(v_variant_sku, v_product_sku),
      'new_stock', v_movement_new_stock
    );
  end loop;

  select (value #>> '{}')::integer into v_free_shipping_threshold
    from site_settings where key = 'free_shipping_threshold';
  select (value #>> '{}')::integer into v_flat_shipping_cost
    from site_settings where key = 'flat_shipping_cost';
  v_free_shipping_threshold := coalesce(v_free_shipping_threshold, 3000);
  v_flat_shipping_cost := coalesce(v_flat_shipping_cost, 250);

  v_shipping_cost := case
    when v_subtotal >= v_free_shipping_threshold then 0
    else v_flat_shipping_cost
  end;
  v_total := v_subtotal + v_shipping_cost;

  loop
    v_order_number := 'ZOQ-' || to_char(now(), 'YYYYMMDD') || '-'
      || lpad(floor(random() * 10000)::text, 4, '0');
    exit when not exists (select 1 from orders where order_number = v_order_number);
    v_attempt := v_attempt + 1;
    if v_attempt > 20 then
      raise exception 'Could not generate a unique order number. Please try again.'
        using errcode = 'P0001';
    end if;
  end loop;

  insert into orders (
    order_number, user_id, payment_method, subtotal, shipping_cost, total,
    shipping_full_name, shipping_email, shipping_phone,
    shipping_address_line_1, shipping_address_line_2, shipping_city,
    shipping_province, shipping_postal_code, shipping_country, customer_notes
  ) values (
    v_order_number, v_user_id, p_payment_method, v_subtotal, v_shipping_cost, v_total,
    trim(p_shipping->>'full_name'), trim(p_shipping->>'email'), trim(p_shipping->>'phone'),
    trim(p_shipping->>'address_line_1'),
    nullif(trim(coalesce(p_shipping->>'address_line_2', '')), ''),
    trim(p_shipping->>'city'), trim(p_shipping->>'province'), trim(p_shipping->>'postal_code'),
    coalesce(nullif(trim(coalesce(p_shipping->>'country', '')), ''), 'Pakistan'),
    nullif(trim(coalesce(p_customer_notes, '')), '')
  )
  returning id into v_order_id;

  insert into order_items (
    order_id, product_id, variant_id, product_name, variant_name,
    product_price, quantity, line_total, product_image_url
  )
  select
    v_order_id,
    (item->>'product_id')::uuid,
    (item->>'variant_id')::uuid,
    item->>'product_name',
    item->>'variant_name',
    (item->>'product_price')::integer,
    (item->>'quantity')::integer,
    (item->>'line_total')::integer,
    item->>'product_image_url'
  from jsonb_array_elements(v_order_items) as item;

  -- NEW: one 'sale' inventory_movements row per line item, now that the
  -- real order number exists to use as reference_number. created_by is
  -- left NULL — this is a customer-driven movement, not an admin action.
  insert into inventory_movements (
    product_id, variant_id, sku, movement_type, quantity_change,
    previous_quantity, new_quantity, reason, reference_number, created_by
  )
  select
    (item->>'product_id')::uuid,
    (item->>'variant_id')::uuid,
    item->>'sku',
    'sale',
    -(item->>'quantity')::integer,
    (item->>'new_stock')::integer + (item->>'quantity')::integer,
    (item->>'new_stock')::integer,
    'Customer order',
    v_order_number,
    null
  from jsonb_array_elements(v_order_items) as item;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_cost', v_shipping_cost,
    'total', v_total
  );
end;
$$;

revoke execute on function create_order(jsonb, text, jsonb, text) from public;
revoke execute on function create_order(jsonb, text, jsonb, text) from anon;
grant execute on function create_order(jsonb, text, jsonb, text) to authenticated;
