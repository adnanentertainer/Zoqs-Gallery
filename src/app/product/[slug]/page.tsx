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
  ProductWhatsAppButton,
  RecentlyViewedSection,
  RecentlyViewedTracker,
  ReviewForm,
  ReviewSummary,
} from "@/components/product";
import { ProductSection } from "@/components/home/ProductSection";
import { ProductVariantImageProvider } from "@/context/ProductVariantImageContext";
import { siteConfig } from "@/constants/site";
import { getProductBadge, isInStock } from "@/lib/products";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from "@/lib/services/productService";
import { getProductReviews } from "@/lib/services/reviewService";
import { getAverageRating, getReviewBreakdown } from "@/lib/reviews";
import { buildMetaDescription, categoryLabel, safeJsonLd } from "@/lib/utils";
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

  const title = `${product.name} | ZOQ's Gallery`;
  const description = buildMetaDescription(
    product.shortDescription?.trim() || product.description,
  );
  const canonicalPath = `/product/${product.slug}`;
  const images = product.images[0] ? [{ url: product.images[0] }] : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    // openGraph/twitter here fully replace (not merge with) the root
    // layout's defaults, so every field that should differ per product —
    // including type/siteName/url, which the root layout also sets — has
    // to be repeated, or it silently disappears from the rendered tags.
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      url: canonicalPath,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((image) => image.url),
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
  const [productReviews, relatedProducts] = await Promise.all([
    getProductReviews(product.id, product.name),
    getRelatedProducts(product, 4),
  ]);
  const breakdown = getReviewBreakdown(productReviews);
  const reviewsCount = productReviews.length;
  const averageRating =
    reviewsCount > 0 ? getAverageRating(productReviews) : product.rating;
  const inStock = isInStock(product);

  // Google won't consider a Product eligible for price/availability rich
  // results without priceValidUntil, hasMerchantReturnPolicy, and
  // shippingDetails on the Offer. Keep the return-policy numbers here in
  // sync with /returns-and-refunds and the FAQs "Returns & Exchanges"
  // section — this doesn't read from those pages, it just restates them
  // for Google. deliveryTime's handlingTime/transitTime are estimates
  // (1-2 days to dispatch, 2-5 days in transit) since the site copy only
  // promises "a few business days" without a fixed range.
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const priceValidUntil = oneYearFromNow.toISOString().slice(0, 10);
  const validFrom = new Date().toISOString().slice(0, 10);

  const deliveryTime = {
    "@type": "ShippingDeliveryTime",
    handlingTime: {
      "@type": "QuantitativeValue",
      minValue: 1,
      maxValue: 2,
      unitCode: "d",
    },
    transitTime: {
      "@type": "QuantitativeValue",
      minValue: 2,
      maxValue: 5,
      unitCode: "d",
    },
  };

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
      priceValidUntil,
      validFrom,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "PK",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees",
        returnShippingFeesAmount: {
          "@type": "MonetaryAmount",
          value: siteConfig.flatShippingCost,
          currency: siteConfig.currency,
        },
      },
      shippingDetails: [
        {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: siteConfig.flatShippingCost,
            currency: siteConfig.currency,
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "PK",
          },
          deliveryTime,
        },
        {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: 0,
            currency: siteConfig.currency,
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "PK",
          },
          eligibleTransactionVolume: {
            "@type": "PriceSpecification",
            minPrice: siteConfig.freeShippingThreshold,
            priceCurrency: siteConfig.currency,
          },
          deliveryTime,
        },
      ],
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
      <RecentlyViewedTracker slug={product.slug} />
      <ProductWhatsAppButton product={product} />

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

      <ProductVariantImageProvider product={product}>
        <Container className="grid grid-cols-1 gap-10 pb-16 lg:grid-cols-2 lg:gap-16">
          <ProductGallery
            images={product.images}
            productName={product.name}
            variants={product.variants}
          />

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

            {product.shortDescription && (
              <Text variant="body" className="whitespace-pre-line text-muted">
                {product.shortDescription}
              </Text>
            )}

            <ProductActions product={product} />
          </div>
        </Container>
      </ProductVariantImageProvider>

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
        <ReviewForm productId={product.id} productSlug={product.slug} />
      </Container>

      <ProductSection
        title="You May Also Like"
        subtitle={`More pieces from the ${categoryName} collection and beyond.`}
        products={relatedProducts}
        viewAllLabel={`Browse ${categoryName}`}
        viewAllHref={`/category/${product.categorySlug}`}
        background="cream"
      />

      <RecentlyViewedSection excludeSlug={product.slug} />
    </>
  );
}
