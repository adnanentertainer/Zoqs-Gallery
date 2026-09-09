"use client";

import { Container } from "@/components/ui/Container";
import { ProductGridError } from "@/components/product/ProductGridError";

export default function CheckoutError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Container className="py-16">
      <ProductGridError
        title="Unable to load checkout"
        description="Something went wrong loading checkout. Your cart has not been affected — please try again."
        onRetry={retry}
      />
    </Container>
  );
}
