import { revalidateTag } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getSiteSetting } from "@/lib/services/settingsService";
import { CACHE_TAGS } from "@/lib/cache/tags";
import {
  BENEFITS_LAYOUTS,
  BRIDAL_LAYOUTS,
  CATEGORY_LAYOUTS,
  HERO_LAYOUTS,
  PRODUCT_LAYOUTS,
  resolveLayoutTemplate,
  REVIEWS_LAYOUTS,
  SOCIAL_GALLERY_LAYOUTS,
  type LayoutTemplate,
} from "@/types/layoutTemplate";

export async function getAdminLayoutTemplate(): Promise<LayoutTemplate> {
  await requireAdmin();
  const stored = await getSiteSetting<Partial<LayoutTemplate>>(
    "layout_template",
  );
  return resolveLayoutTemplate(stored);
}

export async function updateAdminLayoutTemplate(
  template: LayoutTemplate,
): Promise<{ error?: string }> {
  await requireAdmin();

  const checks: [string, boolean][] = [
    ["hero layout", HERO_LAYOUTS.some((l) => l.id === template.hero)],
    [
      "category layout",
      CATEGORY_LAYOUTS.some((l) => l.id === template.categories),
    ],
    ["product layout", PRODUCT_LAYOUTS.some((l) => l.id === template.products)],
    ["bridal layout", BRIDAL_LAYOUTS.some((l) => l.id === template.bridal)],
    [
      "benefits layout",
      BENEFITS_LAYOUTS.some((l) => l.id === template.benefits),
    ],
    ["reviews layout", REVIEWS_LAYOUTS.some((l) => l.id === template.reviews)],
    [
      "social gallery layout",
      SOCIAL_GALLERY_LAYOUTS.some((l) => l.id === template.socialGallery),
    ],
  ];
  const invalid = checks.find(([, isValid]) => !isValid);
  if (invalid) {
    return { error: `Not a valid ${invalid[0]}.` };
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
