import { unstable_cache } from "next/cache";
import { categories as mockCategories } from "@/data/categories";
import { getCategoryBySlug as getMockCategoryBySlug } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabasePublicClient } from "@/lib/supabase/server";
import { mapCategoryRow } from "@/lib/supabase/mappers";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { Category } from "@/types";

const getCategoriesUncached = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapCategoryRow);
  },
  ["categories:active"],
  { tags: [CACHE_TAGS.categories], revalidate: 300 },
);

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return mockCategories;
  }

  try {
    return await getCategoriesUncached();
  } catch (error) {
    console.error(
      "[categoryService.getCategories] Supabase query failed:",
      error,
    );
    throw new Error("Unable to load categories right now.");
  }
}

const getCategoryBySlugUncached = unstable_cache(
  async (slug: string): Promise<Category | undefined> => {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    return data ? mapCategoryRow(data) : undefined;
  },
  ["categories:by-slug"],
  { tags: [CACHE_TAGS.categories], revalidate: 300 },
);

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  if (!isSupabaseConfigured()) {
    return getMockCategoryBySlug(slug);
  }

  try {
    return await getCategoryBySlugUncached(slug);
  } catch (error) {
    console.error(
      "[categoryService.getCategoryBySlug] Supabase query failed:",
      error,
    );
    throw new Error("Unable to load this category right now.");
  }
}
