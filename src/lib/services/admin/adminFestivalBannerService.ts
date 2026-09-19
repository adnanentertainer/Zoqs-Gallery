import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getSiteSetting } from "@/lib/services/settingsService";
import { DEFAULT_FESTIVAL_BANNER, type FestivalBanner } from "@/types/festivalBanner";

export async function getAdminFestivalBanner(): Promise<FestivalBanner> {
  await requireAdmin();

  const banner = await getSiteSetting<FestivalBanner>("festival_banner");
  return banner ?? DEFAULT_FESTIVAL_BANNER;
}

export async function updateAdminFestivalBanner(
  input: FestivalBanner,
): Promise<{ error?: string }> {
  await requireAdmin();

  const name = input.name.trim();
  const message = input.message.trim();
  const ctaLabel = input.ctaLabel.trim();
  const ctaHref = input.ctaHref.trim();

  if (input.isActive) {
    if (!name) return { error: "Festival name is required to go live." };
    if (!message) return { error: "Countdown message is required to go live." };
    if (!input.targetAt) return { error: "Target date & time is required to go live." };

    const targetTime = new Date(input.targetAt).getTime();
    if (Number.isNaN(targetTime)) {
      return { error: "Target date & time is invalid." };
    }
    if (targetTime <= Date.now()) {
      return { error: "Target date & time must be in the future." };
    }
    if ((ctaLabel && !ctaHref) || (!ctaLabel && ctaHref)) {
      return { error: "Provide both a button label and a link, or leave both blank." };
    }
  }

  const supabase = await getSupabaseServerClient();
  const value: FestivalBanner = {
    name,
    message,
    targetAt: input.targetAt,
    ctaLabel,
    ctaHref,
    isActive: input.isActive,
  };

  const { error } = await supabase
    .from("site_settings")
    .update({ value })
    .eq("key", "festival_banner");

  if (error) {
    console.error(
      "[adminFestivalBannerService.updateAdminFestivalBanner] failed:",
      error,
    );
    return { error: "Unable to save the festival banner right now." };
  }

  return {};
}
