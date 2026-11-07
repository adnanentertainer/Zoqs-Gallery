import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { HeroImageForm } from "@/components/admin/HeroImageForm";

export const metadata: Metadata = {
  title: "Add Hero Image | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default function NewHeroImagePage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Add Hero Image"
        description="Add a slide to the homepage hero carousel."
      />
      <HeroImageForm mode="create" />
    </div>
  );
}
