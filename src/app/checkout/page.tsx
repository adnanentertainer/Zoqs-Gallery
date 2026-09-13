import type { Metadata } from "next";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Typography";
import { CheckoutForm } from "@/components/checkout";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapProfileRow } from "@/lib/supabase/mappers";
import { getShippingSettings } from "@/lib/checkout/getShippingSettings";
import type { ShippingSettings } from "@/lib/checkout/shipping";

export const metadata: Metadata = {
  title: "Checkout | ZOQ's Gallery",
  description: "Complete your ZOQ's Gallery order.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Guest checkout is allowed — /checkout/start offers Log In / Create
  // Account / Continue as Guest, and this page itself works for either.
  const user = await getServerUser();

  let profile = null;
  let shippingSettings: ShippingSettings;
  if (user) {
    const supabase = await getSupabaseServerClient();
    const [{ data: profileRow }, settings] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      getShippingSettings(),
    ]);
    profile = profileRow ? mapProfileRow(profileRow) : null;
    shippingSettings = settings;
  } else {
    shippingSettings = await getShippingSettings();
  }

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
          email: user?.email ?? "",
          phone: profile?.phone ?? "",
        }}
        shippingSettings={shippingSettings}
      />
    </Container>
  );
}
