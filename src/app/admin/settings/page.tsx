import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { Heading, Text } from "@/components/ui/Typography";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { FestivalBannerForm } from "@/components/admin/FestivalBannerForm";
import { DefaultHeroImageForm } from "@/components/admin/DefaultHeroImageForm";
import { BridalBannerImageForm } from "@/components/admin/BridalBannerImageForm";
import { BlessedFridayOfferForm } from "@/components/admin/BlessedFridayOfferForm";
import { SaleOfferForm } from "@/components/admin/SaleOfferForm";
import { WeddingPromotionForm } from "@/components/admin/WeddingPromotionForm";
import { getAdminStoreSettings } from "@/lib/services/admin/adminSettingsService";
import { getAdminFestivalBanner } from "@/lib/services/admin/adminFestivalBannerService";
import { getAdminDefaultHeroImage } from "@/lib/services/admin/adminHeroImageService";
import { getAdminBridalBannerImage } from "@/lib/services/admin/adminBridalBannerImageService";
import { getAdminBlessedFridayOffer } from "@/lib/services/admin/adminBlessedFridayOfferService";
import { getAdminSaleOffer } from "@/lib/services/admin/adminSaleOfferService";
import { getAdminWeddingPromotionSettings } from "@/lib/services/admin/adminWeddingPromotionService";

export const metadata: Metadata = {
  title: "Settings | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const [
    settings,
    festivalBanner,
    defaultHeroImage,
    bridalBannerImage,
    saleOffer,
    blessedFridayOffer,
    weddingPromotion,
  ] = await Promise.all([
    getAdminStoreSettings(),
    getAdminFestivalBanner(),
    getAdminDefaultHeroImage(),
    getAdminBridalBannerImage(),
    getAdminSaleOffer(),
    getAdminBlessedFridayOffer(),
    getAdminWeddingPromotionSettings(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Store Settings"
        description="These settings control the public storefront."
      />
      <SettingsForm initialValues={settings} />

      <div className="mt-4">
        <Heading variant="h3" as="h2">
          Sale
        </Heading>
        <Text variant="bodySm" className="mt-1 text-muted">
          A general, schedulable sitewide sale (e.g. &quot;11.11&quot;) —
          automatic, no promo code needed. Optionally pre-set a date range in
          advance and enable it anytime; while active, it takes priority
          over the Blessed Friday offer below.
        </Text>
      </div>
      <SaleOfferForm initialValues={saleOffer} />

      <div className="mt-4">
        <Heading variant="h3" as="h2">
          Blessed Friday Offer
        </Heading>
        <Text variant="bodySm" className="mt-1 text-muted">
          An automatic, no-promo-code discount applied at checkout on orders
          above a minimum spend.
        </Text>
      </div>
      <BlessedFridayOfferForm initialValues={blessedFridayOffer} />

      <div className="mt-4">
        <Heading variant="h3" as="h2">
          Wedding Season Promotion
        </Heading>
        <Text variant="bodySm" className="mt-1 text-muted">
          The homepage banner and featured section for the wedding collection.
        </Text>
      </div>
      <WeddingPromotionForm initialValues={weddingPromotion} />

      <div className="mt-4">
        <Heading variant="h3" as="h2">
          Festival Countdown Banner
        </Heading>
        <Text variant="bodySm" className="mt-1 text-muted">
          Show a site-wide countdown banner for an upcoming sale — Eid,
          Basant, or any other festival.
        </Text>
      </div>
      <FestivalBannerForm initialValues={festivalBanner} />

      <div className="mt-4">
        <Heading variant="h3" as="h2">
          Homepage Hero Image
        </Heading>
        <Text variant="bodySm" className="mt-1 text-muted">
          Change the homepage hero photo outside of any scheduled promo
          event.
        </Text>
      </div>
      <DefaultHeroImageForm initialValue={defaultHeroImage} />

      <div className="mt-4">
        <Heading variant="h3" as="h2">
          Bridal Collection Banner Image
        </Heading>
        <Text variant="bodySm" className="mt-1 text-muted">
          The photo used by the homepage&apos;s Bridal Collection Banner
          section (see Admin → Layout for its layout variants).
        </Text>
      </div>
      <BridalBannerImageForm initialValue={bridalBannerImage} />
    </div>
  );
}
