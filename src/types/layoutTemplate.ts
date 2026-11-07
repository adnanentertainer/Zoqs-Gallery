export type HeroLayoutId = "classic" | "centered" | "editorial";
export type CategoryLayoutId = "grid" | "row" | "spotlight";

export interface LayoutTemplate {
  hero: HeroLayoutId;
  categories: CategoryLayoutId;
}

export const DEFAULT_LAYOUT_TEMPLATE: LayoutTemplate = {
  hero: "classic",
  categories: "grid",
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

export function isHeroLayoutId(value: string): value is HeroLayoutId {
  return HERO_LAYOUTS.some((layout) => layout.id === value);
}

export function isCategoryLayoutId(value: string): value is CategoryLayoutId {
  return CATEGORY_LAYOUTS.some((layout) => layout.id === value);
}
