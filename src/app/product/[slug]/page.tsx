import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/shared/RatingStars";
import {
  ProductActions,
  ProductGallery,
  ProductPrice,
  ProductReviews,
  ProductTabs,
  ReviewSummary,
} from "@/components/product";
import { ProductSection } from "@/components/home/ProductSection";
import { siteConfig } from "@/constants/site";
import {
  getProductBadge,
  getRecentlyViewedMock,
  isInStock,
} from "@/lib/products";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from "@/lib/services/productService";
import { getProductReviews } from "@/lib/services/reviewService";
import { getAverageRating, getReviewBreakdown } from "@/lib/reviews";
import { categoryLabel, safeJsonLd } from "@/lib/utils";
import type { ProductBadge as ProductBadgeType } from "@/types";

const badgeVariant: Record<
  ProductBadgeType,
  "gold" | "default" | "error" | "outline" | "warning"
> = {
  New: "gold",
  "Best Seller": "default",
  Sale: "error",
  "Limited Stock": "warning",
  "Out of Stock": "outline",
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found | ZOQ's Gallery" };
  }

  return {
    title: `${product.name} | ZOQ's Gallery`,
    description: `Shop ${product.name} from ZOQ's Gallery. Elegant artificial jewellery designed for everyday style and special occasions.`,
    openGraph: {
      title: `${product.name} | ZOQ's Gallery`,
      description: product.description,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const categoryName = categoryLabel(product.categorySlug);
  const badge = getProductBadge(product);
  const productReviews = await getProductReviews(product.id, product.name);
  const breakdown = getReviewBreakdown(productReviews);
  const reviewsCount = productReviews.length;
  const averageRating =
    reviewsCount > 0 ? getAverageRating(productReviews) : product.rating;
  const relatedProducts = await getRelatedProducts(product, 4);
  // Recently viewed is an intentionally lightweight mock (no real view-history
  // tracking exists), so it stays sourced from the local mock catalog
  // regardless of whether Supabase is configured — see the Phase 7 report.
  const recentlyViewed = getRecentlyViewedMock(product, relatedProducts);
  const inStock = isInStock(product);

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: {
      "@type": "Offer",
      priceCurrency: siteConfig.currency,
      price: product.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      reviewsCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: averageRating,
            reviewCount: reviewsCount,
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <Container className="flex flex-col gap-3 pt-6 pb-4">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Jewellery", href: "/shop" },
            { label: categoryName, href: `/category/${product.categorySlug}` },
            { label: product.name },
          ]}
        />
      </Container>

      <Container className="grid grid-cols-1 gap-10 pb-16 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-5 pb-24 lg:pb-0">
          <div className="flex flex-col gap-3">
            {badge && (
              <Badge variant={badgeVariant[badge]} className="w-fit">
                {badge}
              </Badge>
            )}
            <Heading variant="h1" as="h1">
              {product.name}
            </Heading>
            <a
              href="#reviews"
              className="flex w-fit items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <RatingStars rating={averageRating} />
              <span className="font-body text-sm text-primary">
                {averageRating.toFixed(1)}
              </span>
              <span className="font-body text-sm text-muted underline-offset-2 hover:underline">
                {reviewsCount} Reviews
              </span>
            </a>
          </div>

          <ProductPrice product={product} />

          {inStock ? (
            <span className="inline-flex w-fit items-center gap-2 font-body text-sm font-medium text-success">
              <span
                className="h-2 w-2 rounded-full bg-success"
                aria-hidden="true"
              />
              In Stock
            </span>
          ) : (
            <span className="inline-flex w-fit items-center gap-2 font-body text-sm font-medium text-error">
              <span
                className="h-2 w-2 rounded-full bg-error"
                aria-hidden="true"
              />
              Out of Stock
            </span>
          )}

          <Text variant="body" className="text-muted">
            {product.description}
          </Text>

          <ProductActions product={product} />
        </div>
      </Container>

      <Container className="pb-16">
        <ProductTabs product={product} />
      </Container>

      <Container
        id="reviews"
        className="flex flex-col gap-8 border-t border-beige pb-16 pt-16"
      >
        <Heading variant="h2" as="h2">
          Customer Reviews
        </Heading>
        <ReviewSummary
          rating={averageRating}
          reviewsCount={reviewsCount}
          breakdown={breakdown}
        />
        <ProductReviews reviews={productReviews} />
      </Container>

      <ProductSection
        title="You May Also Like"
        subtitle={`More pieces from the ${categoryName} collection and beyond.`}
        products={relatedProducts}
        viewAllLabel={`Browse ${categoryName}`}
        viewAllHref={`/category/${product.categorySlug}`}
        background="cream"
      />

      {recentlyViewed.length > 0 && (
        <ProductSection
          title="Recently Viewed"
          products={recentlyViewed}
          viewAllLabel="Continue Shopping"
          viewAllHref="/shop"
        />
      )}
    </>
  );
}
