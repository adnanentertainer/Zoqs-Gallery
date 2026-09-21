import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { AdminPageHeader, StatusBadge } from "@/components/admin";
import { buttonVariants } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { PromoBannerRowActions } from "@/components/admin/PromoBannerRowActions";
import { listAdminPromoBanners } from "@/lib/services/admin/adminPromoBannerService";

export const metadata: Metadata = {
  title: "Promo Banners | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminPromoBannersPage() {
  const banners = await listAdminPromoBanners();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Promo Banners"
        description={`${banners.length} banner${banners.length === 1 ? "" : "s"} total`}
        action={
          <Link
            href="/admin/promo-banners/new"
            className={buttonVariants("primary", "md")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Banner
          </Link>
        }
      />

      <div className="rounded-sm border border-beige bg-white">
        {banners.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No promotional banners yet.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Preview</th>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Promo Code</th>
                  <th className="px-5 py-3 font-medium">Starts</th>
                  <th className="px-5 py-3 font-medium">Ends</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr
                    key={banner.id}
                    className="border-b border-beige last:border-b-0"
                  >
                    <td className="px-5 py-3">
                      <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-sm bg-beige">
                        {banner.bannerImageUrl && (
                          <Image
                            src={banner.bannerImageUrl}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-body text-sm font-medium text-primary">
                      {banner.title}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {banner.promoCode ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {banner.startsAt
                        ? new Date(banner.startsAt).toLocaleDateString("en-PK")
                        : "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {banner.endsAt
                        ? new Date(banner.endsAt).toLocaleDateString("en-PK")
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={banner.isActive ? "active" : "inactive"}
                      />
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {banner.displayOrder}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <PromoBannerRowActions
                        bannerId={banner.id}
                        title={banner.title}
                        isActive={banner.isActive}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
