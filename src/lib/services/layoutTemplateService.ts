import { getSiteSetting } from "@/lib/services/settingsService";
import {
  DEFAULT_LAYOUT_TEMPLATE,
  isCategoryLayoutId,
  isHeroLayoutId,
  type LayoutTemplate,
} from "@/types/layoutTemplate";

/**
 * Always returns a full, valid LayoutTemplate (never null/undefined) --
 * same "resolve to a safe default" convention as getActiveColorTheme().
 * Validates each section's id independently so a stale/removed variant id
 * in one section never breaks the other section's layout.
 */
export async function getActiveLayoutTemplate(): Promise<LayoutTemplate> {
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
