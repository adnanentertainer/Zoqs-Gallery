import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Typography";
import { CheckoutForm } from "@/components/checkout";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapProfileRow } from "@/lib/supabase/mappers";
import { getShippingSettings } from "@/lib/checkout/getShippingSettings";

export const metadata: Metadata = {
  title: "Checkout | ZOQ's Gallery",
  description: "Complete your ZOQ's Gallery order.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Defense in depth: src/proxy.ts already redirects unauthenticated visitors
  // away from /checkout before this page runs, but protected content must
  // never depend on client-only hiding, so this server-side check stands on
  // its own too (same pattern as /account).
  const user = await getServerUser();
  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  const supabase = await getSupabaseServerClient();
  const [{ data: profileRow }, shippingSettings] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    getShippingSettings(),
  ]);
  const profile = profileRow ? mapProfileRow(profileRow) : null;

  return (
    <Container className="flex flex-col gap-6 py-10">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Checkout" }]}
      />
      <Heading variant="h1" as="h1">
        Checkout
      </Heading>

      <CheckoutForm
        initialShipping={{
          fullName: profile?.fullName ?? "",
          email: user.email ?? "",
          phone: profile?.phone ?? "",
        }}
        shippingSettings={shippingSettings}
      />
    </Container>
  );
}
