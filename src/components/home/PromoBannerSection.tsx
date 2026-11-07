import { getActivePromoBanners } from "@/lib/services/promoBannerService";
import { getActiveLayoutTemplate } from "@/lib/services/layoutTemplateService";
import { PromoBannerCarousel } from "@/components/home/PromoBannerCarousel";

export async function PromoBannerSection() {
  const [banners, layoutTemplate] = await Promise.all([
    getActivePromoBanners(),
    getActiveLayoutTemplate(),
  ]);
  if (banners.length === 0) return null;

  return (
    <PromoBannerCarousel banners={banners} layout={layoutTemplate.promoBanner} />
  );
}
