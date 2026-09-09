-- ZOQ's Gallery — Phase 9: Checkout & Order Creation
-- Orders + order items, with RLS locked to "read your own rows only" and all
-- writes routed exclusively through the create_order() SECURITY DEFINER RPC
-- below — no insert/update/delete policy exists for either table, so neither
-- the anon nor the authenticated PostgREST role can write to them directly,
-- matching the write-lockdown convention from the Phase 7 schema.

-- ============================================================================
-- orders
-- ============================================================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
  ),
  payment_method text not null check (payment_method in ('cod', 'bank_transfer')),
  payment_status text not null default 'pending' check (
    payment_status in ('pending', 'paid', 'failed', 'refunded')
  ),
  -- Whole-PKR-rupee integers throughout — no floating point money, matching
  -- the products.price convention from the Phase 7 schema.
  subtotal integer not null check (subtotal >= 0),
  shipping_cost integer not null check (shipping_cost >= 0),
  total integer not null check (total >= 0),
  currency text not null default 'PKR',
  shipping_full_name text not null,
  shipping_email text not null,
  shipping_phone text not null,
  shipping_address_line_1 text not null,
  shipping_address_line_2 text,
  shipping_city text not null,
  shipping_province text not null,
  shipping_postal_code text not null,
  shipping_country text not null default 'Pakistan',
  customer_notes text check (customer_notes is null or length(customer_notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- order_number already has an implicit index via the UNIQUE constraint above.
create index idx_orders_user_id on orders(user_id);
create index idx_orders_status on orders(status);
create index idx_orders_created_at on orders(created_at);

create trigger trg_orders_updated_at
before update on orders
for each row execute function set_updated_at();

-- ============================================================================
-- order_items
-- ============================================================================
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  -- Nullable + ON DELETE SET NULL: an order must remain historically
  -- accurate even if the product/variant it referenced is later deleted, so
  -- the FK is for referential convenience only — every fact needed to
  -- display the order is snapshotted in the columns below, never re-read
  -- from products/product_variants after purchase.
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name text not null,
  variant_name text,
  product_price integer not null check (product_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total integer not null check (line_total >= 0),
  product_image_url text,
  created_at timestamptz not null default now()
);

create index idx_order_items_order_id on order_items(order_id);
create index idx_order_items_product_id on order_items(product_id);

-- ============================================================================
-- Row Level Security — customers can read only their own orders/items.
-- No insert/update/delete policies: all writes happen inside create_order().
-- ============================================================================
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Users can read own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can read own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- ============================================================================
-- create_order() — the only way orders/order_items ever get written.
--
-- SECURITY DEFINER lets this function bypass RLS internally (it needs to
-- read all active products/variants regardless of the caller's own rows,
-- and insert into orders/order_items which have no INSERT policy at all),
-- while still being safe to expose to authenticated clients because:
--   1. It explicitly checks auth.uid() itself — RLS bypass does not mean
--      auth bypass, since auth.uid() reads the caller's JWT claims, which
--      SECURITY DEFINER does not change.
--   2. `set search_path = public` pins name resolution, preventing a
--      search_path-hijacking attack from a malicious schema.
--   3. It never trusts client-supplied prices, totals, shipping cost, order
--      status, or payment status — every one of those is computed or
--      defaulted inside this function from current database state.
--   4. EXECUTE is granted only to `authenticated`, never `anon`.
--
-- The caller (src/app/checkout/actions.ts) uses the normal cookie-scoped
-- anon-key client — never the service_role key — so RLS still applies to
-- every other query that client makes; only this one function is elevated,
-- and only for the duration of its own execution.
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
  v_selected_variants jsonb;
  v_variant_key text;
  v_variant_value text;
  v_variant_id uuid;
  v_variant_name text;
  v_variant_price_adjustment integer;
  v_variant_stock integer;
  v_variant_is_active boolean;
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
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '28000';
  end if;

  if p_payment_method not in ('cod', 'bank_transfer') then
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

  -- One pass: validate each line against current product/variant state,
  -- decrement stock, and accumulate the snapshot payload + subtotal. Any
  -- exception raised here aborts the whole implicit transaction, so no
  -- partial order or partial stock decrement can ever persist.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity is null or v_quantity < 1 then
      raise exception 'Invalid quantity.' using errcode = '22023';
    end if;

    select p.id, p.name, p.price, p.stock, p.is_active,
           (select pi.image_url from product_images pi
             where pi.product_id = p.id
             order by pi.display_order limit 1)
      into v_product_id, v_product_name, v_product_price, v_product_stock,
           v_product_is_active, v_product_image_url
      from products p
      where p.slug = v_item->>'product_slug';

    if not found or v_product_is_active is not true then
      raise exception 'One or more products in your cart are no longer available.'
        using errcode = 'P0001';
    end if;

    v_unit_price := v_product_price;
    v_variant_id := null;
    v_variant_name := null;
    v_selected_variants := v_item->'selected_variants';

    if v_selected_variants is not null and jsonb_typeof(v_selected_variants) = 'object' then
      for v_variant_key, v_variant_value in select * from jsonb_each_text(v_selected_variants)
      loop
        select pv.id, pv.option_value, pv.price_adjustment, pv.stock, pv.is_active
          into v_variant_id, v_variant_name, v_variant_price_adjustment,
               v_variant_stock, v_variant_is_active
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

    v_order_items := v_order_items || jsonb_build_object(
      'product_id', v_product_id,
      'variant_id', v_variant_id,
      'product_name', v_product_name,
      'variant_name', v_variant_name,
      'product_price', v_unit_price,
      'quantity', v_quantity,
      'line_total', v_line_total,
      'product_image_url', v_product_image_url
    );

    -- Atomic decrement: the WHERE clause re-checks stock at write time
    -- (closing the gap between the read above and this write), so a
    -- concurrent order for the same last unit can't oversell.
    if v_variant_id is not null and v_variant_stock is not null then
      update product_variants set stock = stock - v_quantity
        where id = v_variant_id and stock >= v_quantity;
      if not found then
        raise exception 'Insufficient stock for %.', v_product_name using errcode = 'P0001';
      end if;
    elsif v_variant_id is null then
      update products set stock = stock - v_quantity
        where id = v_product_id and stock >= v_quantity;
      if not found then
        raise exception 'Insufficient stock for %.', v_product_name using errcode = 'P0001';
      end if;
    end if;
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

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_cost', v_shipping_cost,
    'total', v_total
  );
end;
$$;

-- Supabase's default privileges grant EXECUTE directly to anon/authenticated
-- (not merely via PUBLIC) when a function is created, so PUBLIC alone isn't
-- enough here — anon's direct grant must be revoked explicitly too, or an
-- unauthenticated caller can still invoke this function (it would still be
-- safely rejected by the auth.uid() check inside, but the point of this
-- block is to reject it at the permission layer, before the function body
-- ever runs).
revoke execute on function create_order(jsonb, text, jsonb, text) from public;
revoke execute on function create_order(jsonb, text, jsonb, text) from anon;
grant execute on function create_order(jsonb, text, jsonb, text) to authenticated;
