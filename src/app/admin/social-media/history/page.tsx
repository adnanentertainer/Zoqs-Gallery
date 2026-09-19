import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, Pagination } from "@/components/admin";
import { Badge } from "@/components/ui/Badge";
import { Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";
import { RetrySocialPostButton } from "@/components/admin/RetrySocialPostButton";
import { listProductSocialPosts } from "@/lib/services/admin/socialPostingService";
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
  title: "Social Posting History | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminSocialMediaHistoryPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;
  const flat = toFlatSearchParams(rawParams);
  const page = parsePage(flat.page);

  const result = await listProductSocialPosts(page, DEFAULT_ADMIN_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Social Posting History"
        description={`${result.totalCount} product${result.totalCount === 1 ? "" : "s"} posted or attempted`}
        action={
          <Link
            href="/admin/social-media"
            className={buttonVariants("outline", "md")}
          >
            Back to Settings
          </Link>
        }
      />

      <div className="rounded-sm border border-beige bg-white">
        {result.items.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No products have been posted yet.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Product</th>
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
                {result.items.map((post) => (
                  <tr key={post.id} className="border-b border-beige last:border-b-0">
                    <td className="px-5 py-3 font-body text-sm font-medium text-primary">
                      {post.productName ?? "Deleted product"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={socialPostStatusVariant(post.facebookStatus)}>
                        {socialPostStatusLabel(post.facebookStatus)}
                      </Badge>
                      {post.facebookError && (
                        <p className="mt-1 max-w-[220px] font-body text-xs text-error">
                          {post.facebookError}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={socialPostStatusVariant(post.instagramStatus)}>
                        {socialPostStatusLabel(post.instagramStatus)}
                      </Badge>
                      {post.instagramError && (
                        <p className="mt-1 max-w-[220px] font-body text-xs text-error">
                          {post.instagramError}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {post.postedAt
                        ? new Date(post.postedAt).toLocaleString("en-PK")
                        : "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {post.retryCount}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <RetrySocialPostButton
                        productId={post.productId}
                        productName={post.productName ?? "this product"}
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
            basePath="/admin/social-media/history"
            searchParams={flat}
          />
        </div>
      </div>
    </div>
  );
}
