import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="font-heading text-5xl font-semibold text-gold">404</span>
      <Heading variant="h2" as="h1">
        Page Not Found
      </Heading>
      <Text variant="body" className="max-w-md text-muted">
        We couldn&apos;t find the page you were looking for. It may have moved
        or no longer exists.
      </Text>
      <Link href="/shop" className={buttonVariants("primary", "lg")}>
        Continue Shopping
      </Link>
    </Container>
  );
}
