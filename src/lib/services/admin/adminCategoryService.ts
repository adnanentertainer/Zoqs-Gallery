import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type { AdminCategoryListItem } from "@/types/admin";

export interface AdminCategoryInput {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  displayOrder: number;
}

export async function listAdminCategories(
  search?: string,
): Promise<AdminCategoryListItem[]> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (search?.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[adminCategoryService.listAdminCategories] failed:", error);
    throw new Error("Unable to load categories right now.");
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    imageUrl: row.image_url,
    productCount: row.product_count,
    isActive: row.is_active,
    displayOrder: row.display_order,
  }));
}

export async function getAdminCategoryById(
  id: string,
): Promise<(AdminCategoryInput & { id: string }) | null> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[adminCategoryService.getAdminCategoryById] failed:", error);
    throw new Error("Unable to load this category right now.");
  }
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description ?? "",
    imageUrl: data.image_url ?? "",
    isActive: data.is_active,
    displayOrder: data.display_order,
  };
}

async function isCategorySlugTaken(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const supabase = await getSupabaseServerClient();
  let query = supabase.from("categories").select("id").eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data !== null;
}

export async function createCategory(
  input: AdminCategoryInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();

  if (await isCategorySlugTaken(input.slug)) {
    return { error: "A category with this slug already exists." };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      image_url: input.imageUrl || null,
      is_active: input.isActive,
      display_order: input.displayOrder,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[adminCategoryService.createCategory] failed:", error);
    return { error: "Unable to create this category right now." };
  }
  return { id: data.id };
}

export async function updateCategory(
  id: string,
  input: AdminCategoryInput,
): Promise<{ error?: string }> {
  await requireAdmin();

  if (await isCategorySlugTaken(input.slug, id)) {
    return { error: "A category with this slug already exists." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      image_url: input.imageUrl || null,
      is_active: input.isActive,
      display_order: input.displayOrder,
    })
    .eq("id", id);

  if (error) {
    console.error("[adminCategoryService.updateCategory] failed:", error);
    return { error: "Unable to update this category right now." };
  }
  return {};
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if (countError) throw countError;

  if ((count ?? 0) > 0) {
    return {
      error:
        "This category still has products assigned to it. Reassign or remove those products first.",
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    console.error("[adminCategoryService.deleteCategory] failed:", error);
    return { error: "Unable to delete this category right now." };
  }
  return {};
}
