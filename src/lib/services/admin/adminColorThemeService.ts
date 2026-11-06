import { revalidateTag } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getSiteSetting } from "@/lib/services/settingsService";
import { CACHE_TAGS } from "@/lib/cache/tags";
import {
  COLOR_THEMES,
  DAYS_OF_WEEK,
  DEFAULT_COLOR_THEME_ID,
  DEFAULT_COLOR_THEME_SCHEDULE,
  getColorThemeById,
  resolveScheduledThemeId,
  type ColorThemeSchedule,
} from "@/types/colorTheme";

export async function getAdminColorThemeId(): Promise<string> {
  await requireAdmin();
  return (
    (await getSiteSetting<string>("color_theme")) ?? DEFAULT_COLOR_THEME_ID
  );
}

export async function getAdminColorThemeSchedule(): Promise<ColorThemeSchedule> {
  await requireAdmin();
  const stored = await getSiteSetting<Partial<ColorThemeSchedule>>(
    "color_theme_schedule",
  );
  return {
    ...DEFAULT_COLOR_THEME_SCHEDULE,
    ...stored,
    days: { ...DEFAULT_COLOR_THEME_SCHEDULE.days, ...stored?.days },
  };
}

/** What's actually live right now, given the current base theme + schedule
 * -- shown on /admin/theme so an admin enabling the schedule can see today's
 * result immediately instead of having to reason about it themselves. */
export async function getAdminTodayResolvedThemeId(): Promise<string> {
  await requireAdmin();
  const [baseThemeId, schedule] = await Promise.all([
    getAdminColorThemeId(),
    getAdminColorThemeSchedule(),
  ]);
  return resolveScheduledThemeId(baseThemeId, schedule);
}

export async function updateAdminColorTheme(
  themeId: string,
): Promise<{ error?: string }> {
  await requireAdmin();

  // Reject an id that doesn't match a known theme rather than saving it
  // and silently falling back to Default on every future page load --
  // the admin picker only ever sends one of these ids, so this only
  // matters against a crafted direct request.
  if (!COLOR_THEMES.some((theme) => theme.id === themeId)) {
    return { error: "Not a valid theme." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("site_settings")
    .update({ value: themeId })
    .eq("key", "color_theme");

  if (error) {
    console.error(
      "[adminColorThemeService.updateAdminColorTheme] failed:",
      error,
    );
    return { error: "Unable to save the color theme right now." };
  }

  revalidateTag(CACHE_TAGS.siteSettings, { expire: 0 });
  return {};
}

export async function updateAdminColorThemeSchedule(
  input: ColorThemeSchedule,
): Promise<{ error?: string }> {
  await requireAdmin();

  for (const day of DAYS_OF_WEEK) {
    const themeId = input.days[day];
    if (themeId !== null && !COLOR_THEMES.some((t) => t.id === themeId)) {
      return { error: `"${day}" isn't set to a valid theme.` };
    }
  }

  const value: ColorThemeSchedule = {
    enabled: input.enabled,
    days: Object.fromEntries(
      DAYS_OF_WEEK.map((day) => [day, input.days[day]]),
    ) as ColorThemeSchedule["days"],
  };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("site_settings")
    .update({ value })
    .eq("key", "color_theme_schedule");

  if (error) {
    console.error(
      "[adminColorThemeService.updateAdminColorThemeSchedule] failed:",
      error,
    );
    return { error: "Unable to save the color theme schedule right now." };
  }

  revalidateTag(CACHE_TAGS.siteSettings, { expire: 0 });
  return {};
}

export { COLOR_THEMES, getColorThemeById };
