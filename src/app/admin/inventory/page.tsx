import type { Metadata } from "next";
import Link from "next/link";
import { Package, Boxes, AlertTriangle, XCircle, Wallet } from "lucide-react";
import { AdminPageHeader, StatusBadge } from "@/components/admin";
import { MetricCard } from "@/components/admin/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";
import {
  getInventoryDashboardMetrics,
  listLowStockProducts,
} from "@/lib/services/admin/inventoryService";
import { movementTypeLabel, movementTypeVariant } from "@/lib/admin/movementTypes";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Inventory | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminInventoryPage() {
  const [metrics, lowStockProducts] = await Promise.all([
    getInventoryDashboardMetrics(),
    listLowStockProducts(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Inventory"
        description="Stock levels, movements, and value across your catalog."
        action={
          <Link
            href="/admin/inventory/movements"
            className={buttonVariants("primary", "md")}
          >
            Record Stock Movement
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Total Products"
          value={String(metrics.totalProducts)}
          icon={Package}
        />
        <MetricCard
          label="Total Stock Quantity"
          value={String(metrics.totalStockQuantity)}
          icon={Boxes}
        />
        <MetricCard
          label="Low Stock Products"
          value={String(metrics.lowStockCount)}
          icon={AlertTriangle}
        />
        <MetricCard
          label="Out of Stock Products"
          value={String(metrics.outOfStockCount)}
          icon={XCircle}
        />
        <MetricCard
          label="Total Inventory Value"
          value={formatPrice(metrics.totalInventoryValue)}
          icon={Wallet}
        />
      </div>
      <Text variant="caption" className="-mt-4">
        Inventory value sums cost price × current stock for products with a
        cost price set — products without one aren&rsquo;t counted.
      </Text>

      <div className="rounded-sm border border-beige bg-white">
        <div className="flex items-center justify-between border-b border-beige p-5">
          <h2 className="font-heading text-lg font-semibold text-primary">
            Low Stock &amp; Out of Stock Alerts
          </h2>
          <Link
            href="/admin/products?inventory=low-stock"
            className="font-body text-sm font-medium text-gold hover:underline"
          >
            View all products
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <Text variant="bodySm" className="p-5 text-muted">
            Nothing is low on stock right now.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Min. Level</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-beige last:border-b-0"
                  >
                    <td className="px-5 py-3">
                      <span className="font-body text-sm font-medium text-primary">
                        {product.name}
                      </span>
                      {product.sku && (
                        <span className="ml-2 font-body text-xs text-muted">
                          {product.sku}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {product.categoryName}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-primary">
                      {product.stock}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {product.minStockLevel}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={product.stock === 0 ? "out-of-stock" : "low-stock"}
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-body text-sm font-medium text-gold hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-sm border border-beige bg-white">
        <div className="flex items-center justify-between border-b border-beige p-5">
          <h2 className="font-heading text-lg font-semibold text-primary">
            Recent Stock Movements
          </h2>
          <Link
            href="/admin/inventory/movements"
            className="font-body text-sm font-medium text-gold hover:underline"
          >
            View all
          </Link>
        </div>

        {metrics.recentMovements.length === 0 ? (
          <Text variant="bodySm" className="p-5 text-muted">
            No stock movements yet.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Change</th>
                  <th className="px-5 py-3 font-medium">New Qty</th>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentMovements.map((movement) => (
                  <tr
                    key={movement.id}
                    className="border-b border-beige last:border-b-0"
                  >
                    <td className="px-5 py-3 font-body text-sm font-medium text-primary">
                      {movement.productName ?? "Deleted product"}
                      {movement.sku && (
                        <span className="ml-2 font-body text-xs font-normal text-muted">
                          {movement.sku}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={movementTypeVariant(movement.movementType)}>
                        {movementTypeLabel(movement.movementType)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-primary">
                      {movement.quantityChange > 0
                        ? `+${movement.quantityChange}`
                        : movement.quantityChange}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-primary">
                      {movement.newQuantity}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {movement.referenceNumber ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {new Date(movement.createdAt).toLocaleDateString("en-PK")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
