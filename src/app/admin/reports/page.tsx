import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";
import { formatPrice, cn } from "@/lib/utils";
import { movementTypeLabel, movementTypeVariant, MOVEMENT_TYPE_OPTIONS } from "@/lib/admin/movementTypes";
import {
  getCurrentStockReport,
  getInventoryValueReport,
  getLowStockReport,
  getOutOfStockReport,
  getSalesReport,
  getStockMovementReport,
} from "@/lib/services/admin/reportService";
import { listProductOptions } from "@/lib/services/admin/adminProductService";
import { listAdminCategories } from "@/lib/services/admin/adminCategoryService";
import { listSupplierOptions } from "@/lib/services/admin/supplierService";
import { parseEnumParam, toFlatSearchParams, type RawSearchParams } from "@/lib/admin/searchParams";
import type { MovementType, ReportType, StockReportRow } from "@/types/admin";
import type { ReportCsvFilters } from "@/app/admin/reports/actions";

export const metadata: Metadata = {
  title: "Reports | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

const REPORT_TABS: { type: ReportType; label: string }[] = [
  { type: "current-stock", label: "Current Stock" },
  { type: "low-stock", label: "Low Stock" },
  { type: "out-of-stock", label: "Out of Stock" },
  { type: "movements", label: "Stock Movement" },
  { type: "sales", label: "Sales" },
  { type: "inventory-value", label: "Inventory Value" },
];

const STOCK_REPORT_TYPES: ReportType[] = [
  "current-stock",
  "low-stock",
  "out-of-stock",
  "inventory-value",
];

function dateToEndOfDay(date: string | undefined): string | undefined {
  return date ? `${date}T23:59:59` : undefined;
}

function StockTable({ rows, showValue }: { rows: StockReportRow[]; showValue: boolean }) {
  if (rows.length === 0) {
    return (
      <Text variant="bodySm" className="p-6 text-muted">
        No products match these filters.
      </Text>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left">
        <thead>
          <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
            <th className="px-5 py-3 font-medium">Product</th>
            <th className="px-5 py-3 font-medium">Category</th>
            <th className="px-5 py-3 font-medium">Stock</th>
            <th className="px-5 py-3 font-medium">Min / Max</th>
            <th className="px-5 py-3 font-medium">Status</th>
            {showValue && <th className="px-5 py-3 font-medium">Stock Value</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.productId} className="border-b border-beige last:border-b-0">
              <td className="px-5 py-3">
                <span className="font-body text-sm font-medium text-primary">{row.name}</span>
                {row.sku && <span className="ml-2 font-body text-xs text-muted">{row.sku}</span>}
              </td>
              <td className="px-5 py-3 font-body text-sm text-muted">{row.categoryName}</td>
              <td className="px-5 py-3 font-body text-sm text-primary">{row.stock}</td>
              <td className="px-5 py-3 font-body text-sm text-muted">
                {row.minStockLevel} / {row.maxStockLevel ?? "—"}
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={row.stockStatus} />
              </td>
              {showValue && (
                <td className="px-5 py-3 font-body text-sm text-primary">
                  {row.stockValue !== null ? formatPrice(row.stockValue) : "—"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const flat = toFlatSearchParams(await searchParams);
  const type = parseEnumParam<ReportType>(
    flat.type,
    REPORT_TABS.map((tab) => tab.type),
  ) ?? "current-stock";

  const [products, categories, suppliers] = await Promise.all([
    listProductOptions(),
    listAdminCategories(),
    listSupplierOptions(),
  ]);

  const stockFilters = { categoryId: flat.category, supplierId: flat.supplier };
  const movementFilters = {
    productId: flat.product,
    categoryId: flat.category,
    movementType: parseEnumParam<MovementType>(
      flat.movementType,
      MOVEMENT_TYPE_OPTIONS.map((option) => option.value),
    ),
    dateFrom: flat.from,
    dateTo: dateToEndOfDay(flat.to),
  };
  const salesFilters = {
    productId: flat.product,
    categoryId: flat.category,
    dateFrom: flat.from,
    dateTo: dateToEndOfDay(flat.to),
  };

  const csvFilters = {
    categoryId: flat.category,
    supplierId: flat.supplier,
    productId: flat.product,
    movementType: movementFilters.movementType,
    dateFrom: flat.from,
    dateTo: flat.to,
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Reports"
        description="Stock, movement, sales, and value reports across your catalog."
      />

      <div className="flex flex-wrap gap-2 border-b border-beige pb-3">
        {REPORT_TABS.map((tab) => (
          <Link
            key={tab.type}
            href={`/admin/reports?type=${tab.type}`}
            className={cn(
              "rounded-full border px-4 py-2 font-body text-sm font-medium transition-colors",
              tab.type === type
                ? "border-gold bg-gold text-white"
                : "border-beige text-primary hover:border-gold",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {STOCK_REPORT_TYPES.includes(type) && (
        <form
          method="GET"
          className="grid grid-cols-1 gap-3 rounded-sm border border-beige bg-white p-4 sm:grid-cols-4"
        >
          <input type="hidden" name="type" value={type} />
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
            <label htmlFor="supplier" className="font-body text-sm font-medium text-primary">
              Supplier
            </label>
            <select
              id="supplier"
              name="supplier"
              defaultValue={flat.supplier ?? ""}
              className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="">All suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-3">
            <Button type="submit" variant="primary" size="md">
              Apply Filters
            </Button>
            <Link
              href={`/admin/reports?type=${type}`}
              className={buttonVariants("outline", "md")}
            >
              Reset
            </Link>
          </div>
        </form>
      )}

      {(type === "movements" || type === "sales") && (
        <form
          method="GET"
          className="grid grid-cols-1 gap-3 rounded-sm border border-beige bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <input type="hidden" name="type" value={type} />
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
          {type === "movements" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="movementType" className="font-body text-sm font-medium text-primary">
                Movement Type
              </label>
              <select
                id="movementType"
                name="movementType"
                defaultValue={flat.movementType ?? ""}
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
          )}
          <Input label="From Date" type="date" name="from" defaultValue={flat.from ?? ""} />
          <Input label="To Date" type="date" name="to" defaultValue={flat.to ?? ""} />
          <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-5">
            <Button type="submit" variant="primary" size="md">
              Apply Filters
            </Button>
            <Link
              href={`/admin/reports?type=${type}`}
              className={buttonVariants("outline", "md")}
            >
              Reset
            </Link>
          </div>
        </form>
      )}

      <div className="rounded-sm border border-beige bg-white">
        {type === "current-stock" && (
          <ReportBody exportSlot={<ExportCsvButton type={type} filters={csvFilters} />}>
            <StockTable rows={await getCurrentStockReport(stockFilters)} showValue={false} />
          </ReportBody>
        )}
        {type === "low-stock" && (
          <ReportBody exportSlot={<ExportCsvButton type={type} filters={csvFilters} />}>
            <StockTable rows={await getLowStockReport(stockFilters)} showValue={false} />
          </ReportBody>
        )}
        {type === "out-of-stock" && (
          <ReportBody exportSlot={<ExportCsvButton type={type} filters={csvFilters} />}>
            <StockTable rows={await getOutOfStockReport(stockFilters)} showValue={false} />
          </ReportBody>
        )}
        {type === "inventory-value" && (
          <InventoryValueReport filters={stockFilters} csvFilters={csvFilters} type={type} />
        )}
        {type === "movements" && (
          <MovementsReport filters={movementFilters} csvFilters={csvFilters} type={type} />
        )}
        {type === "sales" && (
          <SalesReport filters={salesFilters} csvFilters={csvFilters} type={type} />
        )}
      </div>
    </div>
  );
}

function ReportBody({
  children,
  exportSlot,
}: {
  children: React.ReactNode;
  exportSlot: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex justify-end">{exportSlot}</div>
      <div className="-mx-5">{children}</div>
    </div>
  );
}

async function InventoryValueReport({
  filters,
  csvFilters,
  type,
}: {
  filters: { categoryId?: string; supplierId?: string };
  csvFilters: ReportCsvFilters;
  type: ReportType;
}) {
  const rows = await getInventoryValueReport(filters);
  const total = rows.reduce((sum, row) => sum + (row.stockValue ?? 0), 0);
  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-muted">
          Total value across {rows.length} product{rows.length === 1 ? "" : "s"}:{" "}
          <span className="font-semibold text-primary">{formatPrice(total)}</span>
        </p>
        <ExportCsvButton type={type} filters={csvFilters} />
      </div>
      <div className="-mx-5">
        <StockTable rows={rows} showValue />
      </div>
    </div>
  );
}

async function MovementsReport({
  filters,
  csvFilters,
  type,
}: {
  filters: {
    productId?: string;
    categoryId?: string;
    movementType?: MovementType;
    dateFrom?: string;
    dateTo?: string;
  };
  csvFilters: ReportCsvFilters;
  type: ReportType;
}) {
  const rows = await getStockMovementReport(filters);
  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-muted">
          {rows.length} movement{rows.length === 1 ? "" : "s"} matched
        </p>
        <ExportCsvButton type={type} filters={csvFilters} />
      </div>
      {rows.length === 0 ? (
        <Text variant="bodySm" className="text-muted">
          No stock movements match these filters.
        </Text>
      ) : (
        <div className="-mx-5 overflow-x-auto">
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
              {rows.map((movement) => (
                <tr key={movement.id} className="border-b border-beige last:border-b-0">
                  <td className="px-5 py-3">
                    <span className="font-body text-sm font-medium text-primary">
                      {movement.productName ?? "Deleted product"}
                    </span>
                    {movement.sku && (
                      <span className="ml-2 font-body text-xs text-muted">{movement.sku}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={movementTypeVariant(movement.movementType)}>
                      {movementTypeLabel(movement.movementType)}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 font-body text-sm text-primary">
                    {movement.quantityChange > 0 ? `+${movement.quantityChange}` : movement.quantityChange}
                  </td>
                  <td className="px-5 py-3 font-body text-sm text-muted">
                    {movement.previousQuantity} → {movement.newQuantity}
                  </td>
                  <td className="px-5 py-3 font-body text-sm text-muted">{movement.reason ?? "—"}</td>
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
    </div>
  );
}

async function SalesReport({
  filters,
  csvFilters,
  type,
}: {
  filters: { productId?: string; categoryId?: string; dateFrom?: string; dateTo?: string };
  csvFilters: ReportCsvFilters;
  type: ReportType;
}) {
  const rows = await getSalesReport(filters);
  const totalQuantity = rows.reduce((sum, row) => sum + row.quantitySold, 0);
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-muted">
          {totalQuantity} unit{totalQuantity === 1 ? "" : "s"} sold, totaling{" "}
          <span className="font-semibold text-primary">{formatPrice(totalRevenue)}</span>
        </p>
        <ExportCsvButton type={type} filters={csvFilters} />
      </div>
      {rows.length === 0 ? (
        <Text variant="bodySm" className="text-muted">
          No sales match these filters.
        </Text>
      ) : (
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead>
              <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Quantity Sold</th>
                <th className="px-5 py-3 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.productId ?? row.productName} className="border-b border-beige last:border-b-0">
                  <td className="px-5 py-3">
                    <span className="font-body text-sm font-medium text-primary">
                      {row.productName}
                    </span>
                    {row.sku && (
                      <span className="ml-2 font-body text-xs text-muted">{row.sku}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-body text-sm text-muted">{row.categoryName}</td>
                  <td className="px-5 py-3 font-body text-sm text-primary">{row.quantitySold}</td>
                  <td className="px-5 py-3 font-body text-sm text-primary">
                    {formatPrice(row.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
