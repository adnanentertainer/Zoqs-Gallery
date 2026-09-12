import type { BadgeVariant } from "@/components/ui/Badge";
import type { MovementType } from "@/types/admin";

export const MOVEMENT_TYPE_OPTIONS: { value: MovementType; label: string }[] = [
  { value: "stock_in", label: "Stock In" },
  { value: "stock_out", label: "Stock Out" },
  { value: "sale", label: "Sale" },
  { value: "return", label: "Return" },
  { value: "adjustment", label: "Adjustment" },
  { value: "damaged", label: "Damaged" },
  { value: "purchase", label: "Purchase" },
];

const MOVEMENT_TYPE_VARIANTS: Record<MovementType, BadgeVariant> = {
  stock_in: "success",
  stock_out: "error",
  sale: "error",
  return: "gold",
  adjustment: "outline",
  damaged: "error",
  purchase: "success",
};

export function movementTypeLabel(type: MovementType): string {
  return (
    MOVEMENT_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
    type
  );
}

export function movementTypeVariant(type: MovementType): BadgeVariant {
  return MOVEMENT_TYPE_VARIANTS[type];
}
