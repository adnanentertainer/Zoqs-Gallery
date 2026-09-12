import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin";
import { PurchaseForm } from "@/components/admin/PurchaseForm";
import { CompletePurchaseButton } from "@/components/admin/CompletePurchaseButton";
import { getAdminPurchaseById } from "@/lib/services/admin/purchaseService";
import { listSupplierOptions } from "@/lib/services/admin/supplierService";
import { listProductOptions } from "@/lib/services/admin/adminProductService";

export const metadata: Metadata = {
  title: "Purchase | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

interface EditPurchasePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPurchasePage({ params }: EditPurchasePageProps) {
  const { id } = await params;
  const [purchase, suppliers, products] = await Promise.all([
    getAdminPurchaseById(id),
    listSupplierOptions(),
    listProductOptions(),
  ]);
  if (!purchase) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={purchase.purchaseNumber}
        description={`Supplier: ${purchase.supplierName}`}
        action={
          purchase.status === "pending" ? (
            <CompletePurchaseButton purchaseId={purchase.id} />
          ) : undefined
        }
      />
      <PurchaseForm
        mode="edit"
        purchaseId={purchase.id}
        purchaseNumber={purchase.purchaseNumber}
        status={purchase.status}
        initialValues={{
          supplierId: purchase.supplierId,
          paymentStatus: purchase.paymentStatus,
          notes: purchase.notes,
          items: purchase.items,
        }}
        suppliers={suppliers}
        products={products}
      />
    </div>
  );
}
