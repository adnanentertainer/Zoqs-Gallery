import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types/order";
import type { UserRole } from "@/types";

export interface PaginationResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export type AdminProductStatus = "active" | "inactive";
export type AdminInventoryFilter = "in-stock" | "low-stock" | "out-of-stock";
export type AdminProductSort =
  "newest" | "oldest" | "name-asc" | "name-desc" | "price-asc" | "price-desc";

export interface AdminProductFilters {
  search?: string;
  categoryId?: string;
  status?: AdminProductStatus;
  inventory?: AdminInventoryFilter;
  sort: AdminProductSort;
  page: number;
  pageSize: number;
}

export interface ProductOption {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  variants: { id: string; label: string; sku: string | null; stock: number | null }[];
}

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  categoryName: string;
  price: number;
  stock: number;
  minStockLevel: number;
  isActive: boolean;
  forceUnavailable: boolean;
  imageUrl: string | null;
  createdAt: string;
}

export interface AdminProductImageInput {
  id?: string;
  imageUrl: string;
  altText: string;
}

export interface AdminProductVariantInput {
  id?: string;
  optionType: "color" | "size" | "style";
  optionValue: string;
  priceAdjustment: number | null;
  stock: number | null;
  sku: string;
  /** Falls back to the base product's own images when left blank. */
  imageUrl: string;
  isActive: boolean;
}

export interface AdminProductInput {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  material: string;
  color: string;
  occasion: string;
  isActive: boolean;
  isFeatured: boolean;
  /** Shows the product in the storefront's "New Arrivals" section. */
  isNew: boolean;
  /** Shows the product in the storefront's "Best Sellers" section. */
  isBestSeller: boolean;
  images: AdminProductImageInput[];
  variants: AdminProductVariantInput[];
  /** Left blank to auto-generate a category-coded ID (e.g. NEC-0001). */
  sku: string;
  costPrice: number | null;
  minStockLevel: number;
  maxStockLevel: number | null;
  /**
   * Manual "pause selling" override — independent of both `isActive` (which
   * removes the product from the site entirely) and real stock. Stays
   * visible/browsable but shows "Out of Stock" and blocks purchase.
   */
  forceUnavailable: boolean;
  primarySupplierId: string | null;
}

export interface AdminProductDetail extends AdminProductInput {
  id: string;
  hasOrderHistory: boolean;
}

export interface AdminCategoryListItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
  isActive: boolean;
  displayOrder: number;
}

export interface AdminOrderFilters {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  page: number;
  pageSize: number;
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface AdminCustomerFilters {
  search?: string;
  page: number;
  pageSize: number;
}

export interface AdminCustomerListItem {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: string;
}

export interface AdminDashboardMetrics {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  /**
   * Sum of order totals, excluding cancelled orders. Named deliberately —
   * this is NOT collected/settled payment: Cash on Delivery orders may
   * still be unpaid, so this must never be presented as "revenue".
   */
  totalOrderValue: number;
  recentOrders: AdminOrderListItem[];
}

// ============================================================================
// Suppliers
// ============================================================================

export type AdminSupplierStatus = "active" | "inactive";

export interface AdminSupplierFilters {
  search?: string;
  status?: AdminSupplierStatus;
  page: number;
  pageSize: number;
}

export interface SupplierOption {
  id: string;
  name: string;
  status: AdminSupplierStatus;
}

export interface AdminSupplierListItem {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  status: AdminSupplierStatus;
  productCount: number;
  createdAt: string;
}

export interface AdminSupplierInput {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  status: AdminSupplierStatus;
}

export interface AdminSupplierDetail extends AdminSupplierInput {
  id: string;
  products: { id: string; name: string; sku: string | null; stock: number }[];
}

// ============================================================================
// Inventory movements
// ============================================================================

export type MovementType =
  | "stock_in"
  | "stock_out"
  | "sale"
  | "return"
  | "adjustment"
  | "damaged"
  | "purchase";

export interface AdminInventoryMovementFilters {
  productId?: string;
  categoryId?: string;
  movementType?: MovementType;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}

export interface AdminInventoryMovementListItem {
  id: string;
  productId: string | null;
  productName: string | null;
  sku: string | null;
  movementType: MovementType;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string | null;
  referenceNumber: string | null;
  createdByEmail: string | null;
  createdAt: string;
}

/**
 * Input for the Stock In / Stock Out / Adjust admin actions. `direction` is
 * explicit rather than inferred from `movementType`, because "adjustment"
 * alone is ambiguous — a correction can go either way. `quantity` is always
 * a positive magnitude; the service combines it with `direction` to compute
 * the signed delta the database actually needs.
 */
export interface StockAdjustmentInput {
  productId: string;
  variantId: string | null;
  movementType: MovementType;
  direction: "increase" | "decrease";
  quantity: number;
  reason: string;
  referenceNumber: string;
}

// ============================================================================
// Purchases
// ============================================================================

export type PurchaseStatus = "pending" | "completed" | "cancelled";
export type PurchasePaymentStatus = "unpaid" | "partial" | "paid";

export interface AdminPurchaseFilters {
  search?: string;
  supplierId?: string;
  status?: PurchaseStatus;
  page: number;
  pageSize: number;
}

export interface AdminPurchaseListItem {
  id: string;
  purchaseNumber: string;
  supplierName: string;
  status: PurchaseStatus;
  paymentStatus: PurchasePaymentStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

export interface AdminPurchaseItemInput {
  productId: string;
  variantId: string | null;
  productName: string;
  sku: string;
  quantity: number;
  costPrice: number;
}

export interface AdminPurchaseInput {
  supplierId: string;
  paymentStatus: PurchasePaymentStatus;
  notes: string;
  items: AdminPurchaseItemInput[];
}

export interface AdminPurchaseDetail {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseStatus;
  paymentStatus: PurchasePaymentStatus;
  totalAmount: number;
  notes: string;
  items: (AdminPurchaseItemInput & { id: string; lineTotal: number })[];
  createdAt: string;
}

// ============================================================================
// Inventory dashboard
// ============================================================================

export interface LowStockProductItem {
  id: string;
  name: string;
  sku: string | null;
  categoryName: string;
  stock: number;
  minStockLevel: number;
}

export interface AdminInventoryDashboardMetrics {
  totalProducts: number;
  totalStockQuantity: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
  recentMovements: AdminInventoryMovementListItem[];
}

// ============================================================================
// Reports
// ============================================================================

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface StockReportFilters {
  categoryId?: string;
  supplierId?: string;
}

export interface StockReportRow {
  productId: string;
  name: string;
  sku: string | null;
  categoryName: string;
  stock: number;
  minStockLevel: number;
  maxStockLevel: number | null;
  costPrice: number | null;
  price: number;
  /** null when costPrice isn't set — excluded from value totals, not zeroed. */
  stockValue: number | null;
  stockStatus: StockStatus;
  isActive: boolean;
  forceUnavailable: boolean;
}

export interface StockMovementReportFilters {
  productId?: string;
  categoryId?: string;
  movementType?: MovementType;
  dateFrom?: string;
  dateTo?: string;
}

export interface SalesReportFilters {
  productId?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SalesReportRow {
  productId: string | null;
  productName: string;
  sku: string | null;
  categoryName: string;
  quantitySold: number;
  revenue: number;
}

export type ReportType =
  | "current-stock"
  | "low-stock"
  | "out-of-stock"
  | "movements"
  | "sales"
  | "inventory-value";

export interface AdminReviewListItem {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  reviewText: string;
  reviewDate: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
}
