-- ZOQ's Gallery — general schedulable Sale offer (e.g. "11.11")
--
-- Adds a second admin-managed, no-promo-code discount alongside the
-- existing Blessed Friday offer (Blessed Friday is NOT removed or changed
-- in behavior — see 20261016000000_blessed_friday_offer.sql). Same
-- site_settings key/value shape as Blessed Friday, plus an optional
-- startDate/endDate window so an admin can schedule a date range (e.g.
-- Nov 11-12) in advance and flip `enabled` on/off anytime without the sale
-- ever running outside that window — see SaleOfferForm.
--
-- Priority when both could apply: the Sale overrides Blessed Friday
-- outright whenever it's currently active (enabled AND inside its date
-- window, if one is set) — Blessed Friday's own discount is not even
-- computed in that case, never compared by amount. Whichever of the two
-- "wins" then never stacks with an entered promo code either — the
-- customer gets whichever discount is larger, the same rule Blessed
-- Friday already followed against promo codes.

insert into site_settings (key, value, description)
values (
  'sale_offer',
  '{
    "enabled": false,
    "name": "",
    "discountPercentage": 10,
    "minSpend": 0,
    "startDate": null,
    "endDate": null
  }'::jsonb,
  'General automatic sale (no promo code), e.g. 11.11 — optionally scheduled to a date range; overrides the Blessed Friday offer whenever active.'
)
on conflict (key) do nothing;

-- Recorded purely for admin audit/reporting — distinguishes an order whose
-- discount_amount came from the Sale from one that came from Blessed
-- Friday or a promo code, without touching any existing column's meaning.
alter table orders add column sale_discount_applied boolean not null default false;

-- ============================================================================
-- create_order() — every line unchanged from
-- 20261029000000_configurable_free_shipping_offers.sql except the new
-- declared variables, the Sale computation block, the Sale-overrides-
-- Blessed-Friday suspension, the shipping-cost case's "offers" condition,
-- and the new sale_discount_applied column in the insert/return.
-- ============================================================================
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
  v_free_shipping_enabled_normal boolean;
  v_free_shipping_enabled_offers boolean;
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
  v_bf_offer jsonb;
  v_bf_enabled boolean;
  v_bf_discount_percentage integer;
  v_bf_min_spend integer;
  v_bf_discount_amount integer := 0;
  v_blessed_friday_applied boolean := false;
  -- General Sale offer (e.g. "11.11") — overrides Blessed Friday outright
  -- whenever active. See file header.
  v_sale_offer jsonb;
  v_sale_enabled boolean;
  v_sale_discount_percentage integer;
  v_sale_min_spend integer;
  v_sale_start_date date;
  v_sale_end_date date;
  v_sale_active boolean;
  v_sale_discount_amount integer := 0;
  v_sale_applied boolean := false;
  v_today date;
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

  -- province intentionally not required here (see
  -- 20261024000000_make_checkout_province_optional.sql).
  if coalesce(trim(p_shipping->>'full_name'), '') = ''
    or coalesce(trim(p_shipping->>'email'), '') = ''
    or coalesce(trim(p_shipping->>'phone'), '') = ''
    or coalesce(trim(p_shipping->>'address_line_1'), '') = ''
    or coalesce(trim(p_shipping->>'city'), '') = ''
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

    v_discount_amount := least(v_discount_amount, v_subtotal);
  end if;

  select value into v_bf_offer from site_settings where key = 'blessed_friday_offer';
  v_bf_enabled := coalesce((v_bf_offer->>'enabled')::boolean, false);
  v_bf_discount_percentage := coalesce((v_bf_offer->>'discountPercentage')::integer, 0);
  v_bf_min_spend := coalesce((v_bf_offer->>'minSpend')::integer, 0);

  if v_bf_enabled and v_subtotal >= v_bf_min_spend then
    v_bf_discount_amount := least(
      floor(v_subtotal * v_bf_discount_percentage / 100.0)::integer,
      v_subtotal
    );
  end if;

  -- ==========================================================================
  -- General Sale offer — same shape as Blessed Friday, plus an optional
  -- [startDate, endDate] window (Asia/Karachi calendar day, matching the
  -- storefront's own locale). Overrides Blessed Friday outright whenever
  -- it's active: Blessed Friday's own discount is zeroed below, never
  -- compared by amount.
  -- ==========================================================================
  select value into v_sale_offer from site_settings where key = 'sale_offer';
  v_sale_enabled := coalesce((v_sale_offer->>'enabled')::boolean, false);
  v_sale_discount_percentage := coalesce((v_sale_offer->>'discountPercentage')::integer, 0);
  v_sale_min_spend := coalesce((v_sale_offer->>'minSpend')::integer, 0);
  v_sale_start_date := nullif(v_sale_offer->>'startDate', '')::date;
  v_sale_end_date := nullif(v_sale_offer->>'endDate', '')::date;
  v_today := (now() at time zone 'Asia/Karachi')::date;

  v_sale_active := v_sale_enabled
    and (v_sale_start_date is null or v_today >= v_sale_start_date)
    and (v_sale_end_date is null or v_today <= v_sale_end_date);

  if v_sale_active and v_subtotal >= v_sale_min_spend then
    v_sale_discount_amount := least(
      floor(v_subtotal * v_sale_discount_percentage / 100.0)::integer,
      v_subtotal
    );
  end if;

  if v_sale_active then
    v_bf_discount_amount := 0;
  end if;

  if v_bf_discount_amount > v_discount_amount then
    v_discount_amount := v_bf_discount_amount;
    v_blessed_friday_applied := true;
  end if;

  if v_sale_discount_amount > v_discount_amount then
    v_discount_amount := v_sale_discount_amount;
    v_sale_applied := true;
  end if;

  select (value #>> '{}')::integer into v_free_shipping_threshold
    from site_settings where key = 'free_shipping_threshold';
  select (value #>> '{}')::integer into v_flat_shipping_cost
    from site_settings where key = 'flat_shipping_cost';
  v_free_shipping_threshold := coalesce(v_free_shipping_threshold, 3000);
  v_flat_shipping_cost := coalesce(v_flat_shipping_cost, 250);

  select (value #>> '{}')::boolean into v_free_shipping_enabled_normal
    from site_settings where key = 'free_shipping_enabled_normal_orders';
  select (value #>> '{}')::boolean into v_free_shipping_enabled_offers
    from site_settings where key = 'free_shipping_enabled_offers';
  v_free_shipping_enabled_normal := coalesce(v_free_shipping_enabled_normal, true);
  v_free_shipping_enabled_offers := coalesce(v_free_shipping_enabled_offers, true);

  -- Which toggle governs the free-shipping-above-threshold perk depends on
  -- whether an offer is in play: the Sale being active, Blessed Friday
  -- being enabled store-wide, or this order having redeemed a promo code
  -- (v_promo_id is not null — set as soon as a valid code is found above,
  -- regardless of whether its own discount ends up being the one actually
  -- charged).
  v_shipping_cost := case
    when (v_sale_active or v_bf_enabled or v_promo_id is not null) then
      case
        when v_free_shipping_enabled_offers
          and (v_subtotal - v_discount_amount) >= v_free_shipping_threshold
        then 0
        else v_flat_shipping_cost
      end
    else
      case
        when v_free_shipping_enabled_normal
          and (v_subtotal - v_discount_amount) >= v_free_shipping_threshold
        then 0
        else v_flat_shipping_cost
      end
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
    promo_code, promo_code_id, discount_type, discount_value, discount_amount,
    blessed_friday_discount_applied, sale_discount_applied
  ) values (
    v_order_number, v_user_id, v_guest_token, p_payment_method, v_subtotal, v_shipping_cost, v_total,
    trim(p_shipping->>'full_name'), trim(p_shipping->>'email'), trim(p_shipping->>'phone'),
    trim(p_shipping->>'address_line_1'),
    nullif(trim(coalesce(p_shipping->>'address_line_2', '')), ''),
    trim(p_shipping->>'city'), coalesce(trim(p_shipping->>'province'), ''),
    nullif(trim(coalesce(p_shipping->>'postal_code', '')), ''),
    coalesce(nullif(trim(coalesce(p_shipping->>'country', '')), ''), 'Pakistan'),
    nullif(trim(coalesce(p_customer_notes, '')), ''),
    v_promo_code, v_promo_id, v_promo_discount_type, v_promo_discount_value, v_discount_amount,
    v_blessed_friday_applied, v_sale_applied
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
    'blessed_friday_discount_applied', v_blessed_friday_applied,
    'sale_discount_applied', v_sale_applied,
    'total', v_total,
    'guest_token', v_guest_token
  );
end;
$$;

grant execute on function create_order(jsonb, text, jsonb, text, text) to authenticated, anon;
revoke execute on function create_order(jsonb, text, jsonb, text, text) from public;
