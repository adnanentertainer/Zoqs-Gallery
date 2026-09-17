import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { TrackOrderForm } from "@/components/track-order/TrackOrderForm";

export const metadata: Metadata = {
  title: "Track Order | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default function TrackOrderPage() {
  return (
    <Container className="py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Heading variant="h1" as="h1">
            Track Your Order
          </Heading>
          <Text variant="body" className="text-muted">
            Enter your order number and the email or phone number you used at
            checkout.
          </Text>
        </div>
        <TrackOrderForm />
      </div>
    </Container>
  );
}
