-- Remove decorative emoji from product descriptions/short descriptions.
-- The storefront is positioned as "premium" but product copy was full of
-- inline emoji (✨🖤👑 etc.) from the content-generation workflow, which read
-- as off-brand. This strips emoji/symbol code points and normalizes the
-- whitespace left behind, without altering wording or line structure.
update products
set
  description = btrim(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          description,
          '[‍️☀-➿⬀-⯿\U0001F000-\U0001FFFF]', '', 'g'
        ),
        '[ \t]+', ' ', 'g'
      ),
      '[ \t]*\n[ \t]*', E'\n', 'g'
    )
  ),
  short_description = case
    when short_description is null then null
    else btrim(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            short_description,
            '[‍️☀-➿⬀-⯿\U0001F000-\U0001FFFF]', '', 'g'
          ),
          '[ \t]+', ' ', 'g'
        ),
        '[ \t]*\n[ \t]*', E'\n', 'g'
      )
    )
  end
where description ~ '[☀-➿\U0001F000-\U0001FFFF]'
   or (short_description is not null and short_description ~ '[☀-➿\U0001F000-\U0001FFFF]');
