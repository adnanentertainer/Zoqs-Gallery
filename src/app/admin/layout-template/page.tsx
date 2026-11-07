import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { LayoutTemplateForm } from "@/components/admin/LayoutTemplateForm";
import { getAdminLayoutTemplate } from "@/lib/services/admin/adminLayoutTemplateService";

export const metadata: Metadata = {
  title: "Layout | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminLayoutTemplatePage() {
  const template = await getAdminLayoutTemplate();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Layout"
        description="Pick how the homepage's Hero and Shop By Category sections are arranged -- applies site-wide the moment you save."
      />
      <LayoutTemplateForm initialTemplate={template} />
    </div>
  );
}
