-- Free shipping threshold was being compared against the pre-discount
-- subtotal, so an order that only crossed Rs. 3,000 before a promo code was
-- applied still got free shipping even though the amount actually being
-- charged for goods fell back below the threshold. Compare against
-- (subtotal - discount_amount) instead — the only line changed from the
-- create_order() version in 20260921000000_promo_codes_and_banners.sql.
create or replace function create_order(
  p_items jsonb,
  p_payment_method text,
  p_shipping jsonb,
  p_customer_notes text default null,
  p_promo_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_guest_token uuid;
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
  v_movement_new_stock integer;
  v_customer_email text;
  v_promo_code_normalized text;
  v_promo_id uuid;
  v_promo_code text;
  v_promo_discount_type text;
  v_promo_discount_value integer;
  v_promo_min_order_amount integer;
  v_promo_max_discount_amount integer;
  v_promo_starts_at timestamptz;
  v_promo_expires_at timestamptz;
  v_promo_usage_limit integer;
  v_promo_usage_limit_per_customer integer;
  v_promo_usage_count integer;
  v_promo_is_active boolean;
  v_discount_amount integer := 0;
  v_per_customer_count integer;
begin
  if v_user_id is null then
    v_guest_token := gen_random_uuid();
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
  then
    raise exception 'Shipping information is incomplete.' using errcode = '22023';
  end if;

  if length(coalesce(p_customer_notes, '')) > 500 then
    raise exception 'Customer notes are too long.' using errcode = '22023';
  end if;

  v_customer_email := trim(p_shipping->>'email');

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
    v_variant_stock := null;
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

    if (v_variant_id is null or v_variant_stock is null) and v_product_stock < v_quantity then
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
    else
      update products set stock = stock - v_quantity
        where id = v_product_id and stock >= v_quantity
        returning stock into v_movement_new_stock;
      if not found then
        raise exception 'Insufficient stock for %.', v_product_name using errcode = 'P0001';
      end if;
    end if;

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

  -- ==========================================================================
  -- Promo code redemption — runs only if a code was supplied. `for update`
  -- locks the promo_codes row for the rest of this transaction, so two
  -- concurrent orders racing against the same near-exhausted usage_limit
  -- serialize here instead of both reading a stale usage_count.
  -- ==========================================================================
  if coalesce(trim(p_promo_code), '') <> '' then
    v_promo_code_normalized := upper(trim(p_promo_code));

    select id, code, discount_type, discount_value, min_order_amount,
           max_discount_amount, starts_at, expires_at, usage_limit,
           usage_limit_per_customer, usage_count, is_active
      into v_promo_id, v_promo_code, v_promo_discount_type, v_promo_discount_value,
           v_promo_min_order_amount, v_promo_max_discount_amount, v_promo_starts_at,
           v_promo_expires_at, v_promo_usage_limit, v_promo_usage_limit_per_customer,
           v_promo_usage_count, v_promo_is_active
      from promo_codes
      where code = v_promo_code_normalized
      for update;

    if not found or v_promo_is_active is not true then
      raise exception 'Invalid or expired promo code.' using errcode = 'P0001';
    end if;

    if v_promo_starts_at is not null and v_promo_starts_at > now() then
      raise exception 'This promo code is not active yet.' using errcode = 'P0001';
    end if;

    if v_promo_expires_at is not null and v_promo_expires_at < now() then
      raise exception 'Invalid or expired promo code.' using errcode = 'P0001';
    end if;

    if v_promo_usage_limit is not null and v_promo_usage_count >= v_promo_usage_limit then
      raise exception 'This promo code has reached its usage limit.' using errcode = 'P0001';
    end if;

    if v_promo_min_order_amount is not null and v_subtotal < v_promo_min_order_amount then
      raise exception 'Minimum order of Rs. % is required for this promo code.',
        v_promo_min_order_amount using errcode = 'P0001';
    end if;

    if v_promo_usage_limit_per_customer is not null then
      select count(*) into v_per_customer_count from promo_code_usages
        where promo_code_id = v_promo_id
          and (
            (v_user_id is not null and user_id = v_user_id)
            or (v_user_id is null and lower(customer_email) = lower(v_customer_email))
          );
      if v_per_customer_count >= v_promo_usage_limit_per_customer then
        raise exception 'You have already used this promo code the maximum number of times.'
          using errcode = 'P0001';
      end if;
    end if;

    if v_promo_discount_type = 'percentage' then
      v_discount_amount := floor(v_subtotal * v_promo_discount_value / 100.0)::integer;
      if v_promo_max_discount_amount is not null then
        v_discount_amount := least(v_discount_amount, v_promo_max_discount_amount);
      end if;
    else
      v_discount_amount := v_promo_discount_value;
    end if;

    -- Never let a discount exceed the order it's applied to — the hard
    -- backstop against a negative total, on top of the DB check constraint.
    v_discount_amount := least(v_discount_amount, v_subtotal);
  end if;

  select (value #>> '{}')::integer into v_free_shipping_threshold
    from site_settings where key = 'free_shipping_threshold';
  select (value #>> '{}')::integer into v_flat_shipping_cost
    from site_settings where key = 'flat_shipping_cost';
  v_free_shipping_threshold := coalesce(v_free_shipping_threshold, 3000);
  v_flat_shipping_cost := coalesce(v_flat_shipping_cost, 250);

  -- Compared against the post-discount amount, not the raw subtotal — see
  -- the file header comment.
  v_shipping_cost := case
    when (v_subtotal - v_discount_amount) >= v_free_shipping_threshold then 0
    else v_flat_shipping_cost
  end;
  v_total := v_subtotal - v_discount_amount + v_shipping_cost;

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
    order_number, user_id, guest_token, payment_method, subtotal, shipping_cost, total,
    shipping_full_name, shipping_email, shipping_phone,
    shipping_address_line_1, shipping_address_line_2, shipping_city,
    shipping_province, shipping_postal_code, shipping_country, customer_notes,
    promo_code, promo_code_id, discount_type, discount_value, discount_amount
  ) values (
    v_order_number, v_user_id, v_guest_token, p_payment_method, v_subtotal, v_shipping_cost, v_total,
    trim(p_shipping->>'full_name'), trim(p_shipping->>'email'), trim(p_shipping->>'phone'),
    trim(p_shipping->>'address_line_1'),
    nullif(trim(coalesce(p_shipping->>'address_line_2', '')), ''),
    trim(p_shipping->>'city'), trim(p_shipping->>'province'),
    nullif(trim(coalesce(p_shipping->>'postal_code', '')), ''),
    coalesce(nullif(trim(coalesce(p_shipping->>'country', '')), ''), 'Pakistan'),
    nullif(trim(coalesce(p_customer_notes, '')), ''),
    v_promo_code, v_promo_id, v_promo_discount_type, v_promo_discount_value, v_discount_amount
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

  -- Usage is only ever counted for an order that actually committed — this
  -- runs after both inserts above succeed, never on a mere validation pass
  -- (see validate_promo_code() below, which never writes anything).
  if v_promo_id is not null then
    update promo_codes set usage_count = usage_count + 1 where id = v_promo_id;

    insert into promo_code_usages (
      promo_code_id, order_id, user_id, customer_email, discount_amount
    ) values (
      v_promo_id, v_order_id, v_user_id, v_customer_email, v_discount_amount
    );
  end if;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_cost', v_shipping_cost,
    'discount_amount', v_discount_amount,
    'promo_code', v_promo_code,
    'total', v_total,
    'guest_token', v_guest_token
  );
end;
$$;
