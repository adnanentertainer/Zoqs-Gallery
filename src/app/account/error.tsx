"use client";

import { Container } from "@/components/ui/Container";
import { ProductGridError } from "@/components/product/ProductGridError";

export default function AccountError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Container className="py-16">
      <ProductGridError
        title="Unable to load your account"
        description="Something went wrong. Please try again."
        onRetry={retry}
      />
    </Container>
  );
}
