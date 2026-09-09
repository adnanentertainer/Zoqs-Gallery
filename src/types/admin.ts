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

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  price: number;
  stock: number;
  isActive: boolean;
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
  images: AdminProductImageInput[];
  variants: AdminProductVariantInput[];
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
