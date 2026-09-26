import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { ReelForm } from "@/components/admin/ReelForm";
import { listReelProductOptions } from "@/lib/services/admin/reelPostingService";

export const metadata: Metadata = {
  title: "Publish Reel | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function NewReelPage() {
  const products = await listReelProductOptions();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Publish Reel"
        description="Publish an already-made Reel video to Facebook and Instagram, tagged to a product."
      />
      <ReelForm products={products} />
    </div>
  );
}
