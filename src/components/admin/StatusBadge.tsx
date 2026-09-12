import { Badge, type BadgeVariant } from "@/components/ui/Badge";

export type StatusBadgeValue =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "paid"
  | "failed"
  | "refunded"
  | "active"
  | "inactive"
  | "in-stock"
  | "low-stock"
  | "out-of-stock"
  | "completed"
  | "unpaid"
  | "partial";

const STATUS_CONFIG: Record<
  StatusBadgeValue,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "outline" },
  processing: { label: "Processing", variant: "gold" },
  shipped: { label: "Shipped", variant: "gold" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
  paid: { label: "Paid", variant: "success" },
  failed: { label: "Failed", variant: "error" },
  refunded: { label: "Refunded", variant: "outline" },
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "default" },
  "in-stock": { label: "In Stock", variant: "success" },
  "low-stock": { label: "Low Stock", variant: "warning" },
  "out-of-stock": { label: "Out of Stock", variant: "error" },
  completed: { label: "Completed", variant: "success" },
  unpaid: { label: "Unpaid", variant: "error" },
  partial: { label: "Partial", variant: "warning" },
};

export function StatusBadge({ status }: { status: StatusBadgeValue }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
