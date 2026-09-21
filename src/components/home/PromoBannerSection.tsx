import { getActivePromoBanners } from "@/lib/services/promoBannerService";
import { PromoBannerCarousel } from "@/components/home/PromoBannerCarousel";

export async function PromoBannerSection() {
  const banners = await getActivePromoBanners();
  if (banners.length === 0) return null;

  return <PromoBannerCarousel banners={banners} />;
}
