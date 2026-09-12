import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type {
  AdminProductDetail,
  AdminProductFilters,
  AdminProductInput,
  AdminProductListItem,
  ProductOption,
} from "@/types/admin";
import type { PaginationResult } from "@/types/admin";
import type { Database } from "@/types/supabase";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductListRow extends ProductRow {
  categories: { name: string } | null;
  product_images: { image_url: string; display_order: number }[];
}

/**
 * Lightweight, unpaginated list (with variants) for populating the Stock
 * Movement form's product picker. Fine at this catalog's scale — see the
 * same tradeoff already documented on listSupplierOptions().
 */
export async function listProductOptions(): Promise<ProductOption[]> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku, stock, product_variants(id, option_value, sku, stock)")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("[adminProductService.listProductOptions] failed:", error);
    throw new Error("Unable to load products right now.");
  }

  const rows = (data ?? []) as unknown as {
    id: string;
    name: string;
    sku: string | null;
    stock: number;
    product_variants: {
      id: string;
      option_value: string;
      sku: string | null;
      stock: number | null;
    }[];
  }[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    sku: row.sku,
    stock: row.stock,
    variants: row.product_variants.map((variant) => ({
      id: variant.id,
      label: variant.option_value,
      sku: variant.sku,
      stock: variant.stock,
    })),
  }));
}

function mapProductListRow(row: ProductListRow): AdminProductListItem {
  const sortedImages = [...row.product_images].sort(
    (a, b) => a.display_order - b.display_order,
  );
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    categoryName: row.categories?.name ?? "—",
    price: row.price,
    stock: row.stock,
    minStockLevel: row.min_stock_level,
    isActive: row.is_active,
    forceUnavailable: row.force_unavailable,
    imageUrl: sortedImages[0]?.image_url ?? null,
    createdAt: row.created_at,
  };
}

export async function listAdminProducts(
  filters: AdminProductFilters,
): Promise<PaginationResult<AdminProductListItem>> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  // "low-stock"/"in-stock" compare each row's stock against that same row's
  // own min_stock_level — a column-vs-column comparison PostgREST filters
  // can't express (same tradeoff as inventoryService.listLowStockProducts).
  // Only those two values need the fetch-all-then-filter-in-JS path below;
  // "out-of-stock" is a plain stock = 0 filter and stays server-side.
  const needsMinStockComparison =
    filters.inventory === "low-stock" || filters.inventory === "in-stock";

  let query = supabase
    .from("products")
    .select(
      "*, categories(name), product_images(image_url, display_order)",
      needsMinStockComparison ? {} : { count: "exact" },
    );

  if (filters.search) {
    const term = filters.search.trim();
    if (term) query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%`);
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.status === "active") query = query.eq("is_active", true);
  if (filters.status === "inactive") query = query.eq("is_active", false);
  if (filters.inventory === "out-of-stock") query = query.eq("stock", 0);

  switch (filters.sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "name-asc":
      query = query.order("name", { ascending: true });
      break;
    case "name-desc":
      query = query.order("name", { ascending: false });
      break;
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  if (!needsMinStockComparison) {
    query = query.range(from, to);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[adminProductService.listAdminProducts] failed:", error);
    throw new Error("Unable to load products right now.");
  }

  let rows = (data ?? []) as unknown as ProductListRow[];
  let totalCount = count ?? 0;

  if (needsMinStockComparison) {
    rows = rows.filter((row) =>
      filters.inventory === "low-stock"
        ? row.stock > 0 && row.stock <= row.min_stock_level
        : row.stock > row.min_stock_level,
    );
    totalCount = rows.length;
    rows = rows.slice(from, to + 1);
  }

  const items = rows.map(mapProductListRow);

  return {
    items,
    page: filters.page,
    pageSize: filters.pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / filters.pageSize)),
  };
}

export async function getAdminProductById(
  id: string,
): Promise<AdminProductDetail | null> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[adminProductService.getAdminProductById] failed:", error);
    throw new Error("Unable to load this product right now.");
  }
  if (!product) return null;

  const [imagesResult, variantsResult, orderItemsResult] = await Promise.all([
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", id)
      .order("display_order", { ascending: true }),
    supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("product_id", id),
  ]);

  if (imagesResult.error) throw imagesResult.error;
  if (variantsResult.error) throw variantsResult.error;
  if (orderItemsResult.error) throw orderItemsResult.error;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.short_description ?? "",
    description: product.description,
    categoryId: product.category_id,
    price: product.price,
    originalPrice: product.original_price,
    stock: product.stock,
    material: product.material ?? "",
    color: product.color ?? "",
    occasion: product.occasion ?? "",
    isActive: product.is_active,
    isFeatured: product.is_featured,
    sku: product.sku ?? "",
    costPrice: product.cost_price,
    minStockLevel: product.min_stock_level,
    maxStockLevel: product.max_stock_level,
    forceUnavailable: product.force_unavailable,
    primarySupplierId: product.primary_supplier_id,
    hasOrderHistory: (orderItemsResult.count ?? 0) > 0,
    images: (imagesResult.data ?? []).map((image) => ({
      id: image.id,
      imageUrl: image.image_url,
      altText: image.alt_text ?? "",
    })),
    variants: (variantsResult.data ?? []).map((variant) => ({
      id: variant.id,
      optionType: variant.option_type,
      optionValue: variant.option_value,
      priceAdjustment: variant.price_adjustment,
      stock: variant.stock,
      sku: variant.sku ?? "",
      imageUrl: variant.image_url ?? "",
      isActive: variant.is_active,
    })),
  };
}

async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient();
  let query = supabase.from("products").select("id").eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data !== null;
}

async function isSkuTaken(sku: string, excludeId?: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient();
  let query = supabase.from("products").select("id").eq("sku", sku);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data !== null;
}

const VARIANT_GROUP_LABELS: Record<string, string> = {
  color: "Color",
  size: "Size",
  style: "Style",
};

export async function createProduct(
  input: AdminProductInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();

  if (await isSlugTaken(input.slug)) {
    return { error: "A product with this slug already exists." };
  }
  if (input.sku.trim() && (await isSkuTaken(input.sku.trim()))) {
    return { error: "A product with this SKU already exists." };
  }

  const supabase = await getSupabaseServerClient();
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      slug: input.slug,
      short_description: input.shortDescription || null,
      description: input.description,
      category_id: input.categoryId,
      price: input.price,
      original_price: input.originalPrice,
      stock: input.stock,
      material: input.material || null,
      color: input.color || null,
      occasion: input.occasion || null,
      is_active: input.isActive,
      is_featured: input.isFeatured,
      // Omitted (undefined) rather than null when blank, so the database's
      // own generate_product_sku() trigger auto-fills a category-coded ID —
      // passing null would bypass that trigger's "already set?" check.
      sku: input.sku.trim() || undefined,
      cost_price: input.costPrice,
      min_stock_level: input.minStockLevel,
      max_stock_level: input.maxStockLevel,
      force_unavailable: input.forceUnavailable,
      primary_supplier_id: input.primarySupplierId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[adminProductService.createProduct] failed:", error);
    return { error: "Unable to create this product right now." };
  }

  try {
    await syncProductImagesAndVariants(product.id, input);
  } catch (syncError) {
    console.error(
      "[adminProductService.createProduct] image/variant sync failed:",
      syncError,
    );
    return {
      id: product.id,
      error:
        "Product created, but its images or variants couldn't be saved. Edit the product to try again.",
    };
  }
  return { id: product.id };
}

export async function updateProduct(
  id: string,
  input: AdminProductInput,
): Promise<{ error?: string }> {
  await requireAdmin();

  if (await isSlugTaken(input.slug, id)) {
    return { error: "A product with this slug already exists." };
  }
  if (input.sku.trim() && (await isSkuTaken(input.sku.trim(), id))) {
    return { error: "A product with this SKU already exists." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name,
      slug: input.slug,
      short_description: input.shortDescription || null,
      description: input.description,
      category_id: input.categoryId,
      price: input.price,
      original_price: input.originalPrice,
      stock: input.stock,
      material: input.material || null,
      color: input.color || null,
      occasion: input.occasion || null,
      is_active: input.isActive,
      is_featured: input.isFeatured,
      // On update the row already has a SKU (the insert-time trigger only
      // fires once), so an empty field here means "clear it back to null"
      // rather than "auto-generate" — unlike createProduct, this must be an
      // explicit null, not omitted.
      sku: input.sku.trim() || null,
      cost_price: input.costPrice,
      min_stock_level: input.minStockLevel,
      max_stock_level: input.maxStockLevel,
      force_unavailable: input.forceUnavailable,
      primary_supplier_id: input.primarySupplierId,
    })
    .eq("id", id);

  if (error) {
    console.error("[adminProductService.updateProduct] failed:", error);
    return { error: "Unable to update this product right now." };
  }

  try {
    await syncProductImagesAndVariants(id, input);
  } catch (syncError) {
    console.error(
      "[adminProductService.updateProduct] image/variant sync failed:",
      syncError,
    );
    return {
      error:
        "Product details were saved, but its images or variants couldn't be updated. Please try again.",
    };
  }
  return {};
}

async function syncProductImagesAndVariants(
  productId: string,
  input: AdminProductInput,
): Promise<void> {
  const supabase = await getSupabaseServerClient();

  const { error: deleteImagesError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  if (deleteImagesError) throw deleteImagesError;

  if (input.images.length > 0) {
    const { error: insertImagesError } = await supabase
      .from("product_images")
      .insert(
        input.images.map((image, index) => ({
          product_id: productId,
          image_url: image.imageUrl,
          alt_text: image.altText || null,
          display_order: index,
        })),
      );
    if (insertImagesError) throw insertImagesError;
  }

  const { error: deleteVariantsError } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId);
  if (deleteVariantsError) throw deleteVariantsError;

  if (input.variants.length > 0) {
    const { error: insertVariantsError } = await supabase
      .from("product_variants")
      .insert(
        input.variants.map((variant) => ({
          product_id: productId,
          name: VARIANT_GROUP_LABELS[variant.optionType],
          option_type: variant.optionType,
          option_value: variant.optionValue,
          price_adjustment: variant.priceAdjustment,
          stock: variant.stock,
          sku: variant.sku || null,
          image_url: variant.imageUrl || null,
          is_active: variant.isActive,
        })),
      );
    if (insertVariantsError) throw insertVariantsError;
  }
}

export async function setProductActive(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("[adminProductService.setProductActive] failed:", error);
    return { error: "Unable to update this product right now." };
  }
  return {};
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { count, error: countError } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);
  if (countError) throw countError;

  if ((count ?? 0) > 0) {
    return {
      error:
        "This product has order history and can't be deleted. Deactivate it instead.",
    };
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("[adminProductService.deleteProduct] failed:", error);
    return { error: "Unable to delete this product right now." };
  }
  return {};
}
