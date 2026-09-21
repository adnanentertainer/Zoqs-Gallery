"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthMessage } from "@/components/auth";
import { EmptyState } from "@/components/product";
import {
  ShippingAddressForm,
  type ShippingFieldErrors,
} from "@/components/checkout/ShippingAddressForm";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import {
  PromoCodeInput,
  type AppliedPromo,
} from "@/components/checkout/PromoCodeInput";
import { PlaceOrderButton } from "@/components/checkout/PlaceOrderButton";
import { useCart } from "@/context/CartContext";
import { getVariantSummaryLabel } from "@/lib/cart";
import { consumePendingPromoCode } from "@/lib/pendingPromo";
import { placeOrder } from "@/app/checkout/actions";
import {
  validateAddressLine1,
  validateCity,
  validateCustomerNotes,
  validateEmail,
  validateFullName,
  validatePakistaniPhone,
  validateProvince,
  CUSTOMER_NOTES_MAX_LENGTH,
} from "@/lib/checkout/validation";
import {
  calculateShippingCost,
  type ShippingSettings,
} from "@/lib/checkout/shipping";
import type { PaymentMethod, ShippingAddress } from "@/types/order";

interface CheckoutFormProps {
  initialShipping: Pick<ShippingAddress, "fullName" | "email" | "phone">;
  shippingSettings: ShippingSettings;
}

export function CheckoutForm({
  initialShipping,
  shippingSettings,
}: CheckoutFormProps) {
  const router = useRouter();
  const cart = useCart();

  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: initialShipping.fullName,
    email: initialShipping.email,
    phone: initialShipping.phone,
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Pakistan",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [customerNotes, setCustomerNotes] = useState("");
  const [errors, setErrors] = useState<ShippingFieldErrors>({});
  const [paymentError, setPaymentError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [pendingPromoCode, setPendingPromoCode] = useState("");

  // A banner CTA carries its linked code through as a pre-filled field only
  // — never auto-applied — so the customer still sees and confirms the
  // discount before it affects their total (see PromoBannerCarousel). This
  // has to be an effect (not a lazy useState initializer) since it reads
  // localStorage, which isn't available during server rendering.
  useEffect(() => {
    const code = consumePendingPromoCode();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (code) setPendingPromoCode(code);
  }, []);

  if (cart.lineItems.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add something you love before checking out."
        actionLabel="Continue Shopping"
        actionHref="/shop"
      />
    );
  }

  function updateField(field: keyof ShippingAddress, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors: ShippingFieldErrors = {
      fullName: validateFullName(shipping.fullName),
      email: validateEmail(shipping.email),
      phone: validatePakistaniPhone(shipping.phone),
      addressLine1: validateAddressLine1(shipping.addressLine1),
      city: validateCity(shipping.city),
      province: validateProvince(shipping.province),
    };
    const notesError = validateCustomerNotes(customerNotes);
    const nextPaymentError = paymentMethod
      ? undefined
      : "Select a payment method.";

    setErrors(nextErrors);
    setPaymentError(nextPaymentError);
    setFormError(notesError ?? null);

    const hasFieldErrors = Object.values(nextErrors).some(Boolean);
    if (hasFieldErrors || nextPaymentError || notesError || !paymentMethod) {
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const result = await placeOrder({
      items: cart.lineItems.map((item) => ({
        productSlug: item.productSlug,
        quantity: item.quantity,
        selectedVariants: item.selectedVariants,
      })),
      paymentMethod,
      shipping,
      customerNotes,
      promoCode: appliedPromo?.code,
    });

    if (result.error || !result.orderNumber) {
      setIsSubmitting(false);
      setFormError(result.error ?? "Something went wrong. Please try again.");
      // create_order() is the final authority on the code's validity — if it
      // rejected the code (expired/limit hit in the moment between Apply and
      // Submit), clear it here so the customer can retry without it blocking
      // checkout, rather than resubmitting the same now-invalid code.
      if (result.error?.toLowerCase().includes("promo code")) {
        setAppliedPromo(null);
      }
      return;
    }

    cart.clearCart();
    const confirmationUrl = result.guestToken
      ? `/order-confirmation/${result.orderNumber}?token=${result.guestToken}`
      : `/order-confirmation/${result.orderNumber}`;
    router.push(confirmationUrl);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start"
    >
      <div className="flex flex-col gap-8 lg:col-span-2">
        {formError && <AuthMessage variant="error" message={formError} />}

        <section className="flex flex-col gap-4 rounded-sm border border-beige p-6">
          <h2 className="font-heading text-lg font-semibold text-primary">
            Shipping Address
          </h2>
          <ShippingAddressForm
            values={shipping}
            errors={errors}
            onChange={updateField}
          />
        </section>

        <section className="rounded-sm border border-beige p-6">
          <PaymentMethodSelector
            value={paymentMethod}
            onChange={(method) => {
              setPaymentMethod(method);
              setPaymentError(undefined);
            }}
            error={paymentError}
            shippingCost={calculateShippingCost(cart.subtotal, shippingSettings)}
          />
        </section>

        <section className="flex flex-col gap-2 rounded-sm border border-beige p-6">
          <label
            htmlFor="customerNotes"
            className="font-body text-sm font-medium text-primary"
          >
            Order Notes (optional)
          </label>
          <textarea
            id="customerNotes"
            name="customerNotes"
            rows={3}
            maxLength={CUSTOMER_NOTES_MAX_LENGTH}
            placeholder="e.g. Please call before delivery."
            value={customerNotes}
            onChange={(event) => setCustomerNotes(event.target.value)}
            className="w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary placeholder:text-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </section>

        <div className="hidden lg:block">
          <PlaceOrderButton
            paymentMethod={paymentMethod}
            isSubmitting={isSubmitting}
            disabled={false}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-24">
        <div className="rounded-sm border border-beige p-6">
          <PromoCodeInput
            subtotal={cart.subtotal}
            email={shipping.email}
            appliedPromo={appliedPromo}
            onApply={setAppliedPromo}
            onRemove={() => setAppliedPromo(null)}
            initialCode={pendingPromoCode}
          />
        </div>
        <OrderSummary
          items={cart.lineItems.map((item) => ({
            key: item.key,
            imageUrl: item.product.images[0] ?? null,
            name: item.product.name,
            variantLabel: getVariantSummaryLabel(
              item.product,
              item.selectedVariants,
            ),
            quantity: item.quantity,
            lineTotal: item.lineSubtotal,
          }))}
          subtotal={cart.subtotal}
          shippingSettings={shippingSettings}
          discountAmount={appliedPromo?.discountAmount}
          promoCode={appliedPromo?.code}
        />
        <div className="lg:hidden">
          <PlaceOrderButton
            paymentMethod={paymentMethod}
            isSubmitting={isSubmitting}
            disabled={false}
          />
        </div>
      </div>
    </form>
  );
}
