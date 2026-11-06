export interface ColorThemeTokens {
  /** Body text, headings — overrides --color-charcoal. */
  primary: string;
  /** Page background — overrides --color-cream. */
  secondary: string;
  /** CTAs, focus rings, the "gold" accent everywhere in the UI — overrides
   * --color-gold. Every value here is pre-checked at >= 4.5:1 contrast on
   * white, the same bar the original gold/maroon were tuned to. */
  accent: string;
  /** Card/section surface tint, borders — overrides --color-beige. */
  beige: string;
  /** Secondary text (prices' "of", captions, timestamps) — overrides
   * --color-muted. */
  muted: string;
}

export interface ColorTheme {
  id: string;
  name: string;
  mood: string;
  tokens: ColorThemeTokens;
}

// Maroon (Wedding Collection accent), success, and error are deliberately
// NOT themed -- maroon is a fixed bridal-red brand element independent of
// the general theme, and success/error are functional (cart/form) colors
// that should mean the same thing regardless of which theme is active.
export const COLOR_THEMES: ColorTheme[] = [
  {
    id: "default",
    name: "Default",
    mood: "Ivory & antique gold -- what the site uses today.",
    tokens: {
      primary: "#1c1a17",
      secondary: "#faf6ef",
      accent: "#8a6a24",
      beige: "#ece3d3",
      muted: "#6f6a61",
    },
  },
  {
    id: "rose-gold",
    name: "Rose Gold & Blush",
    mood: "Romantic, feminine, bridal-shower soft.",
    tokens: {
      primary: "#241a1c",
      secondary: "#fdf3f0",
      accent: "#9c5f4a",
      beige: "#f3e0da",
      muted: "#756560",
    },
  },
  {
    id: "emerald-gold",
    name: "Emerald & Gold",
    mood: "Rich jewel-tone, classic bridal green.",
    tokens: {
      primary: "#141f18",
      secondary: "#f6f8f4",
      accent: "#1a5c3f",
      beige: "#e3ebe0",
      muted: "#5f6b62",
    },
  },
  {
    id: "royal-sapphire",
    name: "Royal Sapphire & Gold",
    mood: "Regal, cool, formal-occasion elegant.",
    tokens: {
      primary: "#141a24",
      secondary: "#f5f7fa",
      accent: "#243f66",
      beige: "#e2e7ef",
      muted: "#5f6672",
    },
  },
  {
    id: "ruby-champagne",
    name: "Ruby & Champagne",
    mood: "Bold bridal red, festive and warm.",
    tokens: {
      primary: "#1f1315",
      secondary: "#fbf3ee",
      accent: "#7a1a35",
      beige: "#f0e2de",
      muted: "#6f6360",
    },
  },
  {
    id: "antique-copper",
    name: "Antique Copper & Ivory",
    mood: "Warm metallic alternative to gold, earthy.",
    tokens: {
      primary: "#1e1712",
      secondary: "#f8f4ee",
      accent: "#8a4a28",
      beige: "#ecdfd1",
      muted: "#6b5c52",
    },
  },
  {
    id: "plum-rose-gold",
    name: "Plum & Rose Gold",
    mood: "Modern, moody, evening-wear elegant.",
    tokens: {
      primary: "#1d1620",
      secondary: "#f8f4f7",
      accent: "#5e3152",
      beige: "#ece3e8",
      muted: "#6a616a",
    },
  },
  {
    id: "peacock-teal",
    name: "Peacock Teal & Gold",
    mood: "Distinctive, ties to the Royal Peacock sets.",
    tokens: {
      primary: "#0c1a1a",
      secondary: "#f3f8f7",
      accent: "#0b5c5c",
      beige: "#dce8e6",
      muted: "#5a6866",
    },
  },
  {
    id: "onyx-silver",
    name: "Onyx & Silver",
    mood: "Cool monochrome, fits silver/stainless pieces.",
    tokens: {
      primary: "#15171a",
      secondary: "#f6f7f8",
      accent: "#3e4750",
      beige: "#e3e6e9",
      muted: "#5c6670",
    },
  },
  {
    id: "honey-amber",
    name: "Honey Amber & Ivory",
    mood: "Warmer, more orange-toned than the default gold.",
    tokens: {
      primary: "#201a12",
      secondary: "#faf5ec",
      accent: "#8a5212",
      beige: "#efe3cd",
      muted: "#74645a",
    },
  },
];

export const DEFAULT_COLOR_THEME_ID = "default";

export function getColorThemeById(id: string): ColorTheme {
  return COLOR_THEMES.find((theme) => theme.id === id) ?? COLOR_THEMES[0];
}

export const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

/**
 * Optional day-of-week rotation layered on top of the single `color_theme`
 * setting. When disabled (or a given day has no theme assigned), that day
 * just uses `color_theme` -- the base setting is never a dead option, it's
 * the schedule's own fallback. `null` means "no override for this day",
 * distinct from a theme id, so a day can be deliberately left on the
 * fallback without the admin having to pick "Default" explicitly.
 */
export interface ColorThemeSchedule {
  enabled: boolean;
  days: Record<DayOfWeek, string | null>;
}

export const DEFAULT_COLOR_THEME_SCHEDULE: ColorThemeSchedule = {
  enabled: false,
  days: {
    sunday: null,
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
  },
};

// Pakistan Standard Time -- the storefront's own locale (siteConfig.country
// is "Pakistan"), not the server's timezone, which on Vercel is UTC and
// would otherwise flip "today" at the wrong hour for every visitor.
const SITE_TIME_ZONE = "Asia/Karachi";

export function getCurrentDayOfWeek(now: Date = new Date()): DayOfWeek {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: SITE_TIME_ZONE,
    weekday: "long",
  }).format(now);
  return weekday.toLowerCase() as DayOfWeek;
}

/**
 * Resolves the schedule + base theme id down to the one theme id that
 * should actually be live right now. The only place this logic lives --
 * both the public storefront read and the admin "active today" preview
 * call this, so they can never disagree.
 */
export function resolveScheduledThemeId(
  baseThemeId: string,
  schedule: ColorThemeSchedule,
  now: Date = new Date(),
): string {
  if (!schedule.enabled) return baseThemeId;
  const today = getCurrentDayOfWeek(now);
  return schedule.days[today] ?? baseThemeId;
}
