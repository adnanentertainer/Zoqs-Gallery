import type { Metadata } from "next";
import { Suspense } from "react";
import { PromoBannerSection } from "@/components/home/PromoBannerSection";
import { HeroSection } from "@/components/home/HeroSection";
import { WeddingBanner } from "@/components/home/WeddingBanner";
import { CategorySection } from "@/components/home/CategorySection";
import { ProductSection } from "@/components/home/ProductSection";
import { BridalSection } from "@/components/home/BridalSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { SocialGallery } from "@/components/home/SocialGallery";
import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";
import { getCategories } from "@/lib/services/categoryService";
import {
  getBestSellers,
  getNewArrivals,
  getWeddingPicks,
} from "@/lib/services/productService";
import { getSocialPosts } from "@/lib/services/socialPostService";
import { getActiveHeroImage } from "@/lib/services/promoCodeService";
import { getActiveHeroImages } from "@/lib/services/heroImageService";
import { getSiteSetting } from "@/lib/services/settingsService";
import { getWeddingPromotionSettings } from "@/lib/services/weddingPromotionService";
import { getActiveLayoutTemplate } from "@/lib/services/layoutTemplateService";
import type { HeroImage } from "@/types/heroImage";
import type { ActiveHeroImage } from "@/lib/services/promoCodeService";
import type { LayoutTemplate } from "@/types/layoutTemplate";
import type { Category, Product, SocialPost } from "@/types";
import type { WeddingPromotionSettings } from "@/types/weddingPromotion";

export const metadata: Metadata = {
  title: "ZOQ's Gallery | Premium Artificial Jewellery in Pakistan",
  description:
    "Discover elegant artificial jewellery, bridal collections and fashion accessories at ZOQ's Gallery. Premium styles for every occasion in Pakistan.",
  alternates: {
    canonical: "/",
  },
};

// Each section below Suspends independently on only the data it needs,
// instead of the whole page blocking on the single slowest of ~11
// independent Supabase-backed fetches (the previous single `Promise.all`
// architecture). All fetches still start immediately, in parallel, right
// here -- only the *awaiting* moved down into each section, so a visitor
// sees the hero (or any other already-ready section) the moment its own
// data resolves rather than waiting for everything at once.
export default function Home() {
  const categoriesPromise = getCategories();
  const newArrivalsPromise = getNewArrivals();
  const bestSellersPromise = getBestSellers();
  const socialPostsPromise = getSocialPosts();
  const activeHeroImagePromise = getActiveHeroImage();
  const heroCarouselImagesPromise = getActiveHeroImages();
  const defaultHeroImagePromise = getSiteSetting<string>("default_hero_image");
  const bridalBannerImageUrlPromise = getSiteSetting<string>(
    "bridal_banner_image",
  );
  const weddingPromotionPromise = getWeddingPromotionSettings();
  const weddingPicksPromise = getWeddingPicks();
  const layoutTemplatePromise = getActiveLayoutTemplate();

  return (
    <>
      <WhatsAppFloatingButton ariaLabel="Chat with ZOQ's Gallery on WhatsApp" />

      <Suspense fallback={null}>
        <PromoBannerSection />
      </Suspense>

      <Suspense fallback={<HeroSkeleton />}>
        <HeroResolved
          activeHeroImagePromise={activeHeroImagePromise}
          heroCarouselImagesPromise={heroCarouselImagesPromise}
          defaultHeroImagePromise={defaultHeroImagePromise}
          layoutTemplatePromise={layoutTemplatePromise}
        />
      </Suspense>

      <Suspense fallback={null}>
        <WeddingResolved
          weddingPromotionPromise={weddingPromotionPromise}
          weddingPicksPromise={weddingPicksPromise}
          layoutTemplatePromise={layoutTemplatePromise}
        />
      </Suspense>

      <Suspense fallback={<CategorySkeleton />}>
        <CategoryResolved
          categoriesPromise={categoriesPromise}
          layoutTemplatePromise={layoutTemplatePromise}
        />
      </Suspense>

      <Suspense fallback={<ProductRowSkeleton />}>
        <NewArrivalsResolved
          newArrivalsPromise={newArrivalsPromise}
          layoutTemplatePromise={layoutTemplatePromise}
        />
      </Suspense>

      <Suspense fallback={<ProductRowSkeleton />}>
        <BestSellersResolved
          bestSellersPromise={bestSellersPromise}
          layoutTemplatePromise={layoutTemplatePromise}
        />
      </Suspense>

      <Suspense fallback={<BridalSkeleton />}>
        <BridalResolved
          bridalBannerImageUrlPromise={bridalBannerImageUrlPromise}
          layoutTemplatePromise={layoutTemplatePromise}
        />
      </Suspense>

      <Suspense fallback={<BenefitsSkeleton />}>
        <BenefitsResolved layoutTemplatePromise={layoutTemplatePromise} />
      </Suspense>

      <Suspense fallback={null}>
        <ReviewsResolved layoutTemplatePromise={layoutTemplatePromise} />
      </Suspense>

      <Suspense fallback={<SocialGallerySkeleton />}>
        <SocialGalleryResolved
          socialPostsPromise={socialPostsPromise}
          layoutTemplatePromise={layoutTemplatePromise}
        />
      </Suspense>
    </>
  );
}

async function HeroResolved({
  activeHeroImagePromise,
  heroCarouselImagesPromise,
  defaultHeroImagePromise,
  layoutTemplatePromise,
}: {
  activeHeroImagePromise: Promise<ActiveHeroImage | null>;
  heroCarouselImagesPromise: Promise<HeroImage[]>;
  defaultHeroImagePromise: Promise<string | undefined>;
  layoutTemplatePromise: Promise<LayoutTemplate>;
}) {
  const [activeHeroImage, heroCarouselImages, defaultHeroImage, layoutTemplate] =
    await Promise.all([
      activeHeroImagePromise,
      heroCarouselImagesPromise,
      defaultHeroImagePromise,
      layoutTemplatePromise,
    ]);

  return (
    <HeroSection
      layout={layoutTemplate.hero}
      imageUrl={activeHeroImage?.imageUrl || defaultHeroImage || undefined}
      imageAlt={activeHeroImage?.imageAlt}
      // A scheduled promo code's own hero image is a deliberate override
      // for that promotion -- don't dilute it by cycling in the generic
      // carousel on top of it.
      images={activeHeroImage ? [] : heroCarouselImages}
      showImageOnMobile={layoutTemplate.heroShowImageOnMobile}
    />
  );
}

async function WeddingResolved({
  weddingPromotionPromise,
  weddingPicksPromise,
  layoutTemplatePromise,
}: {
  weddingPromotionPromise: Promise<WeddingPromotionSettings>;
  weddingPicksPromise: Promise<Product[]>;
  layoutTemplatePromise: Promise<LayoutTemplate>;
}) {
  const [weddingPromotion, weddingPicks, layoutTemplate] = await Promise.all([
    weddingPromotionPromise,
    weddingPicksPromise,
    layoutTemplatePromise,
  ]);

  if (!(weddingPromotion.enabled && weddingPicks.length > 0)) return null;

  return (
    <>
      <Reveal>
        <WeddingBanner
          imageUrl={weddingPromotion.imageUrl || undefined}
          heading={weddingPromotion.bannerHeading || undefined}
          subtext={weddingPromotion.bannerSubtext || undefined}
          buttonLabel={weddingPromotion.bannerButtonLabel || undefined}
        />
      </Reveal>
      <Reveal>
        <ProductSection
          id="wedding-collection"
          title="Wedding Season Favourites"
          subtitle="Hand-picked jewellery for your wedding celebrations"
          products={weddingPicks.slice(0, 8)}
          viewAllLabel="View Wedding Collection"
          viewAllHref="/wedding-collection"
          background="cream"
          layout={layoutTemplate.products}
        />
      </Reveal>
    </>
  );
}

async function CategoryResolved({
  categoriesPromise,
  layoutTemplatePromise,
}: {
  categoriesPromise: Promise<Category[]>;
  layoutTemplatePromise: Promise<LayoutTemplate>;
}) {
  const [categories, layoutTemplate] = await Promise.all([
    categoriesPromise,
    layoutTemplatePromise,
  ]);
  return (
    <Reveal>
      <CategorySection categories={categories} layout={layoutTemplate.categories} />
    </Reveal>
  );
}

async function NewArrivalsResolved({
  newArrivalsPromise,
  layoutTemplatePromise,
}: {
  newArrivalsPromise: Promise<Product[]>;
  layoutTemplatePromise: Promise<LayoutTemplate>;
}) {
  const [newArrivals, layoutTemplate] = await Promise.all([
    newArrivalsPromise,
    layoutTemplatePromise,
  ]);
  return (
    <Reveal>
      <ProductSection
        id="new-arrivals"
        title="New Arrivals"
        subtitle="Fresh styles, just added to the collection."
        products={newArrivals}
        viewAllLabel="View All New Arrivals"
        viewAllHref="/new-arrivals"
        layout={layoutTemplate.products}
      />
    </Reveal>
  );
}

async function BestSellersResolved({
  bestSellersPromise,
  layoutTemplatePromise,
}: {
  bestSellersPromise: Promise<Product[]>;
  layoutTemplatePromise: Promise<LayoutTemplate>;
}) {
  const [bestSellers, layoutTemplate] = await Promise.all([
    bestSellersPromise,
    layoutTemplatePromise,
  ]);
  return (
    <Reveal>
      <ProductSection
        title="Best Sellers"
        subtitle="Loved and worn again and again by ZOQ's Gallery customers."
        products={bestSellers}
        viewAllLabel="View All Best Sellers"
        viewAllHref="/best-sellers"
        background="cream"
        layout={layoutTemplate.products}
      />
    </Reveal>
  );
}

async function BridalResolved({
  bridalBannerImageUrlPromise,
  layoutTemplatePromise,
}: {
  bridalBannerImageUrlPromise: Promise<string | undefined>;
  layoutTemplatePromise: Promise<LayoutTemplate>;
}) {
  const [bridalBannerImageUrl, layoutTemplate] = await Promise.all([
    bridalBannerImageUrlPromise,
    layoutTemplatePromise,
  ]);
  return (
    <Reveal>
      <BridalSection
        layout={layoutTemplate.bridal}
        imageUrl={bridalBannerImageUrl || undefined}
      />
    </Reveal>
  );
}

async function BenefitsResolved({
  layoutTemplatePromise,
}: {
  layoutTemplatePromise: Promise<LayoutTemplate>;
}) {
  const layoutTemplate = await layoutTemplatePromise;
  return (
    <Reveal>
      <BenefitsSection layout={layoutTemplate.benefits} />
    </Reveal>
  );
}

async function ReviewsResolved({
  layoutTemplatePromise,
}: {
  layoutTemplatePromise: Promise<LayoutTemplate>;
}) {
  const layoutTemplate = await layoutTemplatePromise;
  return (
    <Reveal>
      <ReviewsSection layout={layoutTemplate.reviews} />
    </Reveal>
  );
}

async function SocialGalleryResolved({
  socialPostsPromise,
  layoutTemplatePromise,
}: {
  socialPostsPromise: Promise<SocialPost[]>;
  layoutTemplatePromise: Promise<LayoutTemplate>;
}) {
  const [socialPosts, layoutTemplate] = await Promise.all([
    socialPostsPromise,
    layoutTemplatePromise,
  ]);
  return (
    <Reveal>
      <SocialGallery posts={socialPosts} layout={layoutTemplate.socialGallery} />
    </Reveal>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden bg-secondary lg:min-h-[85vh]">
      <Container className="grid grid-cols-1 items-center gap-8 py-10 sm:py-14 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="order-2 hidden justify-center lg:flex">
          <Skeleton className="aspect-[4/5] w-full max-w-md" />
        </div>
        <div className="order-1 flex flex-col items-center gap-5 lg:items-start">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-3/4 max-w-sm" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-2/3 max-w-sm" />
          <div className="flex gap-3">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </Container>
    </section>
  );
}

function CategorySkeleton() {
  return (
    <Container className="flex flex-col gap-8 py-12 sm:py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </Container>
  );
}

function ProductRowSkeleton() {
  return (
    <Container className="flex flex-col gap-8 py-12 sm:py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <ProductGridSkeleton count={4} />
    </Container>
  );
}

function BridalSkeleton() {
  return (
    <section className="overflow-hidden bg-primary">
      <Container className="grid grid-cols-1 items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <Skeleton className="aspect-[4/5] w-full max-w-md justify-self-center lg:justify-self-start" />
        <div className="flex flex-col items-center gap-4 lg:items-start">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-full max-w-sm" />
          <Skeleton className="h-4 w-full max-w-sm" />
          <Skeleton className="h-12 w-48" />
        </div>
      </Container>
    </section>
  );
}

function BenefitsSkeleton() {
  return (
    <Container className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 sm:grid-cols-2 sm:py-14 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </Container>
  );
}

function SocialGallerySkeleton() {
  return (
    <Container className="flex flex-col gap-8 py-12 sm:py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="aspect-square w-full rounded-2xl" />
        ))}
      </div>
    </Container>
  );
}
