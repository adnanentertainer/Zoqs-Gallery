import type { Metadata } from "next";
import { AdminPageHeader, Pagination } from "@/components/admin";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { StockMovementForm } from "@/components/admin/StockMovementForm";
import { listInventoryMovements } from "@/lib/services/admin/inventoryService";
import { listProductOptions } from "@/lib/services/admin/adminProductService";
import { listAdminCategories } from "@/lib/services/admin/adminCategoryService";
import { MOVEMENT_TYPE_OPTIONS, movementTypeLabel, movementTypeVariant } from "@/lib/admin/movementTypes";
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  parseEnumParam,
  parsePage,
  toFlatSearchParams,
  type RawSearchParams,
} from "@/lib/admin/searchParams";
import type { MovementType } from "@/types/admin";

export const metadata: Metadata = {
  title: "Stock Movements | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminInventoryMovementsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;
  const flat = toFlatSearchParams(rawParams);

  const filters = {
    productId: flat.product,
    categoryId: flat.category,
    movementType: parseEnumParam<MovementType>(
      flat.type,
      MOVEMENT_TYPE_OPTIONS.map((option) => option.value),
    ),
    dateFrom: flat.from || undefined,
    dateTo: flat.to ? `${flat.to}T23:59:59` : undefined,
    page: parsePage(flat.page),
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
  };

  const [result, products, categories] = await Promise.all([
    listInventoryMovements(filters),
    listProductOptions(),
    listAdminCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Stock Movements"
        description={`${result.totalCount} movement${result.totalCount === 1 ? "" : "s"} total`}
      />

      <StockMovementForm products={products} />

      <form
        method="GET"
        className="grid grid-cols-1 gap-3 rounded-sm border border-beige bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product" className="font-body text-sm font-medium text-primary">
            Product
          </label>
          <select
            id="product"
            name="product"
            defaultValue={flat.product ?? ""}
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">All products</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="font-body text-sm font-medium text-primary">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={flat.category ?? ""}
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="type" className="font-body text-sm font-medium text-primary">
            Movement Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={flat.type ?? ""}
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">All types</option>
            {MOVEMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="From Date"
          type="date"
          name="from"
          defaultValue={flat.from ?? ""}
        />
        <Input label="To Date" type="date" name="to" defaultValue={flat.to ?? ""} />
        <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-5">
          <Button type="submit" variant="primary" size="md">
            Apply Filters
          </Button>
          <a
            href="/admin/inventory/movements"
            className={buttonVariants("outline", "md")}
          >
            Reset
          </a>
        </div>
      </form>

      <div className="rounded-sm border border-beige bg-white">
        {result.items.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No stock movements match these filters.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Change</th>
                  <th className="px-5 py-3 font-medium">Prev → New</th>
                  <th className="px-5 py-3 font-medium">Reason</th>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">By</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((movement) => (
                  <tr key={movement.id} className="border-b border-beige last:border-b-0">
                    <td className="px-5 py-3">
                      <span className="font-body text-sm font-medium text-primary">
                        {movement.productName ?? "Deleted product"}
                      </span>
                      {movement.sku && (
                        <span className="ml-2 font-body text-xs text-muted">
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
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {movement.previousQuantity} → {movement.newQuantity}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {movement.reason ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {movement.referenceNumber ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {movement.createdByEmail ?? "System"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {new Date(movement.createdAt).toLocaleString("en-PK")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 pb-5">
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/inventory/movements"
            searchParams={flat}
          />
        </div>
      </div>
    </div>
  );
}
