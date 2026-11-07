import { revalidateTag } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getSiteSetting } from "@/lib/services/settingsService";
import { CACHE_TAGS } from "@/lib/cache/tags";
import {
  CATEGORY_LAYOUTS,
  DEFAULT_LAYOUT_TEMPLATE,
  HERO_LAYOUTS,
  isCategoryLayoutId,
  isHeroLayoutId,
  type LayoutTemplate,
} from "@/types/layoutTemplate";

export async function getAdminLayoutTemplate(): Promise<LayoutTemplate> {
  await requireAdmin();
  const stored = await getSiteSetting<Partial<LayoutTemplate>>(
    "layout_template",
  );

  return {
    hero:
      stored?.hero && isHeroLayoutId(stored.hero)
        ? stored.hero
        : DEFAULT_LAYOUT_TEMPLATE.hero,
    categories:
      stored?.categories && isCategoryLayoutId(stored.categories)
        ? stored.categories
        : DEFAULT_LAYOUT_TEMPLATE.categories,
  };
}

export async function updateAdminLayoutTemplate(
  template: LayoutTemplate,
): Promise<{ error?: string }> {
  await requireAdmin();

  if (!HERO_LAYOUTS.some((layout) => layout.id === template.hero)) {
    return { error: "Not a valid hero layout." };
  }
  if (
    !CATEGORY_LAYOUTS.some((layout) => layout.id === template.categories)
  ) {
    return { error: "Not a valid category layout." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("site_settings")
    .update({ value: template })
    .eq("key", "layout_template");

  if (error) {
    console.error(
      "[adminLayoutTemplateService.updateAdminLayoutTemplate] failed:",
      error,
    );
    return { error: "Unable to save the layout template right now." };
  }

  revalidateTag(CACHE_TAGS.siteSettings, { expire: 0 });
  return {};
}
