import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { AdminPageHeader, StatusBadge } from "@/components/admin";
import { buttonVariants } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { listAdminHeroImages } from "@/lib/services/admin/adminHeroCarouselService";

export const metadata: Metadata = {
  title: "Hero Carousel | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminHeroImagesPage() {
  const images = await listAdminHeroImages();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Hero Carousel"
        description={`${images.length} image${images.length === 1 ? "" : "s"} — rotates automatically on the homepage hero when 2 or more are active.`}
        action={
          <Link
            href="/admin/hero-images/new"
            className={buttonVariants("primary", "md")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Image
          </Link>
        }
      />

      <Text variant="bodySm" className="text-muted">
        Shown by the Classic Split, Centered Spotlight, Editorial Full-Bleed,
        Side Panel and Floating Badge hero layouts (Admin → Layout). Leave
        empty to keep showing the single Homepage Hero Image (Admin →
        Settings) instead.
      </Text>

      <div className="rounded-sm border border-beige bg-white">
        {images.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No carousel images yet. Add at least two to enable
            auto-scrolling.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Preview</th>
                  <th className="px-5 py-3 font-medium">Alt Text</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {images.map((image) => (
                  <tr
                    key={image.id}
                    className="border-b border-beige last:border-b-0"
                  >
                    <td className="px-5 py-3">
                      <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-sm bg-beige">
                        {image.imageUrl && (
                          <Image
                            src={image.imageUrl}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="max-w-[260px] truncate px-5 py-3 font-body text-sm text-primary">
                      {image.altText || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={image.isActive ? "active" : "inactive"}
                      />
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {image.displayOrder}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/hero-images/${image.id}`}
                        className="font-body text-sm font-medium text-gold hover:underline"
                      >
                        Edit
                      </Link>
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
