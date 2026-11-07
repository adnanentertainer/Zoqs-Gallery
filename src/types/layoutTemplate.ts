export type HeroLayoutId =
  | "classic"
  | "centered"
  | "editorial"
  | "minimal"
  | "panel"
  | "badge";
export type PromoBannerLayoutId =
  | "classic"
  | "splitReverse"
  | "fullBleed"
  | "panel"
  | "badge"
  | "centered"
  | "ticker"
  | "stacked";
export type CategoryLayoutId =
  | "grid"
  | "row"
  | "spotlight"
  | "circles"
  | "list"
  | "tiles";
export type ProductLayoutId =
  | "grid"
  | "carousel"
  | "featured"
  | "compact"
  | "duo";
export type BridalLayoutId =
  | "classic"
  | "editorial"
  | "quote"
  | "side"
  | "banner";
export type BenefitsLayoutId =
  | "inline"
  | "cards"
  | "steps"
  | "ticker"
  | "banner";
export type ReviewsLayoutId =
  | "grid"
  | "carousel"
  | "spotlight"
  | "masonry"
  | "list";
export type SocialGalleryLayoutId =
  | "grid"
  | "carousel"
  | "mosaic"
  | "banner"
  | "circles";

export interface LayoutTemplate {
  hero: HeroLayoutId;
  /** Classic Split hides its photo below the `lg` breakpoint by default (to
   * save mobile scroll height) -- set this to show it there too, as a
   * short, uncropped strip beneath the heading/CTAs instead. Layouts that
   * already show their photo on mobile regardless (Centered Spotlight,
   * Editorial Full-Bleed, Side Panel, Floating Badge) ignore this flag. */
  heroShowImageOnMobile: boolean;
  promoBanner: PromoBannerLayoutId;
  categories: CategoryLayoutId;
  products: ProductLayoutId;
  bridal: BridalLayoutId;
  benefits: BenefitsLayoutId;
  reviews: ReviewsLayoutId;
  socialGallery: SocialGalleryLayoutId;
}

export const DEFAULT_LAYOUT_TEMPLATE: LayoutTemplate = {
  hero: "classic",
  heroShowImageOnMobile: false,
  promoBanner: "classic",
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
  /** Image/content requirements for this specific variant -- recommended
   * pixel dimensions and aspect ratio where a photo is used, which admin
   * page edits that photo, or a note when the variant uses no photo at
   * all. Shown on the variant's card in /admin/layout-template so the
   * admin knows what to prepare before switching to it. */
  spec: string;
}

export const HERO_LAYOUTS: LayoutVariantOption<HeroLayoutId>[] = [
  {
    id: "classic",
    name: "Classic Split",
    description: "Boxed photo beside the headline -- the current look.",
    spec: "Photo: 900×1125px (4:5 portrait) or larger. Set in Admin → Settings → Homepage Hero Image, or add 2+ in Admin → Hero Carousel to auto-scroll between them. Optional mobile crop: 1200×675px (16:9) -- see \"Show hero photo on mobile\" below.",
  },
  {
    id: "centered",
    name: "Centered Spotlight",
    description: "Centered headline with a wide photo band beneath it.",
    spec: "Photo: 2400×1050px (21:9 landscape) or larger. Set in Admin → Settings → Homepage Hero Image, or add 2+ in Admin → Hero Carousel to auto-scroll between them.",
  },
  {
    id: "editorial",
    name: "Editorial Full-Bleed",
    description:
      "Full-bleed cinematic photo with the headline overlaid on top, magazine-style.",
    spec: "Photo: 1920×1200px (landscape) or larger -- fills the full screen. Set in Admin → Settings → Homepage Hero Image, or add 2+ in Admin → Hero Carousel to auto-scroll between them.",
  },
  {
    id: "minimal",
    name: "Minimal Typographic",
    description:
      "No photo -- just a large centered headline on a soft tinted background.",
    spec: "No photo needed -- headline-only layout.",
  },
  {
    id: "panel",
    name: "Side Panel",
    description:
      "Photo bleeds edge-to-edge in a tall side panel, no frame or padding.",
    spec: "Photo: 1600×1200px or larger, portrait or landscape both work -- bleeds to the edge. Set in Admin → Settings → Homepage Hero Image, or add 2+ in Admin → Hero Carousel to auto-scroll between them.",
  },
  {
    id: "badge",
    name: "Floating Badge",
    description:
      "Full-bleed photo with the headline in a floating card over the corner.",
    spec: "Photo: 1920×1200px (landscape) or larger -- fills the full screen. Set in Admin → Settings → Homepage Hero Image, or add 2+ in Admin → Hero Carousel to auto-scroll between them.",
  },
];

export const PROMO_BANNER_LAYOUTS: LayoutVariantOption<PromoBannerLayoutId>[] =
  [
    {
      id: "classic",
      name: "Classic Split",
      description:
        "Text on the left, a circular photo badge on the right -- the current look.",
      spec: "Banner Image: 400×400px (square) or larger, shown as a circle. Edit each banner in Admin → Promo Banners.",
    },
    {
      id: "splitReverse",
      name: "Split Reverse",
      description: "Same as Classic Split, mirrored -- photo badge on the left.",
      spec: "Banner Image: 400×400px (square) or larger, shown as a circle. Edit each banner in Admin → Promo Banners.",
    },
    {
      id: "fullBleed",
      name: "Full-Bleed Photo",
      description:
        "The photo fills the entire banner edge-to-edge, text overlaid on top.",
      spec: "Background Image: 1920×600px (wide landscape) or larger -- fills the full banner. Edit each banner in Admin → Promo Banners.",
    },
    {
      id: "panel",
      name: "Side Panel",
      description:
        "Photo bleeds edge-to-edge in a rectangular side panel, no frame or circle crop.",
      spec: "Banner Image: 800×600px or larger, portrait or landscape both work. Edit each banner in Admin → Promo Banners.",
    },
    {
      id: "badge",
      name: "Floating Badge",
      description:
        "Full-bleed photo with the text in a floating card over the corner.",
      spec: "Background Image: 1920×600px (wide landscape) or larger. Edit each banner in Admin → Promo Banners.",
    },
    {
      id: "centered",
      name: "Centered Minimal",
      description:
        "No photo -- centered text and button on a solid color band.",
      spec: "No photo needed -- text-only layout.",
    },
    {
      id: "ticker",
      name: "Compact Ticker",
      description:
        "A short single-row announcement strip -- text and button inline, no subtitle.",
      spec: "No photo needed -- text-only, compact layout.",
    },
    {
      id: "stacked",
      name: "Stacked Poster",
      description: "A wide photo on top, text and button centered beneath it.",
      spec: "Banner Image: 1200×675px (16:9 landscape) or larger. Edit each banner in Admin → Promo Banners.",
    },
  ];

export const CATEGORY_LAYOUTS: LayoutVariantOption<CategoryLayoutId>[] = [
  {
    id: "grid",
    name: "Rounded Grid",
    description: "Rounded square cards in an even grid -- the current look.",
    spec: "Photos: 600×600px (square) or larger. Edit each category's photo in Admin → Categories.",
  },
  {
    id: "row",
    name: "Minimal Row",
    description: "Flush square photos in a clean horizontal row.",
    spec: "Photos: 600×600px (square) or larger. Edit each category's photo in Admin → Categories.",
  },
  {
    id: "spotlight",
    name: "Featured Spotlight",
    description: "One large featured category beside the smaller ones.",
    spec: "The first category's photo looks best at 1200×900px (4:3) or larger; the rest at 600×600px squares. Edit in Admin → Categories.",
  },
  {
    id: "circles",
    name: "Circle Avatars",
    description: "Round category photos in a row, app-style.",
    spec: "Photos: 400×400px (square) or larger. Edit each category's photo in Admin → Categories.",
  },
  {
    id: "list",
    name: "Compact List",
    description: "A vertical list of rows -- thumbnail, name and count.",
    spec: "Photos: any size works (square crop recommended). Edit each category's photo in Admin → Categories.",
  },
  {
    id: "tiles",
    name: "Banner Tiles",
    description: "Wide rectangular tiles with the name overlaid on each photo.",
    spec: "Photos: 900×560px (16:10 landscape) or larger. Edit each category's photo in Admin → Categories.",
  },
];

export const PRODUCT_LAYOUTS: LayoutVariantOption<ProductLayoutId>[] = [
  {
    id: "grid",
    name: "Grid",
    description: "An even product grid -- the current look.",
    spec: "Uses your product photos as-is (3:4 portrait, already set per product). No extra setup for this layout.",
  },
  {
    id: "carousel",
    name: "Scrolling Carousel",
    description: "A horizontally scrollable row of product cards.",
    spec: "Uses your product photos as-is (3:4 portrait, already set per product). No extra setup for this layout.",
  },
  {
    id: "featured",
    name: "Featured Grid",
    description: "The first product shown large beside a smaller grid.",
    spec: "Uses your product photos as-is (3:4 portrait, already set per product). No extra setup for this layout.",
  },
  {
    id: "compact",
    name: "Compact Grid",
    description: "More columns, tighter spacing -- a denser catalog feel.",
    spec: "Uses your product photos as-is (3:4 portrait, already set per product). No extra setup for this layout.",
  },
  {
    id: "duo",
    name: "Duo Feature",
    description: "The first two products shown large beside a smaller grid.",
    spec: "Uses your product photos as-is (3:4 portrait, already set per product). No extra setup for this layout.",
  },
];

export const BRIDAL_LAYOUTS: LayoutVariantOption<BridalLayoutId>[] = [
  {
    id: "classic",
    name: "Classic Split",
    description: "Boxed photo beside the text -- the current look.",
    spec: "Photo: 1200×1500px (4:5 portrait) or larger. Edit in Admin → Settings → Bridal Collection Banner Image.",
  },
  {
    id: "editorial",
    name: "Editorial Full-Bleed",
    description: "Full-bleed cinematic photo with the text overlaid on top.",
    spec: "Photo: 1920×1200px (landscape) or larger -- fills the full screen. Edit in Admin → Settings → Bridal Collection Banner Image.",
  },
  {
    id: "quote",
    name: "Minimal Quote",
    description: "No photo -- an elegant centered quote on a rich color field.",
    spec: "No photo -- quote-only layout.",
  },
  {
    id: "side",
    name: "Side Accent",
    description: "Photo bleeds edge-to-edge beside a solid-color text panel.",
    spec: "Photo: 1600×1200px or larger, portrait or landscape both work. Edit in Admin → Settings → Bridal Collection Banner Image.",
  },
  {
    id: "banner",
    name: "Compact Banner",
    description: "A shorter single-row banner -- photo, text and CTA inline.",
    spec: "No photo -- compact text-only banner.",
  },
];

export const BENEFITS_LAYOUTS: LayoutVariantOption<BenefitsLayoutId>[] = [
  {
    id: "inline",
    name: "Inline Row",
    description: "A divided row of icon + text -- the current look.",
    spec: "No photos used -- icon + text only.",
  },
  {
    id: "cards",
    name: "Bordered Cards",
    description: "Each benefit in its own bordered card.",
    spec: "No photos used -- icon + text only.",
  },
  {
    id: "steps",
    name: "Numbered Steps",
    description: "Each benefit shown as a large numbered step.",
    spec: "No photos used -- icon + text only.",
  },
  {
    id: "ticker",
    name: "Compact Ticker",
    description: "A tight single-line row -- icon and label only, no description.",
    spec: "No photos used -- icon + label only.",
  },
  {
    id: "banner",
    name: "Color Banner",
    description: "The whole strip on a bold color band, icons and text in white.",
    spec: "No photos used -- icon + text only.",
  },
];

export const REVIEWS_LAYOUTS: LayoutVariantOption<ReviewsLayoutId>[] = [
  {
    id: "grid",
    name: "Grid",
    description: "An even grid of review cards -- the current look.",
    spec: "No photos used -- text only, pulled from your approved reviews.",
  },
  {
    id: "carousel",
    name: "Scrolling Carousel",
    description: "A horizontally scrollable row of review cards.",
    spec: "No photos used -- text only, pulled from your approved reviews.",
  },
  {
    id: "spotlight",
    name: "Featured Spotlight",
    description: "One large featured review beside the smaller ones.",
    spec: "No photos used -- text only, pulled from your approved reviews.",
  },
  {
    id: "masonry",
    name: "Masonry",
    description: "Staggered columns of varying height, Pinterest-style.",
    spec: "No photos used -- text only, pulled from your approved reviews.",
  },
  {
    id: "list",
    name: "Minimal List",
    description: "No cards -- a clean divided list of quotes.",
    spec: "No photos used -- text only, pulled from your approved reviews.",
  },
];

export const SOCIAL_GALLERY_LAYOUTS: LayoutVariantOption<SocialGalleryLayoutId>[] =
  [
    {
      id: "grid",
      name: "Grid",
      description: "An even photo grid -- the current look.",
      spec: "Photos: 450×450px (square) or larger. Edit in Admin → Follow Our Style.",
    },
    {
      id: "carousel",
      name: "Scrolling Carousel",
      description: "A horizontally scrollable row of photos.",
      spec: "Photos: 450×450px (square) or larger. Edit in Admin → Follow Our Style.",
    },
    {
      id: "mosaic",
      name: "Featured Mosaic",
      description: "One large featured photo beside a smaller grid.",
      spec: "The first photo looks best at 900×900px (square) or larger; the rest at 450×450px. Edit in Admin → Follow Our Style.",
    },
    {
      id: "banner",
      name: "Banner Strip",
      description: "One wide featured photo above a row of thumbnails.",
      spec: "The featured photo looks best at 2400×1050px (21:9 landscape); thumbnails at 300×300px squares. Edit in Admin → Follow Our Style.",
    },
    {
      id: "circles",
      name: "Circle Row",
      description: "Round photo avatars in a row, story-style.",
      spec: "Photos: 400×400px (square) or larger. Edit in Admin → Follow Our Style.",
    },
  ];

export function isHeroLayoutId(value: string): value is HeroLayoutId {
  return HERO_LAYOUTS.some((layout) => layout.id === value);
}

export function isPromoBannerLayoutId(
  value: string,
): value is PromoBannerLayoutId {
  return PROMO_BANNER_LAYOUTS.some((layout) => layout.id === value);
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
    heroShowImageOnMobile:
      typeof stored?.heroShowImageOnMobile === "boolean"
        ? stored.heroShowImageOnMobile
        : DEFAULT_LAYOUT_TEMPLATE.heroShowImageOnMobile,
    promoBanner:
      stored?.promoBanner && isPromoBannerLayoutId(stored.promoBanner)
        ? stored.promoBanner
        : DEFAULT_LAYOUT_TEMPLATE.promoBanner,
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
