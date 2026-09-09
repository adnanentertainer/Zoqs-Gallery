import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { OrderConfirmation } from "@/components/checkout";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getOrderByOrderNumber } from "@/lib/services/orderService";

export const metadata: Metadata = {
  title: "Order Confirmation | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

interface OrderConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { orderNumber } = await params;

  const user = await getServerUser();
  if (!user) {
    redirect(`/login?redirect=/order-confirmation/${orderNumber}`);
  }

  // getOrderByOrderNumber relies on RLS ("Users can read own orders"), so an
  // order number that belongs to someone else resolves to null exactly like
  // one that doesn't exist at all — this route never reveals which case it
  // is, only ever a plain 404.
  const order = await getOrderByOrderNumber(orderNumber);
  if (!order) {
    notFound();
  }

  return (
    <Container className="py-10">
      <OrderConfirmation order={order} />
    </Container>
  );
}
