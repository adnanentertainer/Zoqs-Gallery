import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { WhatsAppStatusCard } from "@/components/admin/WhatsAppStatusCard";
import { Text } from "@/components/ui/Typography";
import { listPendingWhatsAppStatusItems } from "@/lib/services/admin/whatsappStatusService";

export const metadata: Metadata = {
  title: "WhatsApp Status | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminWhatsAppStatusPage() {
  const items = await listPendingWhatsAppStatusItems();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="WhatsApp Status"
        description={`${items.length} item${items.length === 1 ? "" : "s"} ready to post — new arrivals and price changes queue up here automatically`}
      />

      {items.length === 0 ? (
        <div className="rounded-sm border border-beige bg-white p-6">
          <Text variant="bodySm" className="text-muted">
            Nothing waiting right now. Adding a product or changing an active
            product&apos;s price will queue a new item here.
          </Text>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <WhatsAppStatusCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
