-- ZOQ's Gallery — Seasonal promo-code schedule (Pakistan calendar)
--
-- Seeds the promo_codes table with a calendar of Pakistani national/
-- religious occasions and common e-commerce sale days through mid-2027.
-- Solemn observances (Ashura, Kashmir Solidarity Day, Eid Milad-un-Nabi,
-- Shab-e-Barat) are deliberately NOT given a code here — heavy discounting
-- doesn't fit local sentiment on those days.
--
-- Islamic dates are lunar and only confirmed after moon-sighting by the
-- Ruet-e-Hilal Committee, so each window below starts a day or two early and
-- ends a day or two late to absorb a ±1 day shift. All start/end are in PKT
-- (UTC+5). Every code defaults is_active = true but won't actually apply
-- outside its starts_at/expires_at window (enforced by validate_promo_code()
-- / create_order()). Adjust discount depth, min order, or dates any time via
-- /admin/promo-codes — this migration only seeds sensible defaults.
--
-- ON CONFLICT (code) DO NOTHING makes this migration safe to re-run and
-- leaves room to seed the next cycle (2027 year-end sales, 2028 Eids, etc.)
-- in a later migration without touching these rows.

insert into promo_codes
  (code, discount_type, discount_value, min_order_amount, max_discount_amount, starts_at, expires_at, is_active, description)
values
  ('ZOQ1111',       'percentage', 10, 1500, 500,  '2026-11-10 00:00:00+05', '2026-11-12 23:59:59+05', true, '11.11 sale'),
  ('BLACKFRIDAY26',  'percentage', 15, 2000, 1000, '2026-11-27 00:00:00+05', '2026-11-30 23:59:59+05', true, 'Black Friday / Cyber Monday'),
  ('ZOQ1212',       'percentage', 12, 1500, 600,  '2026-12-11 00:00:00+05', '2026-12-13 23:59:59+05', true, '12.12 sale'),
  ('DEC25',         'percentage', 10, 1500, null, '2026-12-24 00:00:00+05', '2026-12-31 23:59:59+05', true, 'Quaid-e-Azam Day / Christmas / year-end'),
  ('NEWYEAR27',     'percentage', 10, 1500, null, '2027-01-01 00:00:00+05', '2027-01-03 23:59:59+05', true, 'New Year'),
  ('RAMADAN27',     'percentage', 10, 2000, null, '2027-02-01 00:00:00+05', '2027-02-09 23:59:59+05', true, 'Pre-Ramadan stock-up sale (Ramadan expected to start ~Feb 8-9, 2027)'),
  ('LOVE27',        'percentage', 15, 1000, 800,  '2027-02-10 00:00:00+05', '2027-02-14 23:59:59+05', true, 'Valentine''s Day gifting'),
  ('EIDFITR27',     'percentage', 20, 2000, 1500, '2027-03-05 00:00:00+05', '2027-03-12 23:59:59+05', true, 'Eid-ul-Fitr (expected ~Mar 10-12, 2027 — moon-sighting dependent)'),
  ('PAKDAY27',      'percentage', 14, 1500, null, '2027-03-20 00:00:00+05', '2027-03-23 23:59:59+05', true, 'Pakistan Day'),
  ('MOM27',         'percentage', 15, 1000, null, '2027-05-06 00:00:00+05', '2027-05-09 23:59:59+05', true, 'Mother''s Day'),
  ('EIDADHA27',     'percentage', 18, 2000, 1500, '2027-05-12 00:00:00+05', '2027-05-17 23:59:59+05', true, 'Eid-ul-Adha (expected ~May 17, 2027 — moon-sighting dependent)'),
  ('DAD27',         'percentage', 15, 1000, null, '2027-06-17 00:00:00+05', '2027-06-20 23:59:59+05', true, 'Father''s Day'),
  ('AZADI27',       'percentage', 14, 1500, null, '2027-08-10 00:00:00+05', '2027-08-14 23:59:59+05', true, 'Independence Day')
on conflict (code) do nothing;
