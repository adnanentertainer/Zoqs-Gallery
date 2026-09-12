export type Nullable<T> = T | null;

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductBadge =
  "New" | "Best Seller" | "Sale" | "Limited Stock" | "Out of Stock";

export type ProductColor =
  "Gold" | "Silver" | "Rose Gold" | "Pearl" | "Multicolor" | "Black";

export type ProductMaterial =
  | "Artificial Gold"
  | "Artificial Silver"
  | "Kundan"
  | "Pearl"
  | "Crystal"
  | "Stainless Steel"
  | "Alloy";

export type ProductOccasion =
  "Everyday" | "Party" | "Wedding" | "Bridal" | "Festive" | "Gift";

export interface ProductVariantOption {
  value: string;
  label: string;
  swatch?: string;
  priceOverride?: number;
  inStock?: boolean;
}

export interface ProductVariantGroup {
  type: "color" | "size" | "style";
  label: string;
  options: ProductVariantOption[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  stock: number;
  material: ProductMaterial;
  color: ProductColor;
  occasion: ProductOccasion;
  tags: string[];
  weight?: string;
  dimensions?: string;
  careInstructions?: string[];
  variants?: ProductVariantGroup[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  description: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  reviewText: string;
  date: string;
  verifiedPurchase: boolean;
  purchasedProduct: string;
}

export interface ReviewBreakdown {
  stars: 1 | 2 | 3 | 4 | 5;
  count: number;
  percentage: number;
}

export type UserRole = "customer" | "admin";

export interface Profile {
  id: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

export interface SocialPost {
  id: string;
  image: string;
  alt: string;
  href: string;
}

export type SpecialFilter = "new" | "best-seller" | "sale";

export type AvailabilityFilter = "in-stock" | "out-of-stock";

export type SortKey =
  | "featured"
  | "newest"
  | "best-selling"
  | "price-low"
  | "price-high"
  | "rating"
  | "discount";

export interface FilterValues {
  category: string[];
  color: string[];
  material: string[];
  occasion: string[];
  special: SpecialFilter[];
  rating?: number;
  availability?: AvailabilityFilter;
  minPrice?: number;
  maxPrice?: number;
}
