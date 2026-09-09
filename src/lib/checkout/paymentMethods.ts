import type { PaymentMethod } from "@/types/order";

export interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order arrives.",
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    description: "Bank details will be provided after order confirmation.",
  },
];
