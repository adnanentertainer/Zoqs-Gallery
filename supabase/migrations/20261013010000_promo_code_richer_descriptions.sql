-- ZOQ's Gallery — richer "why" text for the Pakistan festival/sale promo
-- codes seeded in 20261013000000_scheduled_promo_codes.sql.
--
-- The original descriptions were a bare event label (e.g. "11.11 sale").
-- These updates explain, for each code: what the occasion is, why its
-- discount depth was set where it was, and why its date window is shaped
-- the way it is (moon-sighting buffer, year-end clearance, etc.) — so
-- /admin/promo-codes tells the actual story behind the schedule, not just
-- the name of it.

update promo_codes set description =
  '11.11 Global Shopping Festival. Not a Pakistani occasion, but widely '
  || 'adopted by local e-commerce (Daraz etc.), so shoppers now expect a '
  || 'sale on this date regardless. 10% keeps margin healthy while still '
  || 'matching that expectation.'
  where code = 'ZOQ1111';

update promo_codes set description =
  'Black Friday (Nov 27) through Cyber Monday (Nov 30). The single '
  || 'biggest global online-shopping weekend of the year — set deeper '
  || '(15%) than 11.11/12.12 since price-comparison intent peaks here.'
  where code = 'BLACKFRIDAY26';

update promo_codes set description =
  '12.12 sale, the second of the back-to-back Nov/Dec shopping-festival '
  || 'dates. Kept a notch below Black Friday (12% vs 15%) so customers '
  || 'aren''t trained to always wait for the deepest sale.'
  where code = 'ZOQ1212';

update promo_codes set description =
  'Quaid-e-Azam Day (national holiday honouring Pakistan''s founder) '
  || 'plus Christmas, extended through Dec 31 as a year-end clearance '
  || 'window — a quieter, steady 10% rather than a flash-sale discount.'
  where code = 'DEC25';

update promo_codes set description =
  'New Year. A short 3-day window right after the Dec 25 sale ends, to '
  || 'catch fresh-year gifting/self-purchase intent without overlapping '
  || 'it.'
  where code = 'NEWYEAR27';

update promo_codes set description =
  'Pre-Ramadan stock-up sale. Ramadan''s actual start (~Feb 8-9, 2027) is '
  || 'confirmed only by moon-sighting, so this window opens Feb 1 to '
  || 'cover shoppers buying ahead of the fasting month regardless of the '
  || 'exact confirmed date — shopping behaviour shifts before Ramadan '
  || 'starts, not on the day itself.'
  where code = 'RAMADAN27';

update promo_codes set description =
  'Valentine''s Day. Not a religious or national occasion, but a major '
  || 'gifting day in urban Pakistan. Min. order kept low (Rs. 1,000) '
  || 'since Valentine''s gifts tend to be lower-ticket than bridal pieces.'
  where code = 'LOVE27';

update promo_codes set description =
  'Eid-ul-Fitr — the single biggest shopping occasion on the Pakistani '
  || 'calendar (new clothes/jewellery is a strong cultural tradition). '
  || 'Deepest discount of the year (20%) and the window opens 5 days '
  || 'early (Mar 5) to capture the pre-Eid shopping rush ahead of the '
  || 'moon-sighting-confirmed date (~Mar 10-12).'
  where code = 'EIDFITR27';

update promo_codes set description =
  'Pakistan Day (Mar 23) — national/patriotic holiday. Moderate 14% '
  || 'discount with a patriotic-green marketing angle rather than a deep '
  || 'clearance push.'
  where code = 'PAKDAY27';

update promo_codes set description =
  'Mother''s Day (2nd Sunday of May). Not a Pakistani public holiday, '
  || 'but commercially significant gifting day in urban markets — 15% '
  || 'with a low min. order to suit smaller gift purchases.'
  where code = 'MOM27';

update promo_codes set description =
  'Eid-ul-Adha — the second major Islamic festival. Set slightly below '
  || 'Eid-ul-Fitr (18% vs 20%) since clothing/jewellery gifting demand '
  || 'historically runs a bit lower than Eid-ul-Fitr, though it''s still '
  || 'one of the year''s biggest sale windows.'
  where code = 'EIDADHA27';

update promo_codes set description =
  'Father''s Day (3rd Sunday of June). Mirrors Mother''s Day in '
  || 'positioning and discount depth — a gifting occasion, not a public '
  || 'holiday.'
  where code = 'DAD27';

update promo_codes set description =
  'Independence Day (Aug 14) — national holiday. 14% discount with a '
  || 'patriotic-green theme, matched to Pakistan Day''s positioning '
  || 'rather than treated as a deep clearance event.'
  where code = 'AZADI27';
