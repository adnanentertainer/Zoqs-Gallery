-- ZOQ's Gallery — manual WhatsApp confirmation for Cash on Delivery orders
-- COD is the main vector for prank/fake orders (no payment commitment from
-- the customer). This adds a timestamp the admin sets after the customer
-- has replied "yes" to a WhatsApp confirmation message, and a hard DB
-- constraint that blocks a COD order from moving past "pending" until that
-- happens — mirroring the existing column-level GRANT pattern used to lock
-- down what admins can write on this table (see the Phase 10 migration).
alter table orders
  add column whatsapp_confirmed_at timestamptz;

grant update (whatsapp_confirmed_at) on orders to authenticated;

alter table orders
  add constraint orders_cod_requires_whatsapp_confirmation
  check (
    payment_method <> 'cod'
    or status not in ('confirmed', 'processing', 'shipped', 'delivered')
    or whatsapp_confirmed_at is not null
  );
