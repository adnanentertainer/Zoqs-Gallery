import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { SocialPostForm } from "@/components/admin/SocialPostForm";
import { listProductOptions } from "@/lib/services/admin/adminProductService";

export const metadata: Metadata = {
  title: "New Post | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function NewSocialPostPage() {
  const productOptions = await listProductOptions();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Add Post"
        description="Add a post to the homepage's Follow Our Style gallery."
      />
      <SocialPostForm mode="create" productOptions={productOptions} />
    </div>
  );
}
