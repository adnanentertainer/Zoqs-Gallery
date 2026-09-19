import { getSiteSetting } from "@/lib/services/settingsService";
import type { FestivalBanner } from "@/types/festivalBanner";

/**
 * Public read used by the storefront layout. Returns null whenever there is
 * nothing to show — admin turned it off, no target date was set yet, or the
 * target date has already passed — so callers can just render-or-skip
 * without re-checking the flags themselves. The client-side countdown still
 * hides the banner the instant it hits zero without a new page load; this
 * check is what stops an already-expired banner from appearing on the next
 * fresh page request if the admin forgets to turn it off.
 */
export async function getActiveFestivalBanner(): Promise<FestivalBanner | null> {
  const banner = await getSiteSetting<FestivalBanner>("festival_banner");
  if (!banner || !banner.isActive || !banner.targetAt) return null;

  const targetTime = new Date(banner.targetAt).getTime();
  if (Number.isNaN(targetTime) || targetTime <= Date.now()) return null;

  return banner;
}
