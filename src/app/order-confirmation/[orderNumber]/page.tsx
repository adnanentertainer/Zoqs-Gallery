import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { OrderConfirmation } from "@/components/checkout";
import { getServerUser } from "@/lib/auth/getServerUser";
import {
  getGuestOrderByOrderNumber,
  getOrderByOrderNumber,
} from "@/lib/services/orderService";

export const metadata: Metadata = {
  title: "Order Confirmation | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

interface OrderConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: OrderConfirmationPageProps) {
  const { orderNumber } = await params;
  const { token } = await searchParams;

  // A guest order (no account) is fetched via its one-time guest_token
  // instead of RLS ("Users can read own orders"), which correctly denies
  // everyone once user_id is null — that's also why a signed-in visitor
  // still goes through the RLS path below rather than ever trusting a URL
  // token to identify who they are.
  const user = await getServerUser();
  const order =
    !user && token
      ? await getGuestOrderByOrderNumber(orderNumber, token)
      : await getOrderByOrderNumber(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <Container className="py-10">
      <OrderConfirmation order={order} isGuest={!user} />
    </Container>
  );
}
