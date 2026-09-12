import type {
  Category,
  Product,
  ProductColor,
  ProductMaterial,
  ProductOccasion,
  ProductVariantGroup,
  Profile,
  Review,
} from "@/types";
import type { Order, OrderItem } from "@/types/order";
import type { Database } from "@/types/supabase";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type ProductVariantRow =
  Database["public"]["Tables"]["product_variants"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    role: row.role === "admin" ? "admin" : "customer",
  };
}

export function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: row.image_url ?? "",
    productCount: row.product_count,
    description: row.description ?? "",
  };
}

// Curated brand hexes for the site's own named colors -- these look better
// than the raw CSS keyword would (e.g. a warm jewellery gold, not CSS's
// mustardy #FFD700 "gold"), so they're checked first.
const COLOR_SWATCHES: Partial<Record<ProductColor, string>> = {
  Gold: "#B08D57",
  Silver: "#C7C9CC",
  "Rose Gold": "#D9A6A0",
  Pearl: "#F0EAE2",
  Black: "#1F1F1F",
};

// Standard CSS3 named colors. Any color variant typed in by the admin that
// isn't one of the curated brand names above (e.g. "Maroon", "Pink") still
// gets a real swatch as long as it's a recognized color word or hex code,
// instead of silently falling back to a plain text pill.
const CSS_NAMED_COLORS = new Set([
  "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige",
  "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown",
  "burlywood", "cadetblue", "chartreuse", "chocolate", "coral",
  "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan",
  "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki",
  "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred",
  "darksalmon", "darkseagreen", "darkslateblue", "darkslategray",
  "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue",
  "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite",
  "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod",
  "gray", "green", "greenyellow", "grey", "honeydew", "hotpink", "indianred",
  "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen",
  "lemonchiffon", "lightblue", "lightcoral", "lightcyan",
  "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey",
  "lightpink", "lightsalmon", "lightseagreen", "lightskyblue",
  "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow",
  "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine",
  "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen",
  "mediumslateblue", "mediumspringgreen", "mediumturquoise",
  "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin",
  "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange",
  "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise",
  "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum",
  "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue",
  "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna",
  "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow",
  "springgreen", "steelblue", "tan", "teal", "thistle", "tomato",
  "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow",
  "yellowgreen",
]);

function resolveColorSwatch(value: string): string | undefined {
  const curated = COLOR_SWATCHES[value as ProductColor];
  if (curated) return curated;

  const trimmed = value.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) return trimmed;

  const normalized = trimmed.toLowerCase().replace(/\s+/g, "");
  return CSS_NAMED_COLORS.has(normalized) ? normalized : undefined;
}

export interface ProductRatingAggregate {
  rating: number;
  reviewsCount: number;
}

function groupVariantRows(
  rows: ProductVariantRow[],
  basePrice: number,
): ProductVariantGroup[] {
  const groups = new Map<string, ProductVariantGroup>();

  for (const row of rows) {
    if (!row.is_active) continue;

    let group = groups.get(row.option_type);
    if (!group) {
      group = { type: row.option_type, label: row.name, options: [] };
      groups.set(row.option_type, group);
    }

    group.options.push({
      value: row.option_value,
      label: row.option_value,
      swatch:
        row.option_type === "color"
          ? resolveColorSwatch(row.option_value)
          : undefined,
      priceOverride:
        row.price_adjustment != null
          ? basePrice + row.price_adjustment
          : undefined,
      inStock: row.stock === 0 ? false : undefined,
      image: row.image_url ?? undefined,
    });
  }

  return [...groups.values()];
}

export function mapProductRow(
  row: ProductRow,
  categorySlug: string,
  images: ProductImageRow[],
  variants: ProductVariantRow[],
  aggregate: ProductRatingAggregate,
): Product {
  const sortedImages = [...images].sort(
    (a, b) => a.display_order - b.display_order,
  );
  const variantGroups = groupVariantRows(variants, row.price);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug,
    description: row.description,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    rating: aggregate.rating,
    reviewsCount: aggregate.reviewsCount,
    images: sortedImages.map((image) => image.image_url),
    isNew: row.is_new,
    isBestSeller: row.is_best_seller,
    isFeatured: row.is_featured,
    stock: row.stock,
    material: (row.material ?? "Alloy") as ProductMaterial,
    color: (row.color ?? "Multicolor") as ProductColor,
    occasion: (row.occasion ?? "Everyday") as ProductOccasion,
    tags: row.tags ?? [],
    weight: row.weight ?? undefined,
    dimensions: row.dimensions ?? undefined,
    careInstructions: row.care_instructions ?? undefined,
    variants: variantGroups.length > 0 ? variantGroups : undefined,
  };
}

export function mapOrderItemRow(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    productName: row.product_name,
    variantName: row.variant_name,
    productPrice: row.product_price,
    quantity: row.quantity,
    lineTotal: row.line_total,
    productImageUrl: row.product_image_url,
  };
}

export function mapOrderRow(row: OrderRow, items: OrderItemRow[]): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status as Order["status"],
    paymentMethod: row.payment_method as Order["paymentMethod"],
    paymentStatus: row.payment_status as Order["paymentStatus"],
    subtotal: row.subtotal,
    shippingCost: row.shipping_cost,
    total: row.total,
    currency: row.currency,
    shippingAddress: {
      fullName: row.shipping_full_name,
      email: row.shipping_email,
      phone: row.shipping_phone,
      addressLine1: row.shipping_address_line_1,
      addressLine2: row.shipping_address_line_2 ?? "",
      city: row.shipping_city,
      province: row.shipping_province,
      postalCode: row.shipping_postal_code ?? "",
      country: row.shipping_country,
    },
    customerNotes: row.customer_notes,
    createdAt: row.created_at,
    items: items.map(mapOrderItemRow),
  };
}

export function mapReviewRow(row: ReviewRow, productName: string): Review {
  return {
    id: row.id,
    productId: row.product_id,
    customerName: row.customer_name,
    rating: row.rating,
    reviewText: row.review,
    date: row.review_date,
    verifiedPurchase: row.is_verified_purchase,
    purchasedProduct: productName,
  };
}

export function computeRatingAggregate(
  ratings: number[],
): ProductRatingAggregate {
  if (ratings.length === 0) return { rating: 0, reviewsCount: 0 };
  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return {
    rating: Math.round((total / ratings.length) * 10) / 10,
    reviewsCount: ratings.length,
  };
}
