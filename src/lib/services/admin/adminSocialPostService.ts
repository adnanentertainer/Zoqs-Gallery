import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type {
  AdminSocialPostInput,
  AdminSocialPostListItem,
} from "@/types/admin";

export async function listAdminSocialPosts(): Promise<
  AdminSocialPostListItem[]
> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("social_posts")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error(
      "[adminSocialPostService.listAdminSocialPosts] failed:",
      error,
    );
    throw new Error("Unable to load social posts right now.");
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    imageUrl: row.image_url,
    alt: row.alt,
    href: row.href,
    isActive: row.is_active,
    displayOrder: row.display_order,
  }));
}

export async function getAdminSocialPostById(
  id: string,
): Promise<(AdminSocialPostInput & { id: string }) | null> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("social_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(
      "[adminSocialPostService.getAdminSocialPostById] failed:",
      error,
    );
    throw new Error("Unable to load this post right now.");
  }
  if (!data) return null;

  return {
    id: data.id,
    imageUrl: data.image_url,
    alt: data.alt,
    href: data.href ?? "",
    isActive: data.is_active,
    displayOrder: data.display_order,
  };
}

export async function createSocialPost(
  input: AdminSocialPostInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("social_posts")
    .insert({
      image_url: input.imageUrl,
      alt: input.alt,
      href: input.href || null,
      is_active: input.isActive,
      display_order: input.displayOrder,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[adminSocialPostService.createSocialPost] failed:", error);
    return { error: "Unable to create this post right now." };
  }
  return { id: data.id };
}

export async function updateSocialPost(
  id: string,
  input: AdminSocialPostInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("social_posts")
    .update({
      image_url: input.imageUrl,
      alt: input.alt,
      href: input.href || null,
      is_active: input.isActive,
      display_order: input.displayOrder,
    })
    .eq("id", id);

  if (error) {
    console.error("[adminSocialPostService.updateSocialPost] failed:", error);
    return { error: "Unable to update this post right now." };
  }
  return {};
}

export async function deleteSocialPost(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.from("social_posts").delete().eq("id", id);
  if (error) {
    console.error("[adminSocialPostService.deleteSocialPost] failed:", error);
    return { error: "Unable to delete this post right now." };
  }
  return {};
}
