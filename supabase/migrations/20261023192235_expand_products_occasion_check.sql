-- Reconciliation: applied directly to production (2026-10-23), never
-- committed to this repo — see 20261023184150's header for context.
alter table products drop constraint products_occasion_check;
alter table products add constraint products_occasion_check
  check (
    occasion is null or occasion = any (array[
      'Everyday', 'Party', 'Wedding', 'Bridal', 'Festive', 'Gift',
      'Engagement', 'Mehndi', 'Valima', 'Eid', 'Anniversary', 'Formal',
      'Casual', 'Office Wear'
    ])
  );
