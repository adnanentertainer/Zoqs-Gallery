import type { Metadata } from "next";
import { PromoBannerSection } from "@/components/home/PromoBannerSection";
import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { ProductSection } from "@/components/home/ProductSection";
import { BridalSection } from "@/components/home/BridalSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { SocialGallery } from "@/components/home/SocialGallery";
import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";
import { getCategories } from "@/lib/services/categoryService";
import { getBestSellers, getNewArrivals } from "@/lib/services/productService";
import { getSocialPosts } from "@/lib/services/socialPostService";
import { getActiveHeroImage } from "@/lib/services/promoCodeService";
import { getSiteSetting } from "@/lib/services/settingsService";

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
  ] = await Promise.all([
    getCategories(),
    getNewArrivals(),
    getBestSellers(),
    getSocialPosts(),
    getActiveHeroImage(),
    getSiteSetting<string>("default_hero_image"),
  ]);

  return (
    <>
      <WhatsAppFloatingButton ariaLabel="Chat with ZOQ's Gallery on WhatsApp" />
      <PromoBannerSection />
      <HeroSection
        imageUrl={activeHeroImage?.imageUrl || defaultHeroImage || undefined}
        imageAlt={activeHeroImage?.imageAlt}
      />
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
