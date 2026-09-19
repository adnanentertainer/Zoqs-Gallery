import { getActiveFestivalBanner } from "@/lib/services/festivalBannerService";
import { FestivalCountdownBar } from "@/components/layout/FestivalCountdownBar";

export async function FestivalCountdownBanner() {
  const banner = await getActiveFestivalBanner();
  if (!banner) return null;

  return <FestivalCountdownBar banner={banner} />;
}
