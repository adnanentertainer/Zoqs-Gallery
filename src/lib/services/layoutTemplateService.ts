import { getSiteSetting } from "@/lib/services/settingsService";
import {
  resolveLayoutTemplate,
  type LayoutTemplate,
} from "@/types/layoutTemplate";

/**
 * Always returns a full, valid LayoutTemplate (never null/undefined) --
 * same "resolve to a safe default" convention as getActiveColorTheme().
 */
export async function getActiveLayoutTemplate(): Promise<LayoutTemplate> {
  const stored = await getSiteSetting<Partial<LayoutTemplate>>(
    "layout_template",
  );
  return resolveLayoutTemplate(stored);
}
