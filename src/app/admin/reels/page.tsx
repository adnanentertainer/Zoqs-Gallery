import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader, Pagination } from "@/components/admin";
import { Badge } from "@/components/ui/Badge";
import { Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";
import { RetryReelButton } from "@/components/admin/RetryReelButton";
import { listProductReels } from "@/lib/services/admin/reelPostingService";
import {
  socialPostStatusLabel,
  socialPostStatusVariant,
} from "@/lib/admin/socialPostStatus";
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  parsePage,
  toFlatSearchParams,
  type RawSearchParams,
} from "@/lib/admin/searchParams";

export const metadata: Metadata = {
  title: "Reels | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminReelsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;
  const flat = toFlatSearchParams(rawParams);
  const page = parsePage(flat.page);

  const result = await listProductReels(page, DEFAULT_ADMIN_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Reels"
        description={`${result.totalCount} reel${result.totalCount === 1 ? "" : "s"} published or attempted`}
        action={
          <Link href="/admin/reels/new" className={buttonVariants("primary", "md")}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Publish Reel
          </Link>
        }
      />

      <div className="rounded-sm border border-beige bg-white">
        {result.items.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No reels published yet.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Video</th>
                  <th className="px-5 py-3 font-medium">Facebook</th>
                  <th className="px-5 py-3 font-medium">Instagram</th>
                  <th className="px-5 py-3 font-medium">Posted At</th>
                  <th className="px-5 py-3 font-medium">Retries</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((reel) => (
                  <tr key={reel.id} className="border-b border-beige last:border-b-0">
                    <td className="px-5 py-3 font-body text-sm font-medium text-primary">
                      {reel.productName ?? "Deleted product"}
                    </td>
                    <td className="max-w-[220px] px-5 py-3">
                      <a
                        href={reel.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate font-body text-sm text-gold hover:underline"
                      >
                        {reel.videoUrl}
                      </a>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={socialPostStatusVariant(reel.facebookStatus)}>
                        {socialPostStatusLabel(reel.facebookStatus)}
                      </Badge>
                      {reel.facebookError && (
                        <p className="mt-1 max-w-[220px] font-body text-xs text-error">
                          {reel.facebookError}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={socialPostStatusVariant(reel.instagramStatus)}>
                        {socialPostStatusLabel(reel.instagramStatus)}
                      </Badge>
                      {reel.instagramError && (
                        <p className="mt-1 max-w-[220px] font-body text-xs text-error">
                          {reel.instagramError}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {reel.postedAt
                        ? new Date(reel.postedAt).toLocaleString("en-PK")
                        : "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {reel.retryCount}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <RetryReelButton
                        reelId={reel.id}
                        productName={reel.productName ?? "this product"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 pb-5">
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/reels"
            searchParams={flat}
          />
        </div>
      </div>
    </div>
  );
}
