import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { PurchaseForm } from "@/components/admin/PurchaseForm";
import { listSupplierOptions } from "@/lib/services/admin/supplierService";
import { listProductOptions } from "@/lib/services/admin/adminProductService";

export const metadata: Metadata = {
  title: "New Purchase | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function NewPurchasePage() {
  const [suppliers, products] = await Promise.all([
    listSupplierOptions(),
    listProductOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="New Purchase"
        description="Record a new purchase order from a supplier."
      />
      <PurchaseForm mode="create" suppliers={suppliers} products={products} />
    </div>
  );
}
