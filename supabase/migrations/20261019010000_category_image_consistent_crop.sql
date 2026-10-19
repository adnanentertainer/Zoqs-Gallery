-- Category thumbnails on the homepage were cropped inconsistently (different
-- zoom/framing per photo) because the <Image> component relies on a plain
-- CSS object-cover over whatever aspect ratio each source photo happens to
-- be. Cloudinary already serves these, so request a subject-centered square
-- crop server-side instead, giving every category card the same framing.
update categories
set image_url = replace(
  image_url,
  '/upload/f_auto,q_auto/',
  '/upload/c_fill,ar_1:1,g_auto,w_800/f_auto,q_auto/'
)
where image_url like '%/upload/f_auto,q_auto/%';
