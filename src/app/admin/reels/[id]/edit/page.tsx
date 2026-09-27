import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin";
import { ReelCaptionEditForm } from "@/components/admin/ReelCaptionEditForm";
import { getProductReel } from "@/lib/services/admin/reelPostingService";

export const metadata: Metadata = {
  title: "Edit Reel Caption | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function EditReelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reel = await getProductReel(id);
  if (!reel) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Edit Reel Caption"
        description={`For "${reel.productName ?? "this product"}"`}
      />
      <ReelCaptionEditForm reel={reel} />
    </div>
  );
}
