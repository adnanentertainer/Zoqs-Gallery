import { categories as mockCategories } from "@/data/categories";
import { getCategoryBySlug as getMockCategoryBySlug } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapCategoryRow } from "@/lib/supabase/mappers";
import type { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return mockCategories;
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapCategoryRow);
  } catch (error) {
    console.error(
      "[categoryService.getCategories] Supabase query failed:",
      error,
    );
    throw new Error("Unable to load categories right now.");
  }
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  if (!isSupabaseConfigured()) {
    return getMockCategoryBySlug(slug);
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    return data ? mapCategoryRow(data) : undefined;
  } catch (error) {
    console.error(
      "[categoryService.getCategoryBySlug] Supabase query failed:",
      error,
    );
    throw new Error("Unable to load this category right now.");
  }
}
