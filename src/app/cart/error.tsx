"use client";

import { Container } from "@/components/ui/Container";
import { ProductGridError } from "@/components/product/ProductGridError";

export default function CartError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Container className="py-16">
      <ProductGridError
        title="Unable to load your cart"
        description="Something went wrong loading your cart. Please try again."
        onRetry={retry}
      />
    </Container>
  );
}
