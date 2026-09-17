-- Public order tracking: lets any visitor look up an order's status using
-- the order number plus the email or phone number on file, without needing
-- an account or the one-time guest_token from the confirmation URL. Unlike
-- get_guest_order() (guest_token-only, guest orders only), this also works
-- for orders placed by a logged-in customer, since the whole point is "I
-- have my order number and my contact info" as the proof of ownership.
create or replace function get_order_for_tracking(p_order_number text, p_contact text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_order orders%rowtype;
  v_items jsonb;
  -- Phone numbers may be stored/typed with spaces, dashes, or a country
  -- code (03XXXXXXXXX vs +923XXXXXXXXX vs 923XXXXXXXXX); comparing the last
  -- 10 digits of both sides matches all of those without needing to know
  -- which format either one used.
  v_contact_digits text := regexp_replace(coalesce(p_contact, ''), '\D', '', 'g');
begin
  select * into v_order from orders
    where upper(trim(order_number)) = upper(trim(coalesce(p_order_number, '')))
      and (
        lower(trim(shipping_email)) = lower(trim(coalesce(p_contact, '')))
        or (
          length(v_contact_digits) >= 7
          and right(regexp_replace(shipping_phone, '\D', '', 'g'), 10) = right(v_contact_digits, 10)
        )
      );

  if not found then
    return null;
  end if;

  select coalesce(jsonb_agg(to_jsonb(oi)), '[]'::jsonb) into v_items
    from order_items oi where oi.order_id = v_order.id;

  return jsonb_build_object('order', to_jsonb(v_order), 'items', v_items);
end;
$$;

grant execute on function get_order_for_tracking(text, text) to authenticated, anon;
revoke execute on function get_order_for_tracking(text, text) from public;
