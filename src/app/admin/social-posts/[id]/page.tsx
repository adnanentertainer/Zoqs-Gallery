import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin";
import { SocialPostForm } from "@/components/admin/SocialPostForm";
import { getAdminSocialPostById } from "@/lib/services/admin/adminSocialPostService";

export const metadata: Metadata = {
  title: "Edit Post | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

interface EditSocialPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSocialPostPage({
  params,
}: EditSocialPostPageProps) {
  const { id } = await params;
  const post = await getAdminSocialPostById(id);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Edit Post" description={post.alt} />
      <SocialPostForm mode="edit" postId={post.id} initialValues={post} />
    </div>
  );
}
