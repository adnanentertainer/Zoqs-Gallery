import { CheckCircle2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/checkout/paymentMethods";
import type { PaymentMethod } from "@/types/order";

interface PaymentMethodSelectorProps {
  value: PaymentMethod | null;
  onChange: (value: PaymentMethod) => void;
  error?: string;
  shippingCost: number;
}

export function PaymentMethodSelector({
  value,
  onChange,
  error,
  shippingCost,
}: PaymentMethodSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 font-body text-sm font-medium text-primary">
        Payment Method
      </legend>
      {PAYMENT_METHODS.map((method) => {
        const selected = value === method.value;
        return (
          <label
            key={method.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-sm border p-4 transition-colors",
              selected
                ? "border-gold bg-gold/5"
                : "border-beige hover:border-primary/30",
            )}
          >
            <input
              type="radio"
              name="payment-method"
              value={method.value}
              checked={selected}
              onChange={() => onChange(method.value)}
              className="mt-1 h-4 w-4 shrink-0 accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            />
            <span className="flex flex-1 items-center justify-between gap-3">
              <span className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 font-body text-sm font-medium text-primary">
                  {method.label}
                  {selected && (
                    <CheckCircle2
                      className="h-4 w-4 text-gold"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span className="font-body text-sm text-muted">
                  {method.description}
                </span>
              </span>
              {method.showsShippingCost && (
                <span className="whitespace-nowrap font-body text-sm font-semibold text-primary">
                  {formatPrice(shippingCost)}
                </span>
              )}
            </span>
          </label>
        );
      })}
      {error && <p className="font-body text-xs text-error">{error}</p>}
    </fieldset>
  );
}
