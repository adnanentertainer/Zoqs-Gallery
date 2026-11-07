import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin";
import { HeroImageForm } from "@/components/admin/HeroImageForm";
import { getAdminHeroImageById } from "@/lib/services/admin/adminHeroCarouselService";

export const metadata: Metadata = {
  title: "Edit Hero Image | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

interface EditHeroImagePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHeroImagePage({
  params,
}: EditHeroImagePageProps) {
  const { id } = await params;
  const image = await getAdminHeroImageById(id);
  if (!image) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Edit Hero Image"
        description={image.altText || "Homepage hero carousel slide"}
      />
      <HeroImageForm mode="edit" imageId={image.id} initialValues={image} />
    </div>
  );
}
