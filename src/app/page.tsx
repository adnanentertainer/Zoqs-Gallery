import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { ProductSection } from "@/components/home/ProductSection";
import { PromotionalBanner } from "@/components/home/PromotionalBanner";
import { BridalSection } from "@/components/home/BridalSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { SocialGallery } from "@/components/home/SocialGallery";
import { getCategories } from "@/lib/services/categoryService";
import { getBestSellers, getNewArrivals } from "@/lib/services/productService";
import { promoBannerImage } from "@/constants/images";

export const metadata: Metadata = {
  title: "ZOQ's Gallery | Premium Artificial Jewellery in Pakistan",
  description:
    "Discover elegant artificial jewellery, bridal collections and fashion accessories at ZOQ's Gallery. Premium styles for every occasion in Pakistan.",
};

export default async function Home() {
  const [categories, newArrivals, bestSellers] = await Promise.all([
    getCategories(),
    getNewArrivals(),
    getBestSellers(),
  ]);

  return (
    <>
      <HeroSection />
      <CategorySection categories={categories} />
      <ProductSection
        id="new-arrivals"
        title="New Arrivals"
        subtitle="Fresh styles, just added to the collection."
        products={newArrivals}
        viewAllLabel="View All New Arrivals"
        viewAllHref="/shop?special=new"
      />
      <PromotionalBanner
        title="The Everyday Elegance Collection"
        description="Timeless pieces designed to add a touch of beauty to your everyday style."
        ctaLabel="Explore Collection"
        ctaHref="/shop"
        image={promoBannerImage}
        imageAlt="Model styled in a delicate gold pendant necklace"
      />
      <ProductSection
        title="Best Sellers"
        subtitle="Loved and worn again and again by ZOQ's Gallery customers."
        products={bestSellers}
        viewAllLabel="View All Best Sellers"
        viewAllHref="/shop?special=best-seller"
        background="cream"
      />
      <BridalSection />
      <BenefitsSection />
      <ReviewsSection />
      <NewsletterSection />
      <SocialGallery />
    </>
  );
}
