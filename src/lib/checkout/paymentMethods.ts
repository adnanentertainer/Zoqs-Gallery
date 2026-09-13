import { siteConfig } from "@/constants/site";
import type { PaymentMethod } from "@/types/order";

export interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
  /** Shown on the order confirmation page after the order is placed. */
  confirmationMessage: string;
  /** When set, the selector shows the current shipping cost on this option's right side. */
  showsShippingCost?: boolean;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "3-5 business working days",
    confirmationMessage:
      "Your order has been placed successfully. Please pay when your order arrives.",
    showsShippingCost: true,
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    description: "Bank details will be provided after order confirmation.",
    confirmationMessage:
      "Your order has been received. Bank transfer instructions will be provided separately.",
  },
  {
    value: "easypaisa",
    label: "Easypaisa",
    description: `Send payment to ${siteConfig.mobileWalletNumber} (Easypaisa) and share the receipt with your order number.`,
    confirmationMessage: `Your order has been received. Send payment to ${siteConfig.mobileWalletNumber} via Easypaisa and share the receipt referencing your order number.`,
  },
  {
    value: "jazzcash",
    label: "JazzCash",
    description: `Send payment to ${siteConfig.mobileWalletNumber} (JazzCash) and share the receipt with your order number.`,
    confirmationMessage: `Your order has been received. Send payment to ${siteConfig.mobileWalletNumber} via JazzCash and share the receipt referencing your order number.`,
  },
];
