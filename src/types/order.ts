export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "cod" | "bank_transfer" | "easypaisa" | "jazzcash";

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  productPrice: number;
  quantity: number;
  lineTotal: number;
  productImageUrl: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  shippingAddress: ShippingAddress;
  customerNotes: string | null;
  createdAt: string;
  items: OrderItem[];
}

/** Minimal cart line shape sent to the server for order creation — the
 * server independently resolves each slug to a product, validates it, and
 * calculates prices; the client never supplies a price or total. */
export interface CheckoutCartLine {
  productSlug: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
}
