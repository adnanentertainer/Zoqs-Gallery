import { Button } from "@/components/ui/Button";
import type { PaymentMethod } from "@/types/order";

interface PlaceOrderButtonProps {
  paymentMethod: PaymentMethod | null;
  isSubmitting: boolean;
  disabled: boolean;
}

export function PlaceOrderButton({
  paymentMethod,
  isSubmitting,
  disabled,
}: PlaceOrderButtonProps) {
  const label =
    paymentMethod === "cod" ? "Place Order — Cash on Delivery" : "Place Order";

  return (
    <Button
      type="submit"
      variant="gold"
      size="lg"
      className="w-full"
      isLoading={isSubmitting}
      disabled={disabled || isSubmitting}
    >
      {label}
    </Button>
  );
}
