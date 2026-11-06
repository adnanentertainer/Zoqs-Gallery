import { getSiteSetting } from "@/lib/services/settingsService";
import {
  getColorThemeById,
  resolveScheduledThemeId,
  DEFAULT_COLOR_THEME_ID,
  DEFAULT_COLOR_THEME_SCHEDULE,
  type ColorTheme,
  type ColorThemeSchedule,
} from "@/types/colorTheme";

/**
 * Always returns a full theme object (never null/undefined) -- same
 * "resolve to a safe default" convention as getWeddingPromotionSettings().
 * Applies the day-of-week schedule (if enabled) on top of the manually
 * picked theme before resolving to the actual ColorTheme -- see
 * resolveScheduledThemeId() for the one place that logic lives. An unset
 * or stale/removed theme id (e.g. a theme later deleted from the
 * COLOR_THEMES list) safely falls back to Default via getColorThemeById().
 */
export async function getActiveColorTheme(): Promise<ColorTheme> {
  const [baseThemeId, schedule] = await Promise.all([
    getSiteSetting<string>("color_theme"),
    getSiteSetting<ColorThemeSchedule>("color_theme_schedule"),
  ]);

  // Spread over the defaults (not a bare `?? default`), including the
  // nested `days` map, so a schedule saved before a day existed in
  // DAYS_OF_WEEK still resolves that day to null instead of undefined.
  const resolvedThemeId = resolveScheduledThemeId(
    baseThemeId ?? DEFAULT_COLOR_THEME_ID,
    {
      ...DEFAULT_COLOR_THEME_SCHEDULE,
      ...schedule,
      days: { ...DEFAULT_COLOR_THEME_SCHEDULE.days, ...schedule?.days },
    },
  );
  return getColorThemeById(resolvedThemeId);
}
