import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { AdminPageHeader, StatusBadge } from "@/components/admin";
import { buttonVariants } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { listAdminSocialPosts } from "@/lib/services/admin/adminSocialPostService";

export default async function AdminSocialPostsPage() {
  const posts = await listAdminSocialPosts();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Follow Our Style"
        description={`${posts.length} post${posts.length === 1 ? "" : "s"} in the homepage gallery`}
        action={
          <Link
            href="/admin/social-posts/new"
            className={buttonVariants("primary", "md")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Post
          </Link>
        }
      />

      <div className="rounded-sm border border-beige bg-white">
        {posts.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No posts yet. Add one to show it in the homepage gallery.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Post</th>
                  <th className="px-5 py-3 font-medium">Link</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-beige last:border-b-0"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-beige">
                          {post.imageUrl && (
                            <Image
                              src={post.imageUrl}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="font-body text-sm font-medium text-primary">
                          {post.alt}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-3 font-body text-sm text-muted">
                      {post.href || "Site default"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={post.isActive ? "active" : "inactive"}
                      />
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {post.displayOrder}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/social-posts/${post.id}`}
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
