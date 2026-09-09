"use client";

import { Container } from "@/components/ui/Container";
import { ProductGridError } from "@/components/product/ProductGridError";

export default function OrderConfirmationError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Container className="py-16">
      <ProductGridError
        title="Unable to load this order"
        description="Something went wrong loading your order. Please try again."
        onRetry={retry}
      />
    </Container>
  );
}
