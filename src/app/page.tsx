import type { Metadata } from "next";
import { PromoBannerSection } from "@/components/home/PromoBannerSection";
import { HeroSection } from "@/components/home/HeroSection";
import { WeddingBanner } from "@/components/home/WeddingBanner";
import { CategorySection } from "@/components/home/CategorySection";
import { ProductSection } from "@/components/home/ProductSection";
import { BridalSection } from "@/components/home/BridalSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { SocialGallery } from "@/components/home/SocialGallery";
import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";
import { getCategories } from "@/lib/services/categoryService";
import {
  getBestSellers,
  getNewArrivals,
  getWeddingPicks,
} from "@/lib/services/productService";
import { getSocialPosts } from "@/lib/services/socialPostService";
import { getActiveHeroImage } from "@/lib/services/promoCodeService";
import { getSiteSetting } from "@/lib/services/settingsService";
import { getWeddingPromotionSettings } from "@/lib/services/weddingPromotionService";

export const metadata: Metadata = {
  title: "ZOQ's Gallery | Premium Artificial Jewellery in Pakistan",
  description:
    "Discover elegant artificial jewellery, bridal collections and fashion accessories at ZOQ's Gallery. Premium styles for every occasion in Pakistan.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const [
    categories,
    newArrivals,
    bestSellers,
    socialPosts,
    activeHeroImage,
    defaultHeroImage,
    weddingPromotion,
    weddingPicks,
  ] = await Promise.all([
    getCategories(),
    getNewArrivals(),
    getBestSellers(),
    getSocialPosts(),
    getActiveHeroImage(),
    getSiteSetting<string>("default_hero_image"),
    getWeddingPromotionSettings(),
    getWeddingPicks(),
  ]);

  const showWeddingPromotion =
    weddingPromotion.enabled && weddingPicks.length > 0;

  return (
    <>
      <WhatsAppFloatingButton ariaLabel="Chat with ZOQ's Gallery on WhatsApp" />
      <PromoBannerSection />
      <HeroSection
        imageUrl={activeHeroImage?.imageUrl || defaultHeroImage || undefined}
        imageAlt={activeHeroImage?.imageAlt}
      />
      {showWeddingPromotion && (
        <>
          <WeddingBanner
            imageUrl={weddingPromotion.imageUrl || undefined}
            heading={weddingPromotion.bannerHeading || undefined}
            subtext={weddingPromotion.bannerSubtext || undefined}
            buttonLabel={weddingPromotion.bannerButtonLabel || undefined}
          />
          <ProductSection
            id="wedding-collection"
            title="Wedding Season Favourites"
            subtitle="Hand-picked jewellery for your wedding celebrations"
            products={weddingPicks.slice(0, 8)}
            viewAllLabel="View Wedding Collection"
            viewAllHref="/wedding-collection"
            background="cream"
          />
        </>
      )}
      <CategorySection categories={categories} />
      <ProductSection
        id="new-arrivals"
        title="New Arrivals"
        subtitle="Fresh styles, just added to the collection."
        products={newArrivals}
        viewAllLabel="View All New Arrivals"
        viewAllHref="/new-arrivals"
      />
      <ProductSection
        title="Best Sellers"
        subtitle="Loved and worn again and again by ZOQ's Gallery customers."
        products={bestSellers}
        viewAllLabel="View All Best Sellers"
        viewAllHref="/best-sellers"
        background="cream"
      />
      <BridalSection />
      <BenefitsSection />
      <ReviewsSection />
      <NewsletterSection />
      <SocialGallery posts={socialPosts} />
    </>
  );
}
