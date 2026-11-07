export type HeroLayoutId = "classic" | "centered" | "editorial";
export type CategoryLayoutId = "grid" | "row" | "spotlight";
export type ProductLayoutId = "grid" | "carousel";
export type BridalLayoutId = "classic" | "editorial";
export type BenefitsLayoutId = "inline" | "cards";
export type ReviewsLayoutId = "grid" | "carousel";
export type SocialGalleryLayoutId = "grid" | "carousel";

export interface LayoutTemplate {
  hero: HeroLayoutId;
  categories: CategoryLayoutId;
  products: ProductLayoutId;
  bridal: BridalLayoutId;
  benefits: BenefitsLayoutId;
  reviews: ReviewsLayoutId;
  socialGallery: SocialGalleryLayoutId;
}

export const DEFAULT_LAYOUT_TEMPLATE: LayoutTemplate = {
  hero: "classic",
  categories: "grid",
  products: "grid",
  bridal: "classic",
  benefits: "inline",
  reviews: "grid",
  socialGallery: "grid",
};

export interface LayoutVariantOption<Id extends string> {
  id: Id;
  name: string;
  description: string;
}

export const HERO_LAYOUTS: LayoutVariantOption<HeroLayoutId>[] = [
  {
    id: "classic",
    name: "Classic Split",
    description: "Boxed photo beside the headline -- the current look.",
  },
  {
    id: "centered",
    name: "Centered Spotlight",
    description: "Centered headline with a wide photo band beneath it.",
  },
  {
    id: "editorial",
    name: "Editorial Full-Bleed",
    description:
      "Full-bleed cinematic photo with the headline overlaid on top, magazine-style.",
  },
];

export const CATEGORY_LAYOUTS: LayoutVariantOption<CategoryLayoutId>[] = [
  {
    id: "grid",
    name: "Rounded Grid",
    description: "Rounded square cards in an even grid -- the current look.",
  },
  {
    id: "row",
    name: "Minimal Row",
    description: "Flush square photos in a clean horizontal row.",
  },
  {
    id: "spotlight",
    name: "Featured Spotlight",
    description: "One large featured category beside the smaller ones.",
  },
];

export const PRODUCT_LAYOUTS: LayoutVariantOption<ProductLayoutId>[] = [
  {
    id: "grid",
    name: "Grid",
    description: "An even product grid -- the current look.",
  },
  {
    id: "carousel",
    name: "Scrolling Carousel",
    description: "A horizontally scrollable row of product cards.",
  },
];

export const BRIDAL_LAYOUTS: LayoutVariantOption<BridalLayoutId>[] = [
  {
    id: "classic",
    name: "Classic Split",
    description: "Boxed photo beside the text -- the current look.",
  },
  {
    id: "editorial",
    name: "Editorial Full-Bleed",
    description: "Full-bleed cinematic photo with the text overlaid on top.",
  },
];

export const BENEFITS_LAYOUTS: LayoutVariantOption<BenefitsLayoutId>[] = [
  {
    id: "inline",
    name: "Inline Row",
    description: "A divided row of icon + text -- the current look.",
  },
  {
    id: "cards",
    name: "Bordered Cards",
    description: "Each benefit in its own bordered card.",
  },
];

export const REVIEWS_LAYOUTS: LayoutVariantOption<ReviewsLayoutId>[] = [
  {
    id: "grid",
    name: "Grid",
    description: "An even grid of review cards -- the current look.",
  },
  {
    id: "carousel",
    name: "Scrolling Carousel",
    description: "A horizontally scrollable row of review cards.",
  },
];

export const SOCIAL_GALLERY_LAYOUTS: LayoutVariantOption<SocialGalleryLayoutId>[] =
  [
    {
      id: "grid",
      name: "Grid",
      description: "An even photo grid -- the current look.",
    },
    {
      id: "carousel",
      name: "Scrolling Carousel",
      description: "A horizontally scrollable row of photos.",
    },
  ];

export function isHeroLayoutId(value: string): value is HeroLayoutId {
  return HERO_LAYOUTS.some((layout) => layout.id === value);
}

export function isCategoryLayoutId(value: string): value is CategoryLayoutId {
  return CATEGORY_LAYOUTS.some((layout) => layout.id === value);
}

export function isProductLayoutId(value: string): value is ProductLayoutId {
  return PRODUCT_LAYOUTS.some((layout) => layout.id === value);
}

export function isBridalLayoutId(value: string): value is BridalLayoutId {
  return BRIDAL_LAYOUTS.some((layout) => layout.id === value);
}

export function isBenefitsLayoutId(value: string): value is BenefitsLayoutId {
  return BENEFITS_LAYOUTS.some((layout) => layout.id === value);
}

export function isReviewsLayoutId(value: string): value is ReviewsLayoutId {
  return REVIEWS_LAYOUTS.some((layout) => layout.id === value);
}

export function isSocialGalleryLayoutId(
  value: string,
): value is SocialGalleryLayoutId {
  return SOCIAL_GALLERY_LAYOUTS.some((layout) => layout.id === value);
}

/**
 * Resolves a partially-saved/stale LayoutTemplate (e.g. missing a section
 * added after the setting was first saved, or carrying a since-removed
 * variant id) into a fully valid one, falling back section-by-section so a
 * bad id in one section never breaks any other section. Shared by the
 * public and admin services so they can never disagree.
 */
export function resolveLayoutTemplate(
  stored: Partial<LayoutTemplate> | null | undefined,
): LayoutTemplate {
  return {
    hero:
      stored?.hero && isHeroLayoutId(stored.hero)
        ? stored.hero
        : DEFAULT_LAYOUT_TEMPLATE.hero,
    categories:
      stored?.categories && isCategoryLayoutId(stored.categories)
        ? stored.categories
        : DEFAULT_LAYOUT_TEMPLATE.categories,
    products:
      stored?.products && isProductLayoutId(stored.products)
        ? stored.products
        : DEFAULT_LAYOUT_TEMPLATE.products,
    bridal:
      stored?.bridal && isBridalLayoutId(stored.bridal)
        ? stored.bridal
        : DEFAULT_LAYOUT_TEMPLATE.bridal,
    benefits:
      stored?.benefits && isBenefitsLayoutId(stored.benefits)
        ? stored.benefits
        : DEFAULT_LAYOUT_TEMPLATE.benefits,
    reviews:
      stored?.reviews && isReviewsLayoutId(stored.reviews)
        ? stored.reviews
        : DEFAULT_LAYOUT_TEMPLATE.reviews,
    socialGallery:
      stored?.socialGallery && isSocialGalleryLayoutId(stored.socialGallery)
        ? stored.socialGallery
        : DEFAULT_LAYOUT_TEMPLATE.socialGallery,
  };
}
