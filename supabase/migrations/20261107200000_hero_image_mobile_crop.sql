-- Optional per-slide mobile image for the homepage hero carousel
-- (hero_images, see 20261107190000_hero_carousel_images.sql). When set, the
-- Classic Split layout's mobile strip (Admin → Layout → "Show hero photo on
-- mobile") shows this image cropped to fill the frame instead of the main
-- image letterboxed to fit it uncropped.

alter table hero_images add column mobile_image_url text;
