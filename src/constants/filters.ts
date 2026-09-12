import type {
  ProductColor,
  ProductMaterial,
  ProductOccasion,
  SortKey,
} from "@/types";

export const COLOR_OPTIONS: ProductColor[] = [
  "Gold",
  "Silver",
  "Rose Gold",
  "Pearl",
  "Multicolor",
  "Black",
];

export const MATERIAL_OPTIONS: ProductMaterial[] = [
  "Artificial Gold",
  "Artificial Silver",
  "Kundan",
  "Pearl",
  "Crystal",
  "Stainless Steel",
  "Alloy",
];

export const OCCASION_OPTIONS: ProductOccasion[] = [
  "Everyday",
  "Party",
  "Wedding",
  "Bridal",
  "Festive",
  "Gift",
];

export const RATING_OPTIONS = [4, 3, 2] as const;

export interface PriceRangeOption {
  label: string;
  min?: number;
  max?: number;
}

export const PRICE_RANGE_OPTIONS: PriceRangeOption[] = [
  { label: "Under Rs. 1,000", max: 1000 },
  { label: "Rs. 1,000 – Rs. 2,000", min: 1000, max: 2000 },
  { label: "Rs. 2,000 – Rs. 3,500", min: 2000, max: 3500 },
  { label: "Rs. 3,500 – Rs. 5,000", min: 3500, max: 5000 },
  { label: "Above Rs. 5,000", min: 5000 },
];

export const SPECIAL_FILTER_OPTIONS: {
  value: "new" | "best-seller" | "sale";
  label: string;
}[] = [
  { value: "new", label: "New Arrivals" },
  { value: "best-seller", label: "Best Sellers" },
  { value: "sale", label: "On Sale" },
];

export const AVAILABILITY_OPTIONS: {
  value: "in-stock" | "out-of-stock";
  label: string;
}[] = [
  { value: "in-stock", label: "In Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
];

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "discount", label: "Biggest Discount" },
];

export const PRODUCTS_PER_PAGE = 8;
