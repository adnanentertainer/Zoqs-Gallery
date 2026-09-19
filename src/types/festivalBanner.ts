export interface FestivalBanner {
  name: string;
  message: string;
  // ISO 8601 datetime string (from a <input type="datetime-local">), or null
  // when no target has been set yet.
  targetAt: string | null;
  ctaLabel: string;
  ctaHref: string;
  isActive: boolean;
}

export const DEFAULT_FESTIVAL_BANNER: FestivalBanner = {
  name: "",
  message: "Sale starts in",
  targetAt: null,
  ctaLabel: "",
  ctaHref: "",
  isActive: false,
};
